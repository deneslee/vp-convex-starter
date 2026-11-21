// fallow-ignore-file unused-file
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { runCmd } from '../helpers/process.ts';
import {
  checkProvidersCssOrder,
  existsInRepo,
  EXPECTED_PROVIDERS_CSS_ORDER,
  readRepoText,
  readTextFile,
  repoPath,
  scanBannedMantineProps,
  scanBlockNoteStyleCssBan,
  walkFiles,
} from '../helpers/workspace.ts';

describe('Tier 1 — F12..F13 apps/web Core SPA & Routes', () => {
  it('T1-F12-01: apps/web/vite.config.ts registers devtools, varlockVitePlugin, tanstackRouter, and viteReact in order', () => {
    assert.ok(existsInRepo('apps', 'web', 'vite.config.ts'));
    const cfg = readRepoText('apps', 'web', 'vite.config.ts');
    const order = ['devtools(', 'varlockVitePlugin(', 'tanstackRouter(', 'viteReact('];
    let prevIdx = -1;
    for (const token of order) {
      const idx = cfg.indexOf(token);
      assert.ok(
        idx > prevIdx,
        `Plugin ${token} missing or out of order in apps/web/vite.config.ts`
      );
      prevIdx = idx;
    }
  });

  it('T1-F12-02: apps/web/src/data/clients.ts initializes ConvexReactClient, ConvexQueryClient, and QueryClient from ENV', () => {
    assert.ok(existsInRepo('apps', 'web', 'src', 'data', 'clients.ts'));
    const src = readRepoText('apps', 'web', 'src', 'data', 'clients.ts');
    assert.match(src, /from\s+['"]varlock\/env['"]/);
    assert.match(src, /ENV\.VITE_CONVEX_URL/);
    assert.match(src, /\bconvexClient\b/);
    assert.match(src, /\bconvexQueryClient\b/);
    assert.match(src, /\bqueryClient\b/);
  });

  it('T1-F12-03: apps/web/src/data/collections.ts defines module-scope TanStack DB collections keyed on clientId', () => {
    assert.ok(existsInRepo('apps', 'web', 'src', 'data', 'collections.ts'));
    const src = readRepoText('apps', 'web', 'src', 'data', 'collections.ts');
    assert.match(src, /\brecordsCollection\b/);
    assert.match(src, /\bdocumentSummariesCollection\b/);
    assert.match(src, /\bassetsCollection\b/);
    assert.match(src, /\.clientId\b/);
    assert.match(src, /listSummaries/);
  });

  it('T1-F12-04: Providers.tsx enforces exact 6-CSS import order and provider nesting without BlockNote style.css', () => {
    const providersPath = repoPath('apps', 'web', 'src', 'app', 'Providers.tsx');
    assert.ok(existsInRepo('apps', 'web', 'src', 'app', 'Providers.tsx'));
    const webFiles = walkFiles(repoPath('apps', 'web', 'src'), {
      extensions: ['.ts', '.tsx', '.css'],
    });
    assert.deepEqual(scanBlockNoteStyleCssBan(webFiles), []);

    const cssOrder = checkProvidersCssOrder(providersPath);
    assert.equal(cssOrder.ok, true, `CSS order mismatch: ${JSON.stringify(cssOrder)}`);
    assert.deepEqual(cssOrder.foundImports, [...EXPECTED_PROVIDERS_CSS_ORDER]);

    const src = readRepoText('apps', 'web', 'src', 'app', 'Providers.tsx');
    for (const provider of [
      'MantineProvider',
      'ConvexProvider',
      'QueryClientProvider',
      'Notifications',
      'RouterProvider',
    ]) {
      assert.ok(src.includes(provider), `Providers.tsx missing ${provider}`);
    }
  });

  it('T1-F12-05: useWorkspaceUiStore.ts stores only ephemeral UI state and never mirrors Convex records', () => {
    assert.ok(existsInRepo('apps', 'web', 'src', 'stores', 'useWorkspaceUiStore.ts'));
    const src = readRepoText('apps', 'web', 'src', 'stores', 'useWorkspaceUiStore.ts');
    for (const key of [
      'sidebarOpen',
      'inspectorOpen',
      'selectedRecordIds',
      'editorMode',
      'activeLightboxIndex',
      'uploadQueue',
    ]) {
      assert.ok(src.includes(key), `Missing ephemeral UI state field: ${key}`);
    }
  });

  it('T1-F13-01: /records and /records/$id routes exist and wire recordsCollection + ensureQueryData', () => {
    assert.ok(existsInRepo('apps', 'web', 'src', 'routes'));
    const routeFiles = walkFiles(repoPath('apps', 'web', 'src', 'routes'), {
      extensions: ['.ts', '.tsx'],
    });
    const hasRecords = routeFiles.some((f) => f.replace(/\\/g, '/').includes('/records'));
    const hasRecordDetail = routeFiles.some((f) => f.replace(/\\/g, '/').includes('$id'));
    assert.ok(hasRecords, 'Missing /records route');
    assert.ok(hasRecordDetail, 'Missing /records/$id route');
    const allWebText = walkFiles(repoPath('apps', 'web', 'src'), { extensions: ['.ts', '.tsx'] })
      .map((file) => readTextFile(file))
      .join('\n');
    assert.match(allWebText, /recordsCollection/);
    assert.match(allWebText, /ensureQueryData/);
  });

  it('T1-F13-02: /documents and /documents/$slug routes wire documentSummariesCollection, frontmatter, MarkdownWorkspace, and ragStatus', () => {
    assert.ok(existsInRepo('apps', 'web', 'src', 'routes'));
    const routeFiles = walkFiles(repoPath('apps', 'web', 'src', 'routes'), {
      extensions: ['.ts', '.tsx'],
    });
    const hasDocs = routeFiles.some((f) => f.replace(/\\/g, '/').includes('/documents'));
    const hasDocSlug = routeFiles.some((f) => f.replace(/\\/g, '/').includes('$slug'));
    assert.ok(hasDocs, 'Missing /documents route');
    assert.ok(hasDocSlug, 'Missing /documents/$slug route');
    const allWebText = walkFiles(repoPath('apps', 'web', 'src'), { extensions: ['.ts', '.tsx'] })
      .map((file) => readTextFile(file))
      .join('\n');
    assert.match(allWebText, /documentSummariesCollection/);
    assert.match(allWebText, /parseMarkdownFrontmatter/);
    assert.match(allWebText, /MarkdownWorkspace/);
    assert.match(allWebText, /ragStatus/);
  });

  it('T1-F13-03: /assets route wires AssetDropzone, AssetGallery, uploadQueue, useClipboard, and delete action', () => {
    assert.ok(existsInRepo('apps', 'web', 'src', 'routes'));
    const routeFiles = walkFiles(repoPath('apps', 'web', 'src', 'routes'), {
      extensions: ['.ts', '.tsx'],
    });
    const hasAssets = routeFiles.some((f) => f.replace(/\\/g, '/').includes('/assets'));
    assert.ok(hasAssets, 'Missing /assets route');
    const allWebText = walkFiles(repoPath('apps', 'web', 'src'), { extensions: ['.ts', '.tsx'] })
      .map((file) => readTextFile(file))
      .join('\n');
    assert.match(allWebText, /AssetDropzone/);
    assert.match(allWebText, /AssetGallery/);
    assert.match(allWebText, /uploadQueue/);
    assert.match(allWebText, /useClipboard/);
    assert.match(allWebText, /removeAsset/);
  });

  it('T1-F13-04: apps/web/src/**/*.{ts,tsx} has zero banned Mantine visual/box-model/adhoc props', () => {
    assert.ok(existsInRepo('apps', 'web', 'src'));
    const webFiles = walkFiles(repoPath('apps', 'web', 'src'), {
      extensions: ['.ts', '.tsx'],
    });
    assert.ok(webFiles.length > 0);
    const violations = scanBannedMantineProps(webFiles);
    assert.deepEqual(violations, []);
  });

  it('T1-F13-05: vp test run --project web and vpr build pass with synthetic VITE_CONVEX_URL', async () => {
    assert.ok(existsInRepo('apps', 'web', 'package.json'));
    const testRes = await runCmd('vp', ['test', 'run', '--project', 'web'], {
      cwd: repoPath(),
      timeoutMs: 90_000,
    });
    assert.equal(testRes.exitCode, 0, `${testRes.stdout}\n${testRes.stderr}`);

    const buildRes = await runCmd('vpr', ['build'], {
      cwd: repoPath(),
      env: { VITE_CONVEX_URL: 'https://offline-test.convex.cloud' },
      timeoutMs: 120_000,
    });
    assert.equal(buildRes.exitCode, 0, `${buildRes.stdout}\n${buildRes.stderr}`);
  });
});
