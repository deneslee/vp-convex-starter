// fallow-ignore-file unused-file
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';

const VALID_TIERS = new Set(['1', '2', '3', '4', 'all']);

function printHelp(): void {
  const lines = [
    'Usage: node tests/e2e/run.ts [options]',
    '',
    'Options:',
    '  --tier <1|2|3|4|all>   Select E2E tier to execute (default: all)',
    '  --offline              Set E2E_OFFLINE=1 for offline-capable execution',
    '  --live-url <url>       Set E2E_BASE_URL=<url> for live browser checks',
    '  --help                 Show this help message and exit 0',
    '',
  ];
  process.stdout.write(`${lines.join('\n')}`);
}

function collectTestFiles(e2eRoot: string, tier: string): string[] {
  const dirs = tier === 'all' ? ['tier1', 'tier2', 'tier3', 'tier4'] : [`tier${tier}`];
  const files: string[] = [];

  for (const dir of dirs) {
    const absDir = join(e2eRoot, dir);
    if (!existsSync(absDir)) {
      continue;
    }
    const entries = readdirSync(absDir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.test.ts'))
      .map((entry) => join(absDir, entry.name))
      .sort((a, b) => a.localeCompare(b));
    files.push(...entries);
  }

  return files;
}

function main(): number {
  let parsed: ReturnType<typeof parseArgs>;
  try {
    parsed = parseArgs({
      args: process.argv.slice(2),
      allowPositionals: false,
      strict: true,
      options: {
        tier: { type: 'string', default: 'all' },
        offline: { type: 'boolean', default: false },
        'live-url': { type: 'string' },
        help: { type: 'boolean', short: 'h', default: false },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Invalid CLI arguments: ${message}\n`);
    printHelp();
    return 2;
  }

  if (parsed.values.help === true) {
    printHelp();
    return 0;
  }

  const tierRaw = typeof parsed.values.tier === 'string' ? parsed.values.tier : 'all';
  if (!VALID_TIERS.has(tierRaw)) {
    process.stderr.write(`Invalid --tier value "${tierRaw}". Expected 1, 2, 3, 4, or all.\n`);
    return 2;
  }

  const liveUrl = parsed.values['live-url'];
  if (typeof liveUrl === 'string') {
    try {
      const parsedUrl = new URL(liveUrl);
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        process.stderr.write(`Invalid --live-url protocol "${parsedUrl.protocol}".\n`);
        return 2;
      }
    } catch {
      process.stderr.write(`Invalid --live-url value "${liveUrl}". Expected a valid URL.\n`);
      return 2;
    }
  }

  const e2eRoot = resolve(import.meta.dirname);
  const testFiles = collectTestFiles(e2eRoot, tierRaw);
  if (testFiles.length === 0) {
    process.stderr.write(`No *.test.ts files found for tier "${tierRaw}" under ${e2eRoot}.\n`);
    return 1;
  }

  const childEnv: Record<string, string | undefined> = { ...process.env };
  if (parsed.values.offline === true) {
    childEnv.E2E_OFFLINE = '1';
  }
  if (typeof liveUrl === 'string') {
    childEnv.E2E_BASE_URL = liveUrl;
  }

  const result = spawnSync(process.execPath, ['--test', ...testFiles], {
    cwd: resolve(e2eRoot, '../..'),
    env: childEnv,
    shell: false,
    stdio: 'inherit',
  });

  if (result.error) {
    process.stderr.write(`Failed to execute node --test: ${result.error.message}\n`);
    return 1;
  }

  return result.status ?? 1;
}

process.exit(main());
