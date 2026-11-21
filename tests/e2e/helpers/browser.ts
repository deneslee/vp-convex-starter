// fallow-ignore-file unused-file
import { spawn, spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, extname, join, resolve } from 'node:path';
import { killProcessTree, runCmd } from './process.ts';

export type BrowserDriverKind = 'playwright-cli' | 'cdp';

export interface BrowserDriverAvailability {
  readonly playwrightCliJs: string | null;
  readonly chromiumExecutable: string | null;
  readonly preferredDriver: BrowserDriverKind | null;
}

export interface BrowserTabInfo {
  readonly index: number;
  readonly active: boolean;
  readonly title: string;
  readonly url: string;
}

export interface BrowserConsoleEntry {
  readonly level: string;
  readonly text: string;
}

export interface BrowserSessionOptions {
  readonly driver?: 'auto' | BrowserDriverKind;
  readonly sessionName?: string;
  readonly initialUrl?: string;
  readonly headed?: boolean;
  readonly timeoutMs?: number;
}

export interface BrowserSession {
  readonly driver: BrowserDriverKind;
  readonly sessionName: string;
  goto(url: string): Promise<void>;
  newTab(url?: string): Promise<number>;
  selectTab(index: number): Promise<void>;
  listTabs(): Promise<readonly BrowserTabInfo[]>;
  eval<T = unknown>(fnExpression: string): Promise<T>;
  click(selector: string): Promise<void>;
  fill(selector: string, value: string): Promise<void>;
  uploadFile(triggerSelector: string, filePath: string): Promise<void>;
  dropFiles(targetSelector: string, filePaths: readonly string[]): Promise<void>;
  snapshot(): Promise<string>;
  console(): Promise<readonly BrowserConsoleEntry[]>;
  close(): Promise<void>;
}

const activeSessions = new Set<BrowserSession>();

function resolvePlaywrightCliJs(): string | null {
  const candidates: string[] = [];

  if (process.platform === 'win32') {
    const whereRes = spawnSync('where.exe', ['playwright-cli.cmd'], {
      shell: false,
      encoding: 'utf8',
    });
    if (whereRes.status === 0 && whereRes.stdout) {
      for (const line of whereRes.stdout.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (trimmed !== '') {
          candidates.push(trimmed);
        }
      }
    }
    const localAppData = process.env.LOCALAPPDATA;
    if (localAppData) {
      candidates.push(join(localAppData, 'pnpm', 'bin', 'playwright-cli.CMD'));
    }
  } else {
    const whichRes = spawnSync('which', ['playwright-cli'], {
      shell: false,
      encoding: 'utf8',
    });
    if (whichRes.status === 0 && whichRes.stdout) {
      const first = whichRes.stdout.trim().split(/\r?\n/)[0];
      if (first && existsSync(first)) {
        return realpathSync(first);
      }
    }
  }

  for (const cmdPath of candidates) {
    if (!existsSync(cmdPath)) {
      continue;
    }
    const content = readFileSync(cmdPath, 'utf8');
    const jsMatch = content.match(/"([^"]*playwright-cli\.js)"/i);
    if (jsMatch) {
      const cmdDir = dirname(cmdPath);
      const rawTarget = jsMatch[1].replace(/%~dp0\\?/gi, `${cmdDir}\\`);
      const resolved = resolve(rawTarget);
      if (existsSync(resolved)) {
        return realpathSync(resolved);
      }
    }
  }

  return null;
}

function parseRevisionSuffix(dirName: string): number {
  const match = dirName.match(/-(\d+)$/);
  return match ? Number(match[1]) : 0;
}

function resolveChromiumExecutable(): string | null {
  const localAppData = process.env.LOCALAPPDATA;
  if (!localAppData) {
    return null;
  }

  const msPlaywrightDir = join(localAppData, 'ms-playwright');
  if (!existsSync(msPlaywrightDir)) {
    return null;
  }

  const dirs = readdirSync(msPlaywrightDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => parseRevisionSuffix(b) - parseRevisionSuffix(a));

  for (const dirName of dirs) {
    if (dirName.startsWith('chromium_headless_shell-')) {
      const exe = join(
        msPlaywrightDir,
        dirName,
        'chrome-headless-shell-win64',
        'chrome-headless-shell.exe'
      );
      if (existsSync(exe)) {
        return exe;
      }
    }
  }

  for (const dirName of dirs) {
    if (dirName.startsWith('chromium-')) {
      const exe = join(msPlaywrightDir, dirName, 'chrome-win64', 'chrome.exe');
      if (existsSync(exe)) {
        return exe;
      }
    }
  }

  return null;
}

export function detectBrowserDrivers(): BrowserDriverAvailability {
  const playwrightCliJs = resolvePlaywrightCliJs();
  const chromiumExecutable = resolveChromiumExecutable();
  const preferredDriver: BrowserDriverKind | null =
    playwrightCliJs !== null ? 'playwright-cli' : chromiumExecutable !== null ? 'cdp' : null;

  return {
    playwrightCliJs,
    chromiumExecutable,
    preferredDriver,
  };
}

interface PlaywrightCliJsonResponse {
  readonly isError?: boolean;
  readonly error?: string;
  readonly result?: unknown;
  readonly snapshot?: unknown;
}

function parseCliJsonOutput(stdout: string): PlaywrightCliJsonResponse {
  const trimmed = stdout.trim();
  if (trimmed === '') {
    return {};
  }
  try {
    return JSON.parse(trimmed) as PlaywrightCliJsonResponse;
  } catch {
    const lines = trimmed.split(/\r?\n/).reverse();
    for (const line of lines) {
      const candidate = line.trim();
      if (candidate.startsWith('{') && candidate.endsWith('}')) {
        try {
          return JSON.parse(candidate) as PlaywrightCliJsonResponse;
        } catch {
          // Try earlier line
        }
      }
    }
    throw new Error(`Failed to parse playwright-cli --json output:\n${stdout}`);
  }
}

function parseTabListText(text: string): BrowserTabInfo[] {
  const tabs: BrowserTabInfo[] = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const match = rawLine.match(/^\s*-\s*(\d+):\s*(\(current\)\s*)?\[([^\]]*)\]\(([^)]*)\)/);
    if (match) {
      tabs.push({
        index: Number(match[1]),
        active: Boolean(match[2]),
        title: match[3],
        url: match[4],
      });
    }
  }
  return tabs;
}

function parseConsoleText(text: string): BrowserConsoleEntry[] {
  const entries: BrowserConsoleEntry[] = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const match = rawLine.match(/^\[([A-Z]+)\]\s*(.*)$/);
    if (match) {
      entries.push({
        level: match[1].toLowerCase(),
        text: match[2],
      });
    }
  }
  return entries;
}

async function openPlaywrightCliSession(
  pwCliJs: string,
  options: BrowserSessionOptions
): Promise<BrowserSession> {
  const sessionName = options.sessionName ?? `e2e-${randomUUID().slice(0, 8)}`;
  const tempCwd = mkdtempSync(join(tmpdir(), 'e2e-pwcli-'));
  const timeoutMs = options.timeoutMs ?? 30_000;
  let closed = false;

  async function execCli(args: readonly string[]): Promise<PlaywrightCliJsonResponse> {
    const res = await runCmd(process.execPath, [pwCliJs, `-s=${sessionName}`, ...args, '--json'], {
      cwd: tempCwd,
      timeoutMs,
    });
    if (res.timedOut) {
      throw new Error(`playwright-cli timed out running ${args.join(' ')}`);
    }
    const parsed = parseCliJsonOutput(res.stdout);
    if (res.exitCode !== 0 || parsed.isError === true) {
      throw new Error(
        parsed.error ?? (res.stderr.trim() || res.stdout.trim() || `Exit code ${res.exitCode}`)
      );
    }
    return parsed;
  }

  const openArgs = ['open', options.initialUrl ?? 'about:blank'];
  if (options.headed === true) {
    openArgs.push('--headed');
  }

  try {
    await execCli(openArgs);
  } catch (error) {
    rmSync(tempCwd, { recursive: true, force: true });
    throw error;
  }

  const session: BrowserSession = {
    driver: 'playwright-cli',
    sessionName,
    async goto(url: string): Promise<void> {
      await execCli(['goto', url]);
    },
    async newTab(url?: string): Promise<number> {
      await execCli(url ? ['tab-new', url] : ['tab-new']);
      const tabs = await this.listTabs();
      const active = tabs.find((tab) => tab.active);
      return active ? active.index : Math.max(0, tabs.length - 1);
    },
    async selectTab(index: number): Promise<void> {
      await execCli(['tab-select', String(index)]);
    },
    async listTabs(): Promise<readonly BrowserTabInfo[]> {
      const res = await execCli(['tab-list']);
      return parseTabListText(typeof res.result === 'string' ? res.result : '');
    },
    async eval<T = unknown>(fnExpression: string): Promise<T> {
      const res = await execCli(['eval', fnExpression]);
      if (typeof res.result === 'string') {
        if (res.result === 'undefined') {
          return undefined as T;
        }
        try {
          return JSON.parse(res.result) as T;
        } catch {
          return res.result as T;
        }
      }
      return res.result as T;
    },
    async click(selector: string): Promise<void> {
      await execCli(['click', selector]);
    },
    async fill(selector: string, value: string): Promise<void> {
      await execCli(['fill', selector, value]);
    },
    async uploadFile(triggerSelector: string, filePath: string): Promise<void> {
      await execCli(['click', triggerSelector]);
      await execCli(['upload', resolve(filePath)]);
    },
    async dropFiles(targetSelector: string, filePaths: readonly string[]): Promise<void> {
      const pathFlags = filePaths.map((filePath) => `--path=${resolve(filePath)}`);
      await execCli(['drop', targetSelector, ...pathFlags]);
    },
    async snapshot(): Promise<string> {
      const res = await execCli(['snapshot']);
      return typeof res.snapshot === 'string'
        ? res.snapshot
        : typeof res.result === 'string'
          ? res.result
          : JSON.stringify(res);
    },
    async console(): Promise<readonly BrowserConsoleEntry[]> {
      const res = await execCli(['console']);
      return parseConsoleText(typeof res.result === 'string' ? res.result : '');
    },
    async close(): Promise<void> {
      if (closed) {
        return;
      }
      closed = true;
      activeSessions.delete(session);
      try {
        await execCli(['close']);
      } catch {
        // Best-effort close
      } finally {
        rmSync(tempCwd, { recursive: true, force: true });
      }
    },
  };

  activeSessions.add(session);
  return session;
}

interface CdpMessage {
  readonly id?: number;
  readonly method?: string;
  readonly sessionId?: string;
  readonly params?: Record<string, unknown>;
  readonly result?: Record<string, unknown>;
  readonly error?: { readonly message?: string };
}

interface CdpTabState {
  readonly targetId: string;
  readonly sessionId: string;
  url: string;
  title: string;
  readonly consoleEntries: BrowserConsoleEntry[];
}

function guessMimeType(filePath: string): string {
  const ext = extname(filePath).toLowerCase();
  if (ext === '.md') {
    return 'text/markdown';
  }
  if (ext === '.png') {
    return 'image/png';
  }
  if (ext === '.jpg' || ext === '.jpeg') {
    return 'image/jpeg';
  }
  if (ext === '.txt') {
    return 'text/plain';
  }
  return 'application/octet-stream';
}

function bytesToBase64(bytes: Uint8Array): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;
    const triplet = (b0 << 16) | (b1 << 8) | b2;
    result += alphabet[(triplet >> 18) & 63];
    result += alphabet[(triplet >> 12) & 63];
    result += i + 1 < bytes.length ? alphabet[(triplet >> 6) & 63] : '=';
    result += i + 2 < bytes.length ? alphabet[triplet & 63] : '=';
  }
  return result;
}

function sleepMs(ms: number): Promise<void> {
  return new Promise((resolvePromise) => {
    setTimeout(resolvePromise, ms);
  });
}

async function openCdpSession(
  chromiumExecutable: string,
  options: BrowserSessionOptions
): Promise<BrowserSession> {
  const sessionName = options.sessionName ?? `e2e-cdp-${randomUUID().slice(0, 8)}`;
  const userDataDir = mkdtempSync(join(tmpdir(), 'e2e-cdp-profile-'));
  const timeoutMs = options.timeoutMs ?? 30_000;

  const args = [
    ...(options.headed === true ? [] : ['--headless']),
    '--remote-debugging-port=0',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    `--user-data-dir=${userDataDir}`,
    'about:blank',
  ];

  const child = spawn(chromiumExecutable, args, {
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const wsUrl = await new Promise<string>((resolveWs, rejectWs) => {
    let stderrBuf = '';
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        rejectWs(new Error(`Timed out waiting for CDP DevTools URL. stderr:\n${stderrBuf}`));
      }
    }, timeoutMs);

    child.stderr?.setEncoding('utf8');
    child.stderr?.on('data', (chunk) => {
      stderrBuf += chunk;
      const match = stderrBuf.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match && !settled) {
        settled = true;
        clearTimeout(timer);
        resolveWs(match[1]);
      }
    });

    child.on('error', (err) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        rejectWs(err);
      }
    });

    child.on('close', (code) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        rejectWs(new Error(`Chromium exited (${code ?? 'null'}) before CDP ready:\n${stderrBuf}`));
      }
    });
  }).catch((error) => {
    if (child.pid !== undefined) {
      killProcessTree(child.pid);
    }
    rmSync(userDataDir, { recursive: true, force: true });
    throw error;
  });

  const ws = new WebSocket(wsUrl);
  let nextId = 1;
  const pending = new Map<
    number,
    { resolve: (val: Record<string, unknown>) => void; reject: (err: Error) => void }
  >();
  const tabs: CdpTabState[] = [];
  let activeTabIndex = 0;
  let closed = false;

  await new Promise<void>((resolveOpen, rejectOpen) => {
    const timer = setTimeout(() => {
      rejectOpen(new Error('Timed out connecting CDP WebSocket'));
    }, timeoutMs);
    ws.addEventListener('open', () => {
      clearTimeout(timer);
      resolveOpen();
    });
    ws.addEventListener('error', () => {
      clearTimeout(timer);
      rejectOpen(new Error(`CDP WebSocket error connecting to ${wsUrl}`));
    });
  });

  ws.addEventListener('message', (event) => {
    const rawText = typeof event.data === 'string' ? event.data : String(event.data);
    const msg = JSON.parse(rawText) as CdpMessage;

    if (typeof msg.id === 'number') {
      const entry = pending.get(msg.id);
      if (entry) {
        pending.delete(msg.id);
        if (msg.error) {
          entry.reject(new Error(msg.error.message ?? 'CDP error'));
        } else {
          entry.resolve(msg.result ?? {});
        }
      }
      return;
    }

    if (msg.method === 'Runtime.consoleAPICalled' && msg.sessionId) {
      const tab = tabs.find((item) => item.sessionId === msg.sessionId);
      if (tab && msg.params) {
        const level = typeof msg.params.type === 'string' ? msg.params.type : 'log';
        const argsList = Array.isArray(msg.params.args)
          ? (msg.params.args as Array<{ value?: unknown; description?: string }>)
          : [];
        const text = argsList
          .map((arg) => {
            if (
              typeof arg.value === 'string' ||
              typeof arg.value === 'number' ||
              typeof arg.value === 'boolean'
            ) {
              return String(arg.value);
            }
            if (arg.value !== undefined) {
              return JSON.stringify(arg.value);
            }
            return arg.description ?? '[object]';
          })
          .join(' ');
        tab.consoleEntries.push({ level, text });
      }
    }
  });

  function sendCdp(
    method: string,
    params?: Record<string, unknown>,
    cdpSessionId?: string
  ): Promise<Record<string, unknown>> {
    const id = nextId;
    nextId += 1;
    const payload: Record<string, unknown> = { id, method };
    if (params) {
      payload.params = params;
    }
    if (cdpSessionId) {
      payload.sessionId = cdpSessionId;
    }

    return new Promise((resolveCmd, rejectCmd) => {
      const timer = setTimeout(() => {
        pending.delete(id);
        rejectCmd(new Error(`CDP command timed out: ${method}`));
      }, timeoutMs);

      pending.set(id, {
        resolve: (val) => {
          clearTimeout(timer);
          resolveCmd(val);
        },
        reject: (err) => {
          clearTimeout(timer);
          rejectCmd(err);
        },
      });
      ws.send(JSON.stringify(payload));
    });
  }

  async function attachTab(targetId: string, url: string): Promise<CdpTabState> {
    const attached = await sendCdp('Target.attachToTarget', { targetId, flatten: true });
    const cdpSessionId = String(attached.sessionId);
    await sendCdp('Page.enable', undefined, cdpSessionId);
    await sendCdp('Runtime.enable', undefined, cdpSessionId);
    const tabState: CdpTabState = {
      targetId,
      sessionId: cdpSessionId,
      url,
      title: '',
      consoleEntries: [],
    };
    tabs.push(tabState);
    return tabState;
  }

  function currentTab(): CdpTabState {
    const tab = tabs[activeTabIndex];
    if (!tab) {
      throw new Error('No active CDP tab');
    }
    return tab;
  }

  async function waitForDocumentReady(tab: CdpTabState): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const res = await sendCdp(
        'Runtime.evaluate',
        {
          expression:
            '({ ready: document.readyState, title: document.title, href: location.href })',
          returnByValue: true,
        },
        tab.sessionId
      );
      const val = (res.result as { value?: { ready?: string; title?: string; href?: string } })
        ?.value;
      if (val && (val.ready === 'interactive' || val.ready === 'complete')) {
        tab.title = val.title ?? '';
        tab.url = val.href ?? tab.url;
        return;
      }
      await sleepMs(50);
    }
  }

  const targetsResult = await sendCdp('Target.getTargets');
  const targetInfos = Array.isArray(targetsResult.targetInfos)
    ? (targetsResult.targetInfos as Array<{ targetId: string; type: string; url: string }>)
    : [];
  const existingPage = targetInfos.find((info) => info.type === 'page');

  if (existingPage) {
    await attachTab(existingPage.targetId, existingPage.url);
  } else {
    const created = await sendCdp('Target.createTarget', { url: 'about:blank' });
    await attachTab(String(created.targetId), 'about:blank');
  }

  if (options.initialUrl && options.initialUrl !== 'about:blank') {
    const tab = currentTab();
    await sendCdp('Page.navigate', { url: options.initialUrl }, tab.sessionId);
    await waitForDocumentReady(tab);
  }

  const session: BrowserSession = {
    driver: 'cdp',
    sessionName,
    async goto(url: string): Promise<void> {
      const tab = currentTab();
      await sendCdp('Page.navigate', { url }, tab.sessionId);
      await waitForDocumentReady(tab);
    },
    async newTab(url?: string): Promise<number> {
      const targetUrl = url ?? 'about:blank';
      const created = await sendCdp('Target.createTarget', { url: targetUrl });
      const tab = await attachTab(String(created.targetId), targetUrl);
      activeTabIndex = tabs.length - 1;
      await sendCdp('Target.activateTarget', { targetId: tab.targetId });
      await waitForDocumentReady(tab);
      return activeTabIndex;
    },
    async selectTab(index: number): Promise<void> {
      const tab = tabs[index];
      if (!tab) {
        throw new Error(`Invalid tab index ${index}`);
      }
      activeTabIndex = index;
      await sendCdp('Target.activateTarget', { targetId: tab.targetId });
    },
    async listTabs(): Promise<readonly BrowserTabInfo[]> {
      const list: BrowserTabInfo[] = [];
      for (let idx = 0; idx < tabs.length; idx += 1) {
        const tab = tabs[idx];
        const meta = await sendCdp(
          'Runtime.evaluate',
          {
            expression: '({ title: document.title, url: location.href })',
            returnByValue: true,
          },
          tab.sessionId
        );
        const val = (meta.result as { value?: { title?: string; url?: string } })?.value;
        list.push({
          index: idx,
          active: idx === activeTabIndex,
          title: val?.title ?? tab.title,
          url: val?.url ?? tab.url,
        });
      }
      return list;
    },
    async eval<T = unknown>(fnExpression: string): Promise<T> {
      const tab = currentTab();
      const res = await sendCdp(
        'Runtime.evaluate',
        {
          expression: `(${fnExpression})()`,
          returnByValue: true,
          awaitPromise: true,
        },
        tab.sessionId
      );
      if (res.exceptionDetails) {
        const details = res.exceptionDetails as { text?: string };
        throw new Error(details.text ?? 'CDP Runtime.evaluate exception');
      }
      const resultObj = res.result as { value?: unknown } | undefined;
      return resultObj?.value as T;
    },
    async click(selector: string): Promise<void> {
      await this.eval(
        `() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) throw new Error('Element not found'); el.scrollIntoView({ block: 'center' }); el.click(); }`
      );
    },
    async fill(selector: string, value: string): Promise<void> {
      await this.eval(
        `() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) throw new Error('Element not found'); el.focus(); const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set; if (setter) setter.call(el, ${JSON.stringify(value)}); else el.value = ${JSON.stringify(value)}; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); }`
      );
    },
    async uploadFile(triggerSelector: string, filePath: string): Promise<void> {
      const tab = currentTab();
      const doc = await sendCdp('DOM.getDocument', { depth: -1 }, tab.sessionId);
      const rootNodeId = (doc.root as { nodeId: number }).nodeId;
      const query = await sendCdp(
        'DOM.querySelector',
        { nodeId: rootNodeId, selector: triggerSelector },
        tab.sessionId
      );
      let nodeId = typeof query.nodeId === 'number' ? query.nodeId : 0;
      if (nodeId === 0) {
        const fallback = await sendCdp(
          'DOM.querySelector',
          { nodeId: rootNodeId, selector: 'input[type="file"]' },
          tab.sessionId
        );
        nodeId = typeof fallback.nodeId === 'number' ? fallback.nodeId : 0;
      }
      if (nodeId === 0) {
        throw new Error(`No file input found for selector "${triggerSelector}"`);
      }
      await sendCdp('DOM.setFileInputFiles', { nodeId, files: [resolve(filePath)] }, tab.sessionId);
    },
    async dropFiles(targetSelector: string, filePaths: readonly string[]): Promise<void> {
      const encodedFiles = filePaths.map((filePath) => {
        const abs = resolve(filePath);
        const bytes = readFileSync(abs);
        return {
          name: abs.split(/[\\/]/).pop() ?? 'file',
          mimeType: guessMimeType(abs),
          base64: bytesToBase64(bytes),
        };
      });
      await this.eval(
        `() => {
          const target = document.querySelector(${JSON.stringify(targetSelector)});
          if (!target) throw new Error('Drop target not found');
          const dt = new DataTransfer();
          for (const item of ${JSON.stringify(encodedFiles)}) {
            const bin = atob(item.base64);
            const arr = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
            dt.items.add(new File([arr], item.name, { type: item.mimeType }));
          }
          target.dispatchEvent(new DragEvent('dragenter', { dataTransfer: dt, bubbles: true, cancelable: true }));
          target.dispatchEvent(new DragEvent('dragover', { dataTransfer: dt, bubbles: true, cancelable: true }));
          target.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true }));
        }`
      );
    },
    async snapshot(): Promise<string> {
      const text = await this.eval<string>('() => document.body ? document.body.innerText : ""');
      return typeof text === 'string' ? text : '';
    },
    async console(): Promise<readonly BrowserConsoleEntry[]> {
      return [...currentTab().consoleEntries];
    },
    async close(): Promise<void> {
      if (closed) {
        return;
      }
      closed = true;
      activeSessions.delete(session);
      try {
        ws.close();
      } catch {
        // Ignore close errors
      }
      if (child.pid !== undefined) {
        killProcessTree(child.pid);
      }
      rmSync(userDataDir, { recursive: true, force: true });
    },
  };

  activeSessions.add(session);
  return session;
}

export async function openBrowserSession(options?: BrowserSessionOptions): Promise<BrowserSession> {
  const availability = detectBrowserDrivers();
  const requested = options?.driver ?? 'auto';

  if (requested === 'playwright-cli' || (requested === 'auto' && availability.playwrightCliJs)) {
    if (!availability.playwrightCliJs) {
      throw new Error('playwright-cli driver requested but playwright-cli.js was not found.');
    }
    return openPlaywrightCliSession(availability.playwrightCliJs, options ?? {});
  }

  if (requested === 'cdp' || requested === 'auto') {
    if (!availability.chromiumExecutable) {
      throw new Error(
        'No browser driver available: neither playwright-cli nor ms-playwright Chromium was found.'
      );
    }
    return openCdpSession(availability.chromiumExecutable, options ?? {});
  }

  throw new Error(`Unsupported browser driver: ${String(requested)}`);
}

export async function closeAllBrowserSessions(): Promise<void> {
  const sessions = [...activeSessions];
  for (const session of sessions) {
    await session.close();
  }

  const availability = detectBrowserDrivers();
  if (availability.playwrightCliJs) {
    const tempCwd = mkdtempSync(join(tmpdir(), 'e2e-pwcli-closeall-'));
    try {
      await runCmd(process.execPath, [availability.playwrightCliJs, 'close-all', '--json'], {
        cwd: tempCwd,
        timeoutMs: 10_000,
      });
    } catch {
      // Best-effort daemon cleanup
    } finally {
      rmSync(tempCwd, { recursive: true, force: true });
    }
  }
}
