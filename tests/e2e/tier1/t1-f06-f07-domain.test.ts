// fallow-ignore-file unused-file
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { runCmd, withTempProbeDir } from '../helpers/process.ts';
import { existsInRepo, repoPath, scanForbiddenImports, walkFiles } from '../helpers/workspace.ts';

async function runDomainProbe(scriptBody: string): Promise<string> {
  const entryPath = repoPath('packages', 'domain', 'src', 'index.ts');
  assert.ok(existsInRepo('packages', 'domain', 'src', 'index.ts'), `Missing ${entryPath}`);

  return withTempProbeDir('e2e-domain-probe-', async (dir) => {
    const probeFile = join(dir, 'probe.ts');
    const importUrl = `file:///${entryPath.replace(/\\/g, '/')}`;
    writeFileSync(
      probeFile,
      [
        `import * as domain from ${JSON.stringify(importUrl)};`,
        "import assert from 'node:assert/strict';",
        scriptBody,
        "process.stdout.write('PROBE_OK');",
      ].join('\n'),
      'utf8'
    );
    const res = await runCmd('vpx', [probeFile], { cwd: repoPath(), timeoutMs: 45_000 });
    assert.equal(res.exitCode, 0, `${res.stdout}\n${res.stderr}`);
    return res.stdout;
  });
}

describe('Tier 1 — F6..F7 @repo/domain Schemas & Helpers', () => {
  it('T1-F6-01: RecordSchema accepts valid draft/active/archived records and rejects invalid status', async () => {
    const out = await runDomainProbe(`
      const valid = domain.RecordSchema.parse({
        clientId: 'rec-1',
        title: 'Patient Protocol',
        category: 'clinical',
        status: 'active',
        tags: ['v1', 'core'],
        attributes: { owner: 'qa' },
        updatedAt: 1700000000000,
      });
      assert.equal(valid.status, 'active');
      const invalid = domain.RecordSchema.safeParse({
        clientId: 'rec-2',
        title: 'Bad',
        category: 'clinical',
        status: 'invalid-status',
        tags: [],
        attributes: {},
        updatedAt: 1700000000000,
      });
      assert.equal(invalid.success, false);
    `);
    assert.equal(out, 'PROBE_OK');
  });

  it('T1-F6-02: DocumentSummarySchema accepts summary payload and omits markdown field', async () => {
    const out = await runDomainProbe(`
      const summary = domain.DocumentSummarySchema.parse({
        clientId: 'doc-1',
        title: 'Architecture Note',
        slug: 'architecture-note',
        frontmatter: { author: 'ops' },
        tags: ['arch'],
        ragStatus: 'pending',
        updatedAt: 1700000000000,
        markdown: '# Should not remain on summary',
      });
      assert.equal(summary.slug, 'architecture-note');
      assert.equal('markdown' in summary, false);
    `);
    assert.equal(out, 'PROBE_OK');
  });

  it('T1-F6-03: DocumentDetailSchema accepts summary fields plus markdown and optional storageId', async () => {
    const out = await runDomainProbe(`
      const detail = domain.DocumentDetailSchema.parse({
        clientId: 'doc-2',
        title: 'Spec',
        slug: 'spec',
        frontmatter: {},
        tags: [],
        ragStatus: 'indexed',
        updatedAt: 1700000000000,
        markdown: '# Hello\\nBody',
        storageId: 'kg123',
      });
      assert.equal(detail.markdown, '# Hello\\nBody');
      assert.equal(detail.storageId, 'kg123');
    `);
    assert.equal(out, 'PROBE_OK');
  });

  it('T1-F6-04: AssetSchema accepts valid asset payload with optional dimensions and entity links', async () => {
    const out = await runDomainProbe(`
      const asset = domain.AssetSchema.parse({
        clientId: 'asset-1',
        filename: 'diagram.png',
        mimeType: 'image/png',
        sizeBytes: 2048,
        width: 800,
        height: 600,
        storageId: 'st-1',
        url: 'https://example.convex.cloud/api/storage/st-1',
        linkedEntityType: 'document',
        linkedEntityId: 'doc-1',
        createdAt: 1700000000000,
      });
      assert.equal(asset.filename, 'diagram.png');
    `);
    assert.equal(out, 'PROBE_OK');
  });

  it('T1-F6-05: packages/domain has zero imports from React, Mantine, BlockNote, TanStack, Zustand, or convex/server', () => {
    assert.ok(existsInRepo('packages', 'domain', 'src'));
    const domainFiles = walkFiles(repoPath('packages', 'domain', 'src'), {
      extensions: ['.ts', '.tsx'],
    });
    assert.ok(domainFiles.length > 0);
    const violations = scanForbiddenImports(domainFiles, [
      'react',
      'react-dom',
      '@mantine/*',
      '@blocknote/*',
      '@tanstack/*',
      'zustand',
      'convex',
      'convex/server',
    ]);
    assert.deepEqual(violations, []);
  });

  it('T1-F7-01: parseMarkdownFrontmatter extracts title, tags, custom frontmatter, and trimmed body', async () => {
    const out = await runDomainProbe(`
      const parsed = domain.parseMarkdownFrontmatter([
        '---',
        'title: Clinical Runbook',
        'tags: [triage, protocols]',
        'owner: team-a',
        '---',
        '',
        '# Heading',
        'Content line.',
      ].join('\\n'));
      assert.equal(parsed.title, 'Clinical Runbook');
      assert.deepEqual(parsed.tags, ['triage', 'protocols']);
      assert.equal(parsed.frontmatter.owner, 'team-a');
      assert.match(parsed.body, /^# Heading/);
    `);
    assert.equal(out, 'PROBE_OK');
  });

  it('T1-F7-02: chunkMarkdownByHeadings splits multi-section Markdown preserving heading names and order', async () => {
    const out = await runDomainProbe(`
      const chunks = domain.chunkMarkdownByHeadings([
        '# Alpha',
        'First section.',
        '## Beta',
        'Second section.',
      ].join('\\n'));
      assert.equal(chunks.length, 2);
      assert.equal(chunks[0].heading, 'Alpha');
      assert.match(chunks[0].content, /First section/);
      assert.equal(chunks[1].heading, 'Beta');
      assert.match(chunks[1].content, /Second section/);
    `);
    assert.equal(out, 'PROBE_OK');
  });

  it('T1-F7-03: slugifyTitle normalizes mixed casing, spaces, and punctuation', async () => {
    const out = await runDomainProbe(`
      assert.equal(domain.slugifyTitle('  Hello, World!! 2026  '), 'hello-world-2026');
    `);
    assert.equal(out, 'PROBE_OK');
  });

  it('T1-F7-04: createClientId returns valid RFC 4122 UUIDs and unique values across calls', async () => {
    const out = await runDomainProbe(`
      const id1 = domain.createClientId();
      const id2 = domain.createClientId();
      assert.match(id1, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      assert.notEqual(id1, id2);
    `);
    assert.equal(out, 'PROBE_OK');
  });

  it('T1-F7-05: vp test run --project domain passes all domain unit tests', async () => {
    assert.ok(existsInRepo('packages', 'domain', 'package.json'));
    const res = await runCmd('vp', ['test', 'run', '--project', 'domain'], {
      cwd: repoPath(),
      timeoutMs: 60_000,
    });
    assert.equal(res.exitCode, 0, `${res.stdout}\n${res.stderr}`);
  });
});
