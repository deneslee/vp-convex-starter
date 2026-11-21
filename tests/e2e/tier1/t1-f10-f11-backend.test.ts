// fallow-ignore-file unused-file
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { describe, it } from 'node:test';
import { runCmd } from '../helpers/process.ts';
import {
  existsInRepo,
  readRepoText,
  repoPath,
  scanDirectEnvReads,
  scanForbiddenImports,
  walkFiles,
} from '../helpers/workspace.ts';

describe('Tier 1 — F10..F11 @repo/backend Convex Config & Functions', () => {
  it('T1-F10-01: .agents/skills contains >=35 Convex skills including rag/workpool docs and skills-lock.json exists', () => {
    assert.ok(existsInRepo('skills-lock.json'));
    assert.ok(existsInRepo('.agents', 'skills', 'convex-dev-rag', 'SKILL.md'));
    assert.ok(existsInRepo('.agents', 'skills', 'convex-dev-workpool', 'llms.txt'));
    const skillDirs = readdirSync(repoPath('.agents', 'skills'), { withFileTypes: true }).filter(
      (entry) => entry.isDirectory()
    );
    assert.ok(skillDirs.length >= 35, `Expected >=35 skills, found ${skillDirs.length}`);
  });

  it('T1-F10-02: convex.config.ts mounts rag and ragIndexPool workpool with typed defineApp env and zero process.env reads', () => {
    assert.ok(existsInRepo('packages', 'backend', 'convex', 'convex.config.ts'));
    const cfg = readRepoText('packages', 'backend', 'convex', 'convex.config.ts');
    assert.match(cfg, /@convex-dev\/rag\/convex\.config\.js/);
    assert.match(cfg, /@convex-dev\/workpool\/convex\.config\.js/);
    assert.match(cfg, /ragIndexPool/);
    assert.match(cfg, /defineApp\s*\(/);
    assert.match(cfg, /OPENAI_API_KEY/);
    assert.match(cfg, /EMBEDDING_MODEL/);

    const backendFiles = walkFiles(repoPath('packages', 'backend', 'convex'), {
      extensions: ['.ts', '.tsx'],
    });
    assert.deepEqual(scanDirectEnvReads(backendFiles), []);
  });

  it('T1-F10-03: packages/backend exports only _generated/api and _generated/dataModel and has zero React/UI imports', () => {
    assert.ok(existsInRepo('packages', 'backend', 'package.json'));
    const pkg = JSON.parse(readRepoText('packages', 'backend', 'package.json')) as {
      exports?: Record<string, string>;
    };
    assert.equal(pkg.exports?.['./_generated/api'], './convex/_generated/api.js');
    assert.equal(pkg.exports?.['./_generated/dataModel'], './convex/_generated/dataModel.d.ts');

    const backendFiles = walkFiles(repoPath('packages', 'backend', 'convex'), {
      extensions: ['.ts', '.tsx'],
    });
    assert.ok(backendFiles.length > 0);
    const violations = scanForbiddenImports(backendFiles, [
      'react',
      'react-dom',
      '@mantine/*',
      '@blocknote/*',
      '@repo/ui',
    ]);
    assert.deepEqual(violations, []);
  });

  it('T1-F10-04: packages/backend/convex excludes auth files from _refs/convex-ref and includes tsconfig & ai guidelines', () => {
    assert.ok(existsInRepo('packages', 'backend', 'convex', 'tsconfig.json'));
    assert.ok(existsInRepo('packages', 'backend', 'convex', '_generated', 'ai', 'guidelines.md'));
    assert.equal(existsInRepo('packages', 'backend', 'convex', 'auth.ts'), false);
    assert.equal(existsInRepo('packages', 'backend', 'convex', 'auth.config.ts'), false);
    assert.equal(existsInRepo('packages', 'backend', 'convex', 'users.ts'), false);
  });

  it('T1-F10-05: vpr convex:typecheck exits 0', async () => {
    assert.ok(existsInRepo('packages', 'backend', 'package.json'));
    const res = await runCmd('vpr', ['convex:typecheck'], {
      cwd: repoPath(),
      timeoutMs: 90_000,
    });
    assert.equal(res.exitCode, 0, `${res.stdout}\n${res.stderr}`);
  });

  it('T1-F11-01: records.ts and schema.ts define records table, indexes, and bounded appQuery/appMutation handlers', () => {
    assert.ok(existsInRepo('packages', 'backend', 'convex', 'schema.ts'));
    assert.ok(existsInRepo('packages', 'backend', 'convex', 'records.ts'));
    const schema = readRepoText('packages', 'backend', 'convex', 'schema.ts');
    assert.match(schema, /by_clientId/);
    assert.match(schema, /search_records/);
    const recordsSrc = readRepoText('packages', 'backend', 'convex', 'records.ts');
    for (const fn of ['list', 'getById', 'upsert', 'update', 'remove']) {
      assert.match(recordsSrc, new RegExp(`export const ${fn}\\b`));
    }
    assert.match(recordsSrc, /appQuery|appMutation/);
    assert.match(recordsSrc, /\.take\(\s*200\s*\)/);
  });

  it('T1-F11-02: documents.ts provides bounded listSummaries omitting markdown, getBySlug, ragIndexPool enqueue, and cascade remove', () => {
    assert.ok(existsInRepo('packages', 'backend', 'convex', 'documents.ts'));
    const docsSrc = readRepoText('packages', 'backend', 'convex', 'documents.ts');
    for (const fn of [
      'listSummaries',
      'getBySlug',
      'upsert',
      'update',
      'importMarkdown',
      'remove',
      'markRagStatus',
    ]) {
      assert.match(docsSrc, new RegExp(`export const ${fn}\\b`));
    }
    assert.match(docsSrc, /\.take\(\s*200\s*\)/);
    assert.match(docsSrc, /ragIndexPool/);
    assert.match(docsSrc, /getNamespace/);
    assert.match(docsSrc, /deleteByKeyAsync/);
  });

  it('T1-F11-03: assets.ts uses ctx.db.system.get("_storage") instead of deprecated getMetadata and cascade-deletes', () => {
    assert.ok(existsInRepo('packages', 'backend', 'convex', 'assets.ts'));
    const assetsSrc = readRepoText('packages', 'backend', 'convex', 'assets.ts');
    for (const fn of ['generateUploadUrl', 'finalizeUpload', 'listAssets', 'removeAsset']) {
      assert.match(assetsSrc, new RegExp(`export const ${fn}\\b`));
    }
    assert.match(assetsSrc, /ctx\.db\.system\.get\(/);
    assert.doesNotMatch(assetsSrc, /getMetadata/);
    assert.match(assetsSrc, /ctx\.storage\.delete\(/);
  });

  it('T1-F11-04: search.ts runs bounded keywordSearch and searchActions.ts isolates indexDocument & semanticSearch', () => {
    assert.ok(existsInRepo('packages', 'backend', 'convex', 'search.ts'));
    assert.ok(existsInRepo('packages', 'backend', 'convex', 'searchActions.ts'));
    const searchSrc = readRepoText('packages', 'backend', 'convex', 'search.ts');
    const actionsSrc = readRepoText('packages', 'backend', 'convex', 'searchActions.ts');
    assert.match(searchSrc, /export const keywordSearch\b/);
    assert.match(searchSrc, /\.withSearchIndex\(/);
    assert.match(searchSrc, /\.take\(\s*20\s*\)/);
    assert.match(actionsSrc, /export const indexDocument\b/);
    assert.match(actionsSrc, /export const semanticSearch\b/);
  });

  it('T1-F11-05: vp test run --project backend passes all convex-test suites', async () => {
    assert.ok(existsInRepo('packages', 'backend', 'package.json'));
    const res = await runCmd('vp', ['test', 'run', '--project', 'backend'], {
      cwd: repoPath(),
      timeoutMs: 90_000,
    });
    assert.equal(res.exitCode, 0, `${res.stdout}\n${res.stderr}`);
  });
});
