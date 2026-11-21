interface ImportMeta {
  readonly dirname: string;
  readonly filename?: string;
  readonly url: string;
}

interface NodeProcessStream {
  write(chunk: string): boolean;
}

interface NodeProcess {
  readonly argv: readonly string[];
  readonly env: Record<string, string | undefined>;
  readonly execPath: string;
  readonly pid: number;
  readonly platform: string;
  readonly stdout: NodeProcessStream;
  readonly stderr: NodeProcessStream;
  exitCode?: number | string | null;
  cwd(): string;
  exit(code?: number): never;
  kill(pid: number, signal?: string | number): boolean;
}

declare const process: NodeProcess;

declare module 'node:test' {
  export interface TestContext {
    readonly name: string;
    diagnostic(message: string): void;
  }

  export interface SuiteContext {
    readonly name: string;
  }

  export interface TestOptions {
    readonly timeout?: number;
    readonly concurrency?: number | boolean;
  }

  export type TestFn = (t: TestContext) => void | Promise<void>;
  export type SuiteFn = (s: SuiteContext) => void | Promise<void>;
  export type HookFn = () => void | Promise<void>;

  export function describe(name: string, fn: SuiteFn): void;
  export function describe(name: string, options: TestOptions, fn: SuiteFn): void;
  export function it(name: string, fn: TestFn): void;
  export function it(name: string, options: TestOptions, fn: TestFn): void;
  export function before(fn: HookFn): void;
  export function after(fn: HookFn): void;
  export function beforeEach(fn: HookFn): void;
  export function afterEach(fn: HookFn): void;
}

declare module 'node:assert/strict' {
  function ok(value: unknown, message?: string | Error): asserts value;
  function equal<T>(actual: unknown, expected: T, message?: string | Error): asserts actual is T;
  function notEqual(actual: unknown, expected: unknown, message?: string | Error): void;
  function deepEqual(actual: unknown, expected: unknown, message?: string | Error): void;
  function match(value: string, regexp: RegExp, message?: string | Error): void;
  function doesNotMatch(value: string, regexp: RegExp, message?: string | Error): void;
  function throws(block: () => unknown, error?: RegExp | Error, message?: string | Error): void;
  function rejects(
    block: (() => Promise<unknown>) | Promise<unknown>,
    error?: RegExp | Error,
    message?: string | Error
  ): Promise<void>;
  function fail(message?: string | Error): never;

  const assertStrict: {
    ok: typeof ok;
    equal: typeof equal;
    notEqual: typeof notEqual;
    deepEqual: typeof deepEqual;
    match: typeof match;
    doesNotMatch: typeof doesNotMatch;
    throws: typeof throws;
    rejects: typeof rejects;
    fail: typeof fail;
  };

  export {
    ok,
    equal,
    notEqual,
    deepEqual,
    match,
    doesNotMatch,
    throws,
    rejects,
    fail,
  };
  export default assertStrict;
}

declare module 'node:fs' {
  export interface Dirent {
    readonly name: string;
    isDirectory(): boolean;
    isFile(): boolean;
    isSymbolicLink(): boolean;
  }

  export interface Stats {
    readonly size: number;
    isDirectory(): boolean;
    isFile(): boolean;
  }

  export function existsSync(path: string): boolean;
  export function readFileSync(path: string, encoding: 'utf8'): string;
  export function readFileSync(path: string): Uint8Array;
  export function writeFileSync(path: string, data: string | Uint8Array, encoding?: 'utf8'): void;
  export function mkdirSync(path: string, options?: { recursive?: boolean }): string | undefined;
  export function mkdtempSync(prefix: string): string;
  export function rmSync(
    path: string,
    options?: { recursive?: boolean; force?: boolean }
  ): void;
  export function readdirSync(path: string): string[];
  export function readdirSync(path: string, options: { withFileTypes: true }): Dirent[];
  export function statSync(path: string): Stats;
  export function realpathSync(path: string): string;
}

declare module 'node:fs/promises' {
  export function readFile(path: string, encoding: 'utf8'): Promise<string>;
  export function readFile(path: string): Promise<Uint8Array>;
  export function writeFile(
    path: string,
    data: string | Uint8Array,
    encoding?: 'utf8'
  ): Promise<void>;
  export function mkdir(path: string, options?: { recursive?: boolean }): Promise<string | undefined>;
  export function mkdtemp(prefix: string): Promise<string>;
  export function rm(path: string, options?: { recursive?: boolean; force?: boolean }): Promise<void>;
  export function readdir(path: string): Promise<string[]>;
  export function access(path: string): Promise<void>;
}

declare module 'node:path' {
  export const sep: string;
  export function join(...paths: string[]): string;
  export function resolve(...paths: string[]): string;
  export function relative(from: string, to: string): string;
  export function dirname(path: string): string;
  export function basename(path: string, suffix?: string): string;
  export function extname(path: string): string;
}

declare module 'node:child_process' {
  export interface ReadableStream {
    setEncoding(encoding: 'utf8'): void;
    on(event: 'data', listener: (chunk: string) => void): this;
  }

  export interface ChildProcess {
    readonly pid?: number;
    readonly stdout: ReadableStream | null;
    readonly stderr: ReadableStream | null;
    on(event: 'error', listener: (err: Error) => void): this;
    on(event: 'close', listener: (code: number | null, signal: string | null) => void): this;
  }

  export interface SpawnOptions {
    cwd?: string;
    env?: Record<string, string | undefined>;
    shell?: boolean;
    detached?: boolean;
    stdio?: 'pipe' | 'inherit' | 'ignore' | readonly ('pipe' | 'inherit' | 'ignore')[];
  }

  export interface SpawnSyncOptions {
    cwd?: string;
    env?: Record<string, string | undefined>;
    shell?: boolean;
    encoding?: 'utf8';
    stdio?: 'pipe' | 'inherit' | 'ignore';
    timeout?: number;
  }

  export interface SpawnSyncReturns<T = string> {
    readonly pid: number;
    readonly stdout: T;
    readonly stderr: T;
    readonly status: number | null;
    readonly signal: string | null;
    readonly error?: Error;
  }

  export function spawn(
    command: string,
    args?: readonly string[],
    options?: SpawnOptions
  ): ChildProcess;
  export function spawnSync(
    command: string,
    args?: readonly string[],
    options?: SpawnSyncOptions
  ): SpawnSyncReturns;
}

declare module 'node:os' {
  export function tmpdir(): string;
  export function platform(): string;
  export function homedir(): string;
}

declare module 'node:crypto' {
  export interface Hash {
    update(data: string | Uint8Array): this;
    digest(encoding: 'hex'): string;
  }

  export function createHash(algorithm: string): Hash;
  export function randomUUID(): string;
}

declare module 'node:http' {
  export interface IncomingMessage {
    readonly method?: string;
    readonly url?: string;
  }

  export interface ServerResponse {
    statusCode: number;
    setHeader(name: string, value: string): void;
    end(chunk?: string): void;
  }

  export interface AddressInfo {
    readonly address: string;
    readonly family: string;
    readonly port: number;
  }

  export interface Server {
    listen(port: number, host: string, listeningListener?: () => void): this;
    address(): AddressInfo | string | null;
    close(callback?: (err?: Error) => void): this;
    closeAllConnections?(): void;
  }

  export function createServer(
    requestListener: (req: IncomingMessage, res: ServerResponse) => void
  ): Server;
}

declare module 'node:util' {
  export interface ParseArgsOptionConfig {
    readonly type: 'string' | 'boolean';
    readonly short?: string;
    readonly default?: string | boolean;
  }

  export interface ParseArgsConfig {
    readonly args?: readonly string[];
    readonly options?: Record<string, ParseArgsOptionConfig>;
    readonly allowPositionals?: boolean;
    readonly strict?: boolean;
  }

  export interface ParseArgsResult {
    readonly values: Record<string, string | boolean | undefined>;
    readonly positionals: string[];
  }

  export function parseArgs(config: ParseArgsConfig): ParseArgsResult;
}
