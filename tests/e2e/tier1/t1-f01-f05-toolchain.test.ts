// fallow-ignore-file unused-file
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { runCmd } from '../helpers/process.ts';
import {
  existsInRepo,
  parseEnvSchema,
  parseJsonc,
  parsePnpmWorkspaceYaml,
  readRepoText,
  repoPath,
  scanDirectEnvReads,
  walkFiles,
} from '../helpers/workspace.ts';

const EXPECTED_CATALOG_61: Record<string, string> = {
  'vite-plus': '1.7.0',
  vite: 'npm:@voidzero-dev/vite-plus-core@8.3.8000',
  typescript: '7.0.2',
  'oxc-config-mantine': '1.0.3',
  stylelint: '18.1.0',
  'stylelint-config-standard': '41.1.0',
  varlock: '1.25.0',
  '@varlock/vite-integration': '1.5.6',
  fallow: '3.45.0',
  taze: '21.3.0',
  'cross-env': '10.1.0',
  react: '19.3.1',
  'react-dom': '19.3.1',
  '@types/react': '19.3.0',
  '@types/react-dom': '19.3.0',
  '@types/node': '26.6.6',
  '@vitejs/plugin-react': '6.3.0',
  jsdom: '31.0.1',
  '@testing-library/react': '16.3.3',
  '@testing-library/dom': '10.4.2',
  '@testing-library/jest-dom': '8.0.0',
  '@testing-library/user-event': '14.6.13',
  'convex-test': '0.0.73',
  '@edge-runtime/vm': '5.0.0',
  '@mantine/core': '9.8.2',
  '@mantine/hooks': '9.8.2',
  '@mantine/notifications': '9.8.2',
  '@mantine/dropzone': '9.8.2',
  '@mantine/lightbox': '9.8.2',
  'embla-carousel': '8.6.0',
  'embla-carousel-react': '8.6.0',
  postcss: '8.5.33',
  'postcss-preset-mantine': '1.18.0',
  'postcss-simple-vars': '7.0.1',
  'lucide-react': '1.77.0',
  '@blocknote/core': '0.57.0',
  '@blocknote/react': '0.57.0',
  '@blocknote/mantine': '0.57.0',
  '@tanstack/react-router': '1.170.46',
  '@tanstack/router-plugin': '1.169.0',
  '@tanstack/react-query': '5.108.2',
  '@tanstack/db': '1.0.0-rc.1.5',
  '@tanstack/react-db': '1.0.0-rc.1.5',
  '@tanstack/convex-db-collection': '1.0.0-rc.1.5',
  '@tanstack/intent': '0.5.6',
  '@tanstack/eslint-plugin-router': '1.162.0',
  '@tanstack/eslint-plugin-query': '5.108.2',
  '@tanstack/devtools-vite': '0.8.7',
  '@tanstack/react-devtools': '0.10.15',
  '@tanstack/react-router-devtools': '1.167.4',
  '@tanstack/react-query-devtools': '5.108.2',
  convex: '1.51.0',
  'convex-helpers': '0.1.136',
  '@convex-dev/react-query': '0.1.0',
  '@convex-dev/rag': '0.7.9',
  '@convex-dev/workpool': '0.5.0',
  '@convex-dev/eslint-plugin': '5.0.1',
  ai: '7.0.178',
  '@ai-sdk/openai': '4.0.122',
  zod: '4.6.7',
  zustand: '5.1.0',
};

describe('Tier 1 — F1..F5 Monorepo & Toolchain', () => {
  it('T1-F1-01: pnpm-workspace.yaml defines packages, savePrefix, catalogMode, and allowBuilds.esbuild', () => {
    assert.ok(existsInRepo('pnpm-workspace.yaml'));
    const ws = parsePnpmWorkspaceYaml(readRepoText('pnpm-workspace.yaml'));
    assert.deepEqual(ws.packages, ['apps/*', 'packages/*', 'tools/*']);
    assert.equal(ws.savePrefix, '');
    assert.equal(ws.catalogMode, 'prefer');
    assert.equal(ws.allowBuilds.esbuild, true);
  });

  it('T1-F1-02: pnpm-workspace.yaml catalog contains all 61 dependencies with exact verified versions', () => {
    assert.ok(existsInRepo('pnpm-workspace.yaml'));
    const ws = parsePnpmWorkspaceYaml(readRepoText('pnpm-workspace.yaml'));
    const expectedEntries = Object.entries(EXPECTED_CATALOG_61);
    assert.equal(expectedEntries.length, 61);
    assert.equal(Object.keys(ws.catalog).length, 61);
    for (const [pkg, version] of expectedEntries) {
      assert.equal(ws.catalog[pkg], version, `Catalog version mismatch for ${pkg}`);
    }
  });

  it('T1-F1-03: pnpm-workspace.yaml overrides vite@* to catalog:, has no vitest override, and omits minimumReleaseAge', () => {
    assert.ok(existsInRepo('pnpm-workspace.yaml'));
    const ws = parsePnpmWorkspaceYaml(readRepoText('pnpm-workspace.yaml'));
    assert.equal(ws.overrides['vite@*'], 'catalog:');
    assert.equal(ws.overrides.vitest, undefined);
    assert.equal(ws.overrides['vitest@*'], undefined);
    assert.equal(ws.minimumReleaseAge, undefined);
  });

  it('T1-F1-04: workspace package manifests use catalog: or workspace:* for cataloged dependencies', () => {
    const manifests = [
      'apps/web/package.json',
      'packages/domain/package.json',
      'packages/ui/package.json',
      'packages/backend/package.json',
      'tools/tsconfig/package.json',
    ];
    for (const rel of manifests) {
      assert.ok(existsInRepo(rel), `Missing workspace manifest: ${rel}`);
      const pkg = JSON.parse(readRepoText(rel)) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      for (const section of [pkg.dependencies, pkg.devDependencies]) {
        if (!section) {
          continue;
        }
        for (const [dep, spec] of Object.entries(section)) {
          if (dep in EXPECTED_CATALOG_61) {
            assert.equal(spec, 'catalog:', `${rel}: ${dep} must use "catalog:"`);
          }
          if (dep.startsWith('@repo/')) {
            assert.equal(spec, 'workspace:*', `${rel}: ${dep} must use "workspace:*"`);
          }
        }
      }
    }
  });

  it('T1-F1-05: pnpm ls resolves @repo/domain, @repo/ui, @repo/backend, @repo/web, and @repo/tsconfig cleanly', async () => {
    const res = await runCmd('pnpm', ['ls', '--depth', '-1', '-r', '--json'], {
      cwd: repoPath(),
      timeoutMs: 30_000,
    });
    assert.equal(res.exitCode, 0, res.stderr || res.stdout);
    const listed = JSON.parse(res.stdout) as Array<{ name?: string }>;
    const names = new Set(listed.map((item) => item.name).filter(Boolean));
    for (const expectedName of [
      '@repo/domain',
      '@repo/ui',
      '@repo/backend',
      '@repo/web',
      '@repo/tsconfig',
    ]) {
      assert.ok(names.has(expectedName), `Workspace package missing from pnpm ls: ${expectedName}`);
    }
  });

  it('T1-F2-01: root package.json sets pnpm@12.21.0, engines.node, devEngines.packageManager, and non-overlapping scripts', () => {
    assert.ok(existsInRepo('package.json'));
    assert.ok(existsInRepo('vite.config.ts'));
    const rootPkg = JSON.parse(readRepoText('package.json')) as {
      packageManager?: string;
      engines?: { node?: string };
      devEngines?: { packageManager?: { name?: string; version?: string } };
      scripts?: Record<string, string>;
    };
    assert.equal(rootPkg.packageManager, 'pnpm@12.21.0');
    assert.ok(rootPkg.engines?.node);
    assert.equal(rootPkg.devEngines?.packageManager?.name, 'pnpm');
    assert.equal(rootPkg.devEngines?.packageManager?.version, '12.21.0');

    const viteCfg = readRepoText('vite.config.ts');
    const scriptNames = Object.keys(rootPkg.scripts ?? {});
    const taskBlockMatch = viteCfg.match(/tasks\s*:\s*\{([\s\S]*?)\n\s{4}\}/);
    assert.ok(taskBlockMatch, 'vite.config.ts must define run.tasks');
    for (const scriptName of scriptNames) {
      const escaped = scriptName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const taskKeyRegex = new RegExp(`(?:['"]${escaped}['"]|\\b${escaped})\\s*:`);
      assert.equal(
        taskKeyRegex.test(taskBlockMatch[1]),
        false,
        `Script "${scriptName}" overlaps vite.config.ts run.tasks`
      );
    }
  });

  it('T1-F2-02: vpr check executes Oxfmt + Oxlint and exits 0', async () => {
    assert.ok(existsInRepo('vite.config.ts'));
    const res = await runCmd('vpr', ['check'], { cwd: repoPath(), timeoutMs: 60_000 });
    assert.equal(res.exitCode, 0, `${res.stdout}\n${res.stderr}`);
  });

  it('T1-F2-03: vpr fmt:check and vpr lint exit 0', async () => {
    assert.ok(existsInRepo('vite.config.ts'));
    const fmtRes = await runCmd('vpr', ['fmt:check'], { cwd: repoPath(), timeoutMs: 60_000 });
    assert.equal(fmtRes.exitCode, 0, `${fmtRes.stdout}\n${fmtRes.stderr}`);
    const lintRes = await runCmd('vpr', ['lint'], { cwd: repoPath(), timeoutMs: 60_000 });
    assert.equal(lintRes.exitCode, 0, `${lintRes.stdout}\n${lintRes.stderr}`);
  });

  it('T1-F2-04: vite.config.ts configures staged hooks, run.cache.tasks: true, and fmt without sortTailwindcss', () => {
    assert.ok(existsInRepo('vite.config.ts'));
    const viteCfg = readRepoText('vite.config.ts');
    assert.match(viteCfg, /vp fmt --no-error-on-unmatched-pattern/);
    assert.match(viteCfg, /\*\*\/\*\.module\.css/);
    assert.match(viteCfg, /stylelint --fix/);
    assert.match(viteCfg, /tasks\s*:\s*true/);
    assert.doesNotMatch(viteCfg, /sortTailwindcss/);
  });

  it('T1-F2-05: vite.config.ts configures typeAware/typeCheck, 4 jsPlugins, and Vitest projects', () => {
    assert.ok(existsInRepo('vite.config.ts'));
    const viteCfg = readRepoText('vite.config.ts');
    assert.match(viteCfg, /typeAware\s*:\s*true/);
    assert.match(viteCfg, /typeCheck\s*:\s*true/);
    for (const plugin of [
      'vite-plus/oxlint-plugin',
      '@tanstack/eslint-plugin-router',
      '@tanstack/eslint-plugin-query',
      '@convex-dev/eslint-plugin',
    ]) {
      assert.ok(viteCfg.includes(plugin), `Missing jsPlugin in vite.config.ts: ${plugin}`);
    }
    assert.match(viteCfg, /name\s*:\s*['"]domain['"]/);
    assert.match(viteCfg, /name\s*:\s*['"]backend['"]/);
    assert.match(viteCfg, /name\s*:\s*['"]ui['"]/);
    assert.match(viteCfg, /name\s*:\s*['"]web['"]/);
  });

  it('T1-F3-01: tools/tsconfig presets enable TS7 strict, Bundler, erasableSyntaxOnly, and verbatimModuleSyntax', () => {
    for (const file of [
      'tools/tsconfig/package.json',
      'tools/tsconfig/base.json',
      'tools/tsconfig/react.json',
      'tools/tsconfig/node.json',
    ]) {
      assert.ok(existsInRepo(file), `Missing ${file}`);
    }
    const base = parseJsonc<{ compilerOptions: Record<string, unknown> }>(
      readRepoText('tools/tsconfig/base.json')
    );
    const opts = base.compilerOptions;
    assert.equal(opts.strict, true);
    assert.equal(opts.moduleResolution, 'Bundler');
    assert.equal(opts.erasableSyntaxOnly, true);
    assert.equal(opts.verbatimModuleSyntax, true);
    assert.equal(opts.resolvePackageJsonImports, true);
    assert.equal(opts.noEmit, true);
    assert.equal(opts.skipLibCheck, true);
  });

  it('T1-F3-02: .vite-hooks/pre-commit invokes vp staged', () => {
    assert.ok(existsInRepo('.vite-hooks/pre-commit'));
    assert.match(readRepoText('.vite-hooks/pre-commit'), /\bvp staged\b/);
  });

  it('T1-F3-03: .gitignore excludes _refs, env files except schema/example, generated files, and build caches', () => {
    assert.ok(existsInRepo('.gitignore'));
    const gitignore = readRepoText('.gitignore');
    for (const pattern of [
      '_refs',
      '.env',
      '!.env.schema',
      '!.env.example',
      'env.d.ts',
      'dist',
      '.vitest',
      '.tanstack',
      '.fallow',
    ]) {
      assert.ok(gitignore.includes(pattern), `Missing .gitignore rule: ${pattern}`);
    }
  });

  it('T1-F3-04: .editorconfig and .gitattributes enforce UTF-8, LF, and 2-space indentation', () => {
    assert.ok(existsInRepo('.editorconfig'));
    assert.ok(existsInRepo('.gitattributes'));
    const editorconfig = readRepoText('.editorconfig');
    assert.match(editorconfig, /charset\s*=\s*utf-8/i);
    assert.match(editorconfig, /end_of_line\s*=\s*lf/i);
    assert.match(editorconfig, /indent_size\s*=\s*2/);
    assert.match(readRepoText('.gitattributes'), /eol=lf/);
  });

  it('T1-F3-05: .vscode and .agents/workflow.md exist without Tailwind recommendations and use vpr commands', () => {
    assert.ok(existsInRepo('.vscode/extensions.json'));
    assert.ok(existsInRepo('.vscode/settings.json'));
    assert.ok(existsInRepo('.agents/workflow.md'));
    assert.doesNotMatch(readRepoText('.vscode/extensions.json'), /tailwind/i);
    assert.match(readRepoText('.agents/workflow.md'), /\bvpr\b/);
  });

  it('T1-F4-01: vpr stylelint exits 0 across workspace CSS files', async () => {
    assert.ok(existsInRepo('.stylelintrc.json'));
    const res = await runCmd('vpr', ['stylelint'], { cwd: repoPath(), timeoutMs: 60_000 });
    assert.equal(res.exitCode, 0, `${res.stdout}\n${res.stderr}`);
  });

  it('T1-F4-02: .stylelintrc.json bans hex/color-fn/raw units in *.module.css while exempting tokens.css and semantic.css', () => {
    assert.ok(existsInRepo('.stylelintrc.json'));
    const cfg = parseJsonc<{
      extends?: string | string[];
      overrides?: Array<{ files?: string[]; rules?: Record<string, unknown> }>;
    }>(readRepoText('.stylelintrc.json'));
    const extendsList = Array.isArray(cfg.extends) ? cfg.extends : [cfg.extends];
    assert.ok(extendsList.includes('stylelint-config-standard'));
    const moduleOverride = cfg.overrides?.find((ov) => ov.files?.includes('**/*.module.css'));
    assert.ok(moduleOverride, 'Missing **/*.module.css override in .stylelintrc.json');
    assert.equal(moduleOverride.rules?.['color-no-hex'], true);
    assert.ok(Array.isArray(moduleOverride.rules?.['function-disallowed-list']));
    assert.ok(Array.isArray(moduleOverride.rules?.['unit-disallowed-list']));

    const tokensExempt = cfg.overrides?.find((ov) =>
      ov.files?.some((f) => f.includes('tokens.css') || f.includes('semantic.css'))
    );
    assert.ok(tokensExempt, 'Missing tokens.css/semantic.css exemption in .stylelintrc.json');
    assert.equal(tokensExempt.rules?.['color-no-hex'], null);
  });

  it('T1-F4-03: .stylelintignore excludes dist, _refs, node_modules, and Convex _generated', () => {
    assert.ok(existsInRepo('.stylelintignore'));
    const ignoreText = readRepoText('.stylelintignore');
    for (const marker of ['dist', '_refs', 'node_modules', 'packages/backend/convex/_generated']) {
      assert.ok(ignoreText.includes(marker), `Missing .stylelintignore entry: ${marker}`);
    }
  });

  it('T1-F4-04: vpr fallow exits 0 with zero unused files or unresolved imports', async () => {
    assert.ok(existsInRepo('.fallowrc.jsonc'));
    const res = await runCmd('vpr', ['fallow'], { cwd: repoPath(), timeoutMs: 60_000 });
    assert.equal(res.exitCode, 0, `${res.stdout}\n${res.stderr}`);
  });

  it('T1-F4-05: .fallowrc.jsonc configures app/convex entry points, workspaces, and ignorePatterns', () => {
    assert.ok(existsInRepo('.fallowrc.jsonc'));
    const fallowCfg = parseJsonc<{
      entry?: string[];
      workspaces?: { packages?: string[] };
      ignorePatterns?: string[];
    }>(readRepoText('.fallowrc.jsonc'));
    assert.ok(fallowCfg.entry?.includes('apps/web/src/main.tsx'));
    assert.ok(fallowCfg.entry?.includes('apps/web/src/routes/**/*.{ts,tsx}'));
    assert.ok(fallowCfg.entry?.includes('packages/backend/convex/**/*.ts'));
    assert.ok(fallowCfg.ignorePatterns?.some((p) => p.includes('_refs')));
    assert.ok(fallowCfg.ignorePatterns?.some((p) => p.includes('_generated')));
  });

  it('T1-F5-01: apps/web/.env.schema declares VITE_CONVEX_URL (@required @type=url) and env.d.ts codegen', () => {
    assert.ok(existsInRepo('apps/web/.env.schema'));
    const schema = parseEnvSchema(readRepoText('apps/web/.env.schema'));
    assert.ok(schema.directives.some((d) => d.includes('@generateTsTypes(path=env.d.ts)')));
    const convexVar = schema.entries.find((e) => e.name === 'VITE_CONVEX_URL');
    assert.ok(convexVar, 'VITE_CONVEX_URL missing from apps/web/.env.schema');
    assert.ok(convexVar.annotations.includes('@required'));
    assert.ok(convexVar.annotations.includes('@type=url'));
  });

  it('T1-F5-02: apps/web/.env.example documents VITE_CONVEX_URL', () => {
    assert.ok(existsInRepo('apps/web/.env.example'));
    assert.match(readRepoText('apps/web/.env.example'), /VITE_CONVEX_URL=/);
  });

  it('T1-F5-03: vpr env:codegen generates apps/web/env.d.ts and exits 0', async () => {
    assert.ok(existsInRepo('apps/web/.env.schema'));
    const res = await runCmd('vpr', ['env:codegen'], { cwd: repoPath(), timeoutMs: 60_000 });
    assert.equal(res.exitCode, 0, `${res.stdout}\n${res.stderr}`);
    assert.ok(existsInRepo('apps/web/env.d.ts'));
  });

  it('T1-F5-04: vpr env:audit passes when valid VITE_CONVEX_URL is provided', async () => {
    assert.ok(existsInRepo('apps/web/.env.schema'));
    const res = await runCmd('vpr', ['env:audit'], {
      cwd: repoPath(),
      env: { VITE_CONVEX_URL: 'https://offline-test.convex.cloud' },
      timeoutMs: 60_000,
    });
    assert.equal(res.exitCode, 0, `${res.stdout}\n${res.stderr}`);
  });

  it('T1-F5-05: apps/web/src uses varlock/env with zero direct import.meta.env or process.env reads', () => {
    const clientsPath = repoPath('apps', 'web', 'src', 'data', 'clients.ts');
    assert.ok(existsInRepo('apps', 'web', 'src', 'data', 'clients.ts'));
    const srcFiles = walkFiles(join(repoPath('apps', 'web'), 'src'), {
      extensions: ['.ts', '.tsx'],
    });
    assert.ok(srcFiles.length > 0);
    assert.deepEqual(scanDirectEnvReads(srcFiles), []);
    assert.match(readRepoText('apps', 'web', 'src', 'data', 'clients.ts'), /['"]varlock\/env['"]/);
    assert.ok(clientsPath.endsWith('clients.ts'));
  });
});
