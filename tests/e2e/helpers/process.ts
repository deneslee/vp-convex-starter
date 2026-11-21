// fallow-ignore-file unused-file
import { type ChildProcess, spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export interface CmdOptions {
  readonly cwd?: string;
  readonly env?: Record<string, string | undefined>;
  readonly timeoutMs?: number;
}

export interface CmdResult {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
  readonly durationMs: number;
  readonly timedOut: boolean;
}

export interface DevStackOptions {
  readonly command: string;
  readonly args: readonly string[];
  readonly cwd: string;
  readonly env?: Record<string, string | undefined>;
  readonly readyUrl: string;
  readonly timeoutMs?: number;
}

export interface DevStackHandle {
  readonly baseUrl: string;
  stop(): Promise<void>;
  getLogs(): string;
}

const MAX_CAPTURE_BYTES = 2 * 1024 * 1024;
const MAX_LOG_CHARS = 32_000;

export function killProcessTree(pid: number): void {
  if (!Number.isInteger(pid) || pid <= 0) {
    return;
  }
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], {
      shell: false,
      stdio: 'ignore',
    });
    return;
  }
  try {
    process.kill(-pid, 'SIGKILL');
  } catch {
    try {
      process.kill(pid, 'SIGKILL');
    } catch {
      // Process may have already exited
    }
  }
}

function resolveSpawnTarget(
  command: string,
  args: readonly string[]
): { executable: string; finalArgs: readonly string[] } {
  const lower = command.toLowerCase();
  if (process.platform === 'win32' && (lower.endsWith('.cmd') || lower.endsWith('.bat'))) {
    const comspec = process.env.ComSpec ?? 'cmd.exe';
    return {
      executable: comspec,
      finalArgs: ['/d', '/s', '/c', command, ...args],
    };
  }
  return { executable: command, finalArgs: args };
}

function appendBounded(current: string, chunk: string, limit: number): string {
  const combined = current + chunk;
  if (combined.length <= limit) {
    return combined;
  }
  return combined.slice(combined.length - limit);
}

export function runCmd(
  command: string,
  args: readonly string[],
  options?: CmdOptions
): Promise<CmdResult> {
  const startedAt = Date.now();
  const timeoutMs = options?.timeoutMs ?? 120_000;
  const { executable, finalArgs } = resolveSpawnTarget(command, args);

  return new Promise((resolvePromise) => {
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let settled = false;

    const child = spawn(executable, finalArgs, {
      cwd: options?.cwd,
      env: options?.env ? { ...process.env, ...options.env } : process.env,
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const timer = setTimeout(() => {
      timedOut = true;
      if (child.pid !== undefined) {
        killProcessTree(child.pid);
      }
    }, timeoutMs);

    child.stdout?.setEncoding('utf8');
    child.stdout?.on('data', (chunk) => {
      stdout = appendBounded(stdout, chunk, MAX_CAPTURE_BYTES);
    });

    child.stderr?.setEncoding('utf8');
    child.stderr?.on('data', (chunk) => {
      stderr = appendBounded(stderr, chunk, MAX_CAPTURE_BYTES);
    });

    child.on('error', (err) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      resolvePromise({
        exitCode: 1,
        stdout,
        stderr: appendBounded(stderr, `\n${err.message}`, MAX_CAPTURE_BYTES),
        durationMs: Date.now() - startedAt,
        timedOut,
      });
    });

    child.on('close', (code) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      resolvePromise({
        exitCode: timedOut ? 124 : (code ?? 1),
        stdout,
        stderr,
        durationMs: Date.now() - startedAt,
        timedOut,
      });
    });
  });
}

export async function withTempProbeDir<T>(
  prefix: string,
  fn: (dir: string) => Promise<T> | T
): Promise<T> {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  try {
    return await fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolvePromise) => {
    setTimeout(resolvePromise, ms);
  });
}

export async function startDevStack(options: DevStackOptions): Promise<DevStackHandle> {
  const timeoutMs = options.timeoutMs ?? 30_000;
  const { executable, finalArgs } = resolveSpawnTarget(options.command, options.args);
  let logs = '';
  const childState: { exitedCode: number | null; spawnError: Error | null } = {
    exitedCode: null,
    spawnError: null,
  };

  const child: ChildProcess = spawn(executable, finalArgs, {
    cwd: options.cwd,
    env: options.env ? { ...process.env, ...options.env } : process.env,
    shell: false,
    detached: process.platform !== 'win32',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const closedPromise = new Promise<void>((resolveClosed) => {
    child.on('error', (err) => {
      childState.spawnError = err;
      logs = appendBounded(logs, `\n[spawn-error] ${err.message}\n`, MAX_LOG_CHARS);
      resolveClosed();
    });
    child.on('close', (code) => {
      childState.exitedCode = code ?? 1;
      resolveClosed();
    });
  });

  child.stdout?.setEncoding('utf8');
  child.stdout?.on('data', (chunk) => {
    logs = appendBounded(logs, chunk, MAX_LOG_CHARS);
  });

  child.stderr?.setEncoding('utf8');
  child.stderr?.on('data', (chunk) => {
    logs = appendBounded(logs, chunk, MAX_LOG_CHARS);
  });

  const deadline = Date.now() + timeoutMs;
  let ready = false;

  while (Date.now() < deadline) {
    if (childState.spawnError !== null || childState.exitedCode !== null) {
      break;
    }
    try {
      const controller = new AbortController();
      const fetchTimer = setTimeout(() => {
        controller.abort();
      }, 1000);
      try {
        const res = await fetch(options.readyUrl, { signal: controller.signal });
        if (res.status >= 200 && res.status < 400) {
          ready = true;
          break;
        }
      } finally {
        clearTimeout(fetchTimer);
      }
    } catch {
      // Server not listening yet
    }
    await sleep(150);
  }

  if (!ready) {
    if (child.pid !== undefined) {
      killProcessTree(child.pid);
    }
    await Promise.race([closedPromise, sleep(1500)]);
    const reason =
      childState.spawnError !== null
        ? `spawn error: ${childState.spawnError.message}`
        : childState.exitedCode !== null
          ? `process exited early with code ${childState.exitedCode}`
          : `timed out after ${timeoutMs}ms waiting for ${options.readyUrl}`;
    throw new Error(`startDevStack failed (${reason}).\nLogs:\n${logs}`);
  }

  let stopped = false;
  return {
    baseUrl: options.readyUrl,
    getLogs(): string {
      return logs;
    },
    async stop(): Promise<void> {
      if (stopped) {
        return;
      }
      stopped = true;
      if (child.pid !== undefined && childState.exitedCode === null) {
        killProcessTree(child.pid);
      }
      await Promise.race([closedPromise, sleep(2000)]);
    },
  };
}
