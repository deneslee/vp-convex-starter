// fallow-ignore-file unused-file
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { runCmd } from '../helpers/process.ts';
import {
  existsInRepo,
  readRepoText,
  repoPath,
  scanBlockNoteStyleCssBan,
  scanForbiddenImports,
  walkFiles,
} from '../helpers/workspace.ts';

describe('Tier 1 — F8..F9 @repo/ui Tokens, Theme & Primitives', () => {
  it('T1-F8-01: tokens.css defines primitive scales and semantic.css defines light and dark semantic variables', () => {
    assert.ok(existsInRepo('packages', 'ui', 'src', 'styles', 'tokens.css'));
    assert.ok(existsInRepo('packages', 'ui', 'src', 'styles', 'semantic.css'));
    const tokens = readRepoText('packages', 'ui', 'src', 'styles', 'tokens.css');
    const semantic = readRepoText('packages', 'ui', 'src', 'styles', 'semantic.css');
    assert.match(tokens, /--/);
    assert.match(semantic, /:root/);
    assert.match(semantic, /\[data-mantine-color-scheme=['"]dark['"]\]/);
    for (const prefix of [
      '--surface-canvas',
      '--surface-panel',
      '--border-subtle',
      '--border-default',
      '--text-primary',
      '--text-muted',
      '--accent-primary',
      '--status-success',
      '--status-warning',
      '--status-danger',
      '--space-md',
      '--radius-md',
    ]) {
      assert.ok(semantic.includes(prefix), `Missing semantic CSS token: ${prefix}`);
    }
  });

  it('T1-F8-02: semantic.css maps BlockNote --bn-colors-* variables to semantic tokens', () => {
    assert.ok(existsInRepo('packages', 'ui', 'src', 'styles', 'semantic.css'));
    const semantic = readRepoText('packages', 'ui', 'src', 'styles', 'semantic.css');
    assert.match(semantic, /--bn-colors-editor-background\s*:\s*var\(--/);
    assert.match(semantic, /--bn-colors-editor-text\s*:\s*var\(--/);
  });

  it('T1-F8-03: theme.ts exports theme via createTheme with components overrides', () => {
    assert.ok(existsInRepo('packages', 'ui', 'src', 'theme', 'theme.ts'));
    const themeSrc = readRepoText('packages', 'ui', 'src', 'theme', 'theme.ts');
    assert.match(themeSrc, /\bcreateTheme\b/);
    assert.match(themeSrc, /export\s+(?:const|function)\s+theme\b|\bexport\s*\{[^}]*\btheme\b/);
    assert.match(themeSrc, /\bcomponents\s*:/);
  });

  it('T1-F8-04: cssVariablesResolver.ts exports cssVariablesResolver without duplicating semantic tokens', () => {
    assert.ok(existsInRepo('packages', 'ui', 'src', 'theme', 'cssVariablesResolver.ts'));
    const resolverSrc = readRepoText('packages', 'ui', 'src', 'theme', 'cssVariablesResolver.ts');
    assert.match(resolverSrc, /\bcssVariablesResolver\b/);
    assert.doesNotMatch(resolverSrc, /['"]--surface-canvas['"]\s*:/);
    assert.doesNotMatch(resolverSrc, /['"]--text-primary['"]\s*:/);
  });

  it('T1-F8-05: apps/web/postcss.config.mjs configures Mantine PostCSS and @repo/ui exports ./styles', () => {
    assert.ok(existsInRepo('apps', 'web', 'postcss.config.mjs'));
    const postcss = readRepoText('apps', 'web', 'postcss.config.mjs');
    assert.match(postcss, /postcss-preset-mantine/);
    assert.match(postcss, /postcss-simple-vars/);
    assert.match(postcss, /mantine-breakpoint-xs/);

    assert.ok(existsInRepo('packages', 'ui', 'package.json'));
    const uiPkg = JSON.parse(readRepoText('packages', 'ui', 'package.json')) as {
      exports?: Record<string, unknown>;
    };
    assert.ok(uiPkg.exports?.['./styles'], 'packages/ui/package.json must export ./styles');
  });

  it('T1-F9-01: packages/ui/src/index.ts exports theme, cssVariablesResolver, and all 7 UI primitives', () => {
    assert.ok(existsInRepo('packages', 'ui', 'src', 'index.ts'));
    const indexSrc = readRepoText('packages', 'ui', 'src', 'index.ts');
    for (const symbol of [
      'theme',
      'cssVariablesResolver',
      'AppFrame',
      'RecordTable',
      'RecordDetailCard',
      'AssetDropzone',
      'AssetGallery',
      'MarkdownWorkspace',
      'SemanticSearchBar',
    ]) {
      assert.ok(indexSrc.includes(symbol), `Missing @repo/ui export: ${symbol}`);
    }
  });

  it('T1-F9-02: MarkdownWorkspace supports blocks/raw modes and imports blocknoteStyles.css (never style.css)', () => {
    assert.ok(existsInRepo('packages', 'ui', 'src'));
    const uiFiles = walkFiles(repoPath('packages', 'ui', 'src'), {
      extensions: ['.ts', '.tsx'],
    });
    assert.ok(uiFiles.length > 0);
    assert.deepEqual(scanBlockNoteStyleCssBan(uiFiles), []);
    const workspaceFile = uiFiles.find((f) => f.endsWith('MarkdownWorkspace.tsx'));
    assert.ok(workspaceFile, 'Missing MarkdownWorkspace.tsx');
    const src = readRepoText('packages', 'ui', 'src', 'primitives', 'MarkdownWorkspace.tsx');
    assert.match(src, /@blocknote\/mantine\/blocknoteStyles\.css/);
    assert.match(src, /\bonModeChange\b/);
    assert.match(src, /\bonUploadImage\b/);
    assert.match(src, /\breadOnly\b/);
  });

  it('T1-F9-03: RecordTable and RecordDetailCard expose semantic props and colocated CSS modules', () => {
    const rtPath = repoPath('packages', 'ui', 'src', 'primitives', 'RecordTable.tsx');
    const rdcPath = repoPath('packages', 'ui', 'src', 'primitives', 'RecordDetailCard.tsx');
    assert.ok(existsInRepo('packages', 'ui', 'src', 'primitives', 'RecordTable.tsx'), rtPath);
    assert.ok(existsInRepo('packages', 'ui', 'src', 'primitives', 'RecordDetailCard.tsx'), rdcPath);
    assert.ok(existsInRepo('packages', 'ui', 'src', 'primitives', 'RecordTable.module.css'));
    const rtSrc = readRepoText('packages', 'ui', 'src', 'primitives', 'RecordTable.tsx');
    const rdcSrc = readRepoText('packages', 'ui', 'src', 'primitives', 'RecordDetailCard.tsx');
    assert.match(rtSrc, /\bdensity\b|\bstatus\b/);
    assert.match(rdcSrc, /\bstatus\b|\bintent\b/);
  });

  it('T1-F9-04: AssetDropzone, AssetGallery, and SemanticSearchBar exist with colocated module CSS and mode props', () => {
    for (const name of ['AssetDropzone', 'AssetGallery', 'SemanticSearchBar']) {
      assert.ok(
        existsInRepo('packages', 'ui', 'src', 'primitives', `${name}.tsx`),
        `Missing ${name}.tsx`
      );
      assert.ok(
        existsInRepo('packages', 'ui', 'src', 'primitives', `${name}.module.css`),
        `Missing ${name}.module.css`
      );
    }
    const gallerySrc = readRepoText('packages', 'ui', 'src', 'primitives', 'AssetGallery.tsx');
    assert.match(gallerySrc, /@mantine\/lightbox/);
    const searchSrc = readRepoText('packages', 'ui', 'src', 'primitives', 'SemanticSearchBar.tsx');
    assert.match(searchSrc, /keyword/);
    assert.match(searchSrc, /semantic/);
  });

  it('T1-F9-05: packages/ui has zero convex/tanstack/zustand imports and ui Vitest suite passes', async () => {
    assert.ok(existsInRepo('packages', 'ui', 'src'));
    const uiFiles = walkFiles(repoPath('packages', 'ui', 'src'), {
      extensions: ['.ts', '.tsx'],
    });
    assert.ok(uiFiles.length > 0);
    const violations = scanForbiddenImports(uiFiles, [
      'convex',
      'convex/*',
      '@convex-dev/*',
      '@tanstack/*',
      'zustand',
    ]);
    assert.deepEqual(violations, []);

    const res = await runCmd('vp', ['test', 'run', '--project', 'ui'], {
      cwd: repoPath(),
      timeoutMs: 60_000,
    });
    assert.equal(res.exitCode, 0, `${res.stdout}\n${res.stderr}`);
  });
});
