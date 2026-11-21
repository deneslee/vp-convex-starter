// fallow-ignore-file unused-file
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';
import {
  closeAllBrowserSessions,
  detectBrowserDrivers,
  openBrowserSession,
  type BrowserDriverAvailability,
  type BrowserSession,
  type BrowserSessionOptions,
} from '../helpers/browser.ts';
import {
  type CmdResult,
  killProcessTree,
  runCmd,
  startDevStack,
  withTempProbeDir,
} from '../helpers/process.ts';
import {
  BANNED_MANTINE_ADHOC_PROPS,
  BANNED_MANTINE_VISUAL_PROPS,
  checkProvidersCssOrder,
  existsInRepo,
  EXPECTED_PROVIDERS_CSS_ORDER,
  getRepoRoot,
  parseEnvSchema,
  parseJsonc,
  parsePnpmWorkspaceYaml,
  readRepoText,
  readTextFile,
  repoPath,
  scanBannedMantineProps,
  scanBlockNoteStyleCssBan,
  scanDirectEnvReads,
  scanForbiddenImports,
  sha256File,
  walkFiles,
} from '../helpers/workspace.ts';

describe('Tier 1 — E2E Harness Self-Check', () => {
  after(async () => {
    await closeAllBrowserSessions();
  });

  it('T1-HARNESS-01: parseJsonc, parsePnpmWorkspaceYaml, and parseEnvSchema handle comments, URLs, trailing commas, and annotations', () => {
    const jsoncSample = `{
      // line comment with https://example.com
      "$schema": "https://raw.githubusercontent.com/fallow-rs/fallow/main/schema.json",
      /* block comment
         spanning multiple lines */
      "entry": ["apps/web/src/main.tsx",],
    }`;
    const parsedJsonc = parseJsonc<{ $schema: string; entry: string[] }>(jsoncSample);
    assert.equal(
      parsedJsonc.$schema,
      'https://raw.githubusercontent.com/fallow-rs/fallow/main/schema.json'
    );
    assert.deepEqual(parsedJsonc.entry, ['apps/web/src/main.tsx']);

    const yamlSample = [
      'packages:',
      '  - "apps/*"',
      '  - "packages/*"',
      'allowBuilds:',
      '  esbuild: true # allow esbuild',
      'savePrefix: ""',
      'catalogMode: prefer',
      'catalog:',
      '  vite: npm:@voidzero-dev/vite-plus-core@8.3.8000',
      '  "@mantine/core": 9.8.2',
      'overrides:',
      '  vite@*: "catalog:"',
    ].join('\n');
    const parsedYaml = parsePnpmWorkspaceYaml(yamlSample);
    assert.deepEqual(parsedYaml.packages, ['apps/*', 'packages/*']);
    assert.equal(parsedYaml.allowBuilds.esbuild, true);
    assert.equal(parsedYaml.savePrefix, '');
    assert.equal(parsedYaml.catalogMode, 'prefer');
    assert.equal(parsedYaml.catalog.vite, 'npm:@voidzero-dev/vite-plus-core@8.3.8000');
    assert.equal(parsedYaml.catalog['@mantine/core'], '9.8.2');
    assert.equal(parsedYaml.overrides['vite@*'], 'catalog:');

    const envSample = [
      '# @defaultRequired=false @defaultSensitive=false',
      '# @generateTsTypes(path=env.d.ts)',
      '# ----------',
      '# Convex deployment URL',
      '# @required @type=url',
      'VITE_CONVEX_URL=',
    ].join('\n');
    const parsedEnv = parseEnvSchema(envSample);
    assert.ok(parsedEnv.directives.includes('@generateTsTypes(path=env.d.ts)'));
    assert.equal(parsedEnv.entries.length, 1);
    assert.equal(parsedEnv.entries[0].name, 'VITE_CONVEX_URL');
    assert.ok(parsedEnv.entries[0].annotations.includes('@required'));
    assert.ok(parsedEnv.entries[0].annotations.includes('@type=url'));
  });

  it('T1-HARNESS-02: scanBannedMantineProps enforces 39 visual + 4 ad-hoc props on Mantine while ignoring safe non-Mantine JSX', async () => {
    assert.equal(BANNED_MANTINE_VISUAL_PROPS.length, 39);
    assert.equal(BANNED_MANTINE_ADHOC_PROPS.length, 4);

    await withTempProbeDir('e2e-prop-scan-', (dir) => {
      const badFile = join(dir, 'Bad.tsx');
      writeFileSync(
        badFile,
        [
          "import { Box as B, Button, Table, Text } from '@mantine/core';",
          "import { RecordDetailCard } from '@repo/ui';",
          "import { Plus } from 'lucide-react';",
          'export function Bad() {',
          '  const [s] = useState<ButtonProps>();',
          '  return (',
          '    <>',
          '      <B p="md" color="red" />',
          '      <Button variant="filled" size="sm" gap="xs" leftSection={<B mt="sm" />} />',
          '      <Table.Td style={{ color: "red" }}>x</Table.Td>',
          "      <Text>Don't crash here</Text>",
          '      {/* <B px="lg" /> */}',
          '      <Plus size={16} />',
          '      <RecordDetailCard status="active" intent="primary" />',
          '      <RecordDetailCard mb="md" />',
          '    </>',
          '  );',
          '}',
        ].join('\n'),
        'utf8'
      );

      const violations = scanBannedMantineProps([badFile]);
      const summary = violations.map((v) => `${v.component}:${v.prop}:${v.category}`);
      assert.ok(summary.includes('B:p:visual-box-model'));
      assert.ok(summary.includes('B:color:adhoc-mantine'));
      assert.ok(summary.includes('Button:variant:adhoc-mantine'));
      assert.ok(summary.includes('Button:size:adhoc-mantine'));
      assert.ok(summary.includes('Button:gap:adhoc-mantine'));
      assert.ok(summary.includes('B:mt:visual-box-model'));
      assert.ok(summary.includes('Table.Td:style:visual-box-model'));
      assert.ok(summary.includes('RecordDetailCard:mb:visual-box-model'));
      assert.equal(violations.length, 8);
    });
  });

  it('T1-HARNESS-03: scanForbiddenImports, scanDirectEnvReads, scanBlockNoteStyleCssBan, and checkProvidersCssOrder detect violations accurately', async () => {
    assert.equal(EXPECTED_PROVIDERS_CSS_ORDER.length, 6);

    await withTempProbeDir('e2e-static-scan-', (dir) => {
      const impFile = join(dir, 'imp.ts');
      writeFileSync(
        impFile,
        [
          "// import foo from 'react';",
          "import type { FC } from 'react';",
          "export * from '@mantine/core';",
          "const lazy = () => import('zustand');",
          "const req = require('@tanstack/react-router');",
          'export { lazy, req, type FC };',
        ].join('\n'),
        'utf8'
      );
      const impViolations = scanForbiddenImports(
        [impFile],
        ['react', '@mantine/*', 'zustand', '@tanstack/*']
      );
      assert.equal(impViolations.length, 4);

      const envFile = join(dir, 'env.ts');
      writeFileSync(
        envFile,
        [
          'const ignored = "import.meta.env.VITE_X";',
          '// process.env.IGNORED',
          'const a = import.meta.env.VITE_CONVEX_URL;',
          ['const b = `prefix-$', '{process.env.OPENAI_API_KEY}`;'].join(''),
          'export { ignored, a, b };',
        ].join('\n'),
        'utf8'
      );
      const envViolations = scanDirectEnvReads([envFile]);
      assert.equal(envViolations.length, 2);
      assert.equal(envViolations[0].expression, 'import.meta.env');
      assert.equal(envViolations[1].expression, 'process.env');

      const badProviders = join(dir, 'BadProviders.tsx');
      writeFileSync(
        badProviders,
        [
          "import '@mantine/notifications/styles.css';",
          "import '@mantine/core/styles.css';",
          "import '@blocknote/mantine/style.css';",
        ].join('\n'),
        'utf8'
      );
      assert.equal(scanBlockNoteStyleCssBan([badProviders]).length, 1);
      const badOrder = checkProvidersCssOrder(badProviders);
      assert.equal(badOrder.ok, false);
      assert.equal(badOrder.hasBannedStyleCss, true);
      assert.equal(badOrder.orderMismatch, true);
      assert.ok(badOrder.missing.includes('@blocknote/mantine/blocknoteStyles.css'));

      const goodProviders = join(dir, 'GoodProviders.tsx');
      writeFileSync(
        goodProviders,
        EXPECTED_PROVIDERS_CSS_ORDER.map((item) => `import '${item}';`).join('\n'),
        'utf8'
      );
      const goodOrder = checkProvidersCssOrder(goodProviders);
      assert.equal(goodOrder.ok, true);
      assert.equal(goodOrder.hasBannedStyleCss, false);
      assert.equal(goodOrder.orderMismatch, false);
      assert.equal(goodOrder.missing.length, 0);
    });
  });

  it('T1-HARNESS-04: withTempProbeDir, walkFiles, sha256File, readTextFile, and repo path helpers work and clean up on errors', async () => {
    const root = getRepoRoot();
    assert.ok(existsInRepo('AGENTS.md'));
    assert.equal(repoPath('AGENTS.md'), join(root, 'AGENTS.md'));
    assert.ok(readRepoText('AGENTS.md').includes('AGENTS.md'));

    let capturedDir = '';
    await assert.rejects(
      withTempProbeDir('e2e-cleanup-', (dir) => {
        capturedDir = dir;
        const probeFile = join(dir, 'hello.txt');
        writeFileSync(probeFile, 'abc', 'utf8');
        assert.equal(readTextFile(probeFile), 'abc');
        assert.equal(
          sha256File(probeFile),
          'BA7816BF8F01CFEA414140DE5DAE2223B00361A396177A9CB410FF61F20015AD'
        );
        const walked = walkFiles(dir, { extensions: ['.txt'] });
        assert.deepEqual(walked, [probeFile]);
        throw new Error('intentional probe failure');
      }),
      /intentional probe failure/
    );
    assert.equal(existsInRepo(capturedDir), false);
  });

  it('T1-HARNESS-05: runCmd, startDevStack, and killProcessTree execute and clean up child processes cleanly', async () => {
    const okRes: CmdResult = await runCmd(process.execPath, ['-e', 'process.stdout.write("ok")']);
    assert.equal(okRes.exitCode, 0);
    assert.equal(okRes.stdout, 'ok');

    const failRes = await runCmd(process.execPath, [
      '-e',
      'process.stderr.write("err"); process.exit(3)',
    ]);
    assert.equal(failRes.exitCode, 3);
    assert.equal(failRes.stderr, 'err');

    await withTempProbeDir('e2e-devstack-', async (dir) => {
      const portProbe = createServer((_req, res) => {
        res.statusCode = 200;
        res.end('ok');
      });
      const freePort = await new Promise<number>((resolvePort) => {
        portProbe.listen(0, '127.0.0.1', () => {
          const addr = portProbe.address();
          const port = typeof addr === 'object' && addr !== null ? addr.port : 0;
          portProbe.close(() => {
            resolvePort(port);
          });
        });
      });

      const serverScript = join(dir, 'server.mjs');
      writeFileSync(
        serverScript,
        [
          "import { createServer } from 'node:http';",
          `const s = createServer((_q, r) => { r.statusCode = 200; r.end('ready'); });`,
          `s.listen(${freePort}, '127.0.0.1', () => { process.stdout.write('listening\\n'); });`,
        ].join('\n'),
        'utf8'
      );

      const handle = await startDevStack({
        command: process.execPath,
        args: [serverScript],
        cwd: dir,
        readyUrl: `http://127.0.0.1:${freePort}/`,
        timeoutMs: 10_000,
      });
      try {
        const res = await fetch(handle.baseUrl);
        assert.equal(res.status, 200);
        assert.equal(await res.text(), 'ready');
        assert.ok(handle.getLogs().includes('listening'));
      } finally {
        await handle.stop();
      }
    });

    killProcessTree(-1);
  });

  it(
    'T1-HARNESS-06: browser.ts detects driver and executes a 2-tab session against an ephemeral HTTP server',
    { timeout: 45_000 },
    async () => {
      const drivers: BrowserDriverAvailability = detectBrowserDrivers();
      assert.ok(
        drivers.preferredDriver !== null,
        'Expected playwright-cli or ms-playwright Chromium to be available'
      );

      const server = createServer((req, res) => {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Connection', 'close');
        if (req.url === '/tab2') {
          res.end('<html><head><title>Tab Two</title></head><body><h1>Second</h1></body></html>');
          return;
        }
        res.end(
          [
            '<!doctype html><html><head><title>Tab One</title></head><body>',
            '<input id="inp" type="text" />',
            '<button id="btn" type="button" onclick="console.log(\'clicked:\' + document.getElementById(\'inp\').value)">Go</button>',
            '</body></html>',
          ].join('')
        );
      });

      const baseUrl = await new Promise<string>((resolveUrl) => {
        server.listen(0, '127.0.0.1', () => {
          const addr = server.address();
          const port = typeof addr === 'object' && addr !== null ? addr.port : 0;
          resolveUrl(`http://127.0.0.1:${port}`);
        });
      });

      const options: BrowserSessionOptions = {
        driver: 'auto',
        initialUrl: `${baseUrl}/`,
        timeoutMs: 25_000,
      };

      let session: BrowserSession | undefined;
      try {
        session = await openBrowserSession(options);
        await session.fill('#inp', 'hello-e2e');
        await session.click('#btn');
        const val = await session.eval<string>("() => document.getElementById('inp').value");
        assert.equal(val, 'hello-e2e');
        const logs = await session.console();
        assert.ok(logs.some((entry) => entry.text.includes('clicked:hello-e2e')));
        const snap = await session.snapshot();
        assert.ok(snap.length > 0);

        const tab2Idx = await session.newTab(`${baseUrl}/tab2`);
        const tabs = await session.listTabs();
        assert.equal(tabs.length, 2);
        await session.selectTab(0);
        const title0 = await session.eval<string>('() => document.title');
        assert.equal(title0, 'Tab One');
        await session.selectTab(tab2Idx);
        const title1 = await session.eval<string>('() => document.title');
        assert.equal(title1, 'Tab Two');
      } finally {
        await session?.close();
        await closeAllBrowserSessions();
        server.closeAllConnections?.();
        await new Promise<void>((resolveClose) => {
          server.close(() => {
            resolveClose();
          });
        });
      }
    }
  );
});
