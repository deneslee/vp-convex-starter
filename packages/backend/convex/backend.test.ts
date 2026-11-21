/// <reference types="vite/client" />
import { convexTest } from 'convex-test';
import { describe, expect, it } from 'vite-plus/test';
import { api } from './_generated/api';
import schema from './schema';

const modules = import.meta.glob('./**/*.ts');

describe('@repo/backend Convex functions', () => {
  it('supports idempotent upsert, update, list, and remove for records', async () => {
    const t = convexTest(schema, modules);

    await t.mutation(api.records.upsert, {
      clientId: 'rec-1',
      title: 'Initial Record',
      category: 'Architecture',
      status: 'draft',
      tags: ['convex'],
      attributes: { owner: 'team' },
    });

    await t.mutation(api.records.upsert, {
      clientId: 'rec-1',
      title: 'Updated Record',
      category: 'Architecture',
      status: 'active',
      tags: ['convex', 'tanstack'],
      attributes: { owner: 'team', priority: 'high' },
    });

    const list = await t.query(api.records.list, {});
    expect(list).toHaveLength(1);
    expect(list[0]?.title).toBe('Updated Record');
    expect(list[0]?.status).toBe('active');

    const fetched = await t.query(api.records.getById, { clientId: 'rec-1' });
    expect(fetched?.attributes.priority).toBe('high');

    const removed = await t.mutation(api.records.remove, { clientId: 'rec-1' });
    expect(removed).toBe(true);
    expect(await t.query(api.records.list, {})).toHaveLength(0);
  });

  it('omits inline markdown from documents.listSummaries and returns it from getBySlug', async () => {
    const t = convexTest(schema, modules);

    await t.mutation(api.documents.upsert, {
      clientId: 'doc-1',
      title: 'RAG Architecture',
      slug: 'rag-architecture',
      markdown: '# RAG Architecture\n\nFull markdown body kept out of summary list.',
      frontmatter: { author: 'dev' },
      tags: ['rag'],
      skipIndex: true,
    });

    const summaries = await t.query(api.documents.listSummaries, {});
    expect(summaries).toHaveLength(1);
    expect(summaries[0]?.slug).toBe('rag-architecture');
    expect('markdown' in (summaries[0] ?? {})).toBe(false);

    const detail = await t.query(api.documents.getBySlug, { slug: 'rag-architecture' });
    expect(detail?.markdown).toContain('Full markdown body kept out of summary list.');
  });

  it('stores asset metadata and removes both row and storage blob on delete', async () => {
    const t = convexTest(schema, modules);

    const storageId = await t.run(async (ctx) => {
      return await ctx.storage.store(new Blob(['hello-image'], { type: 'image/png' }));
    });

    const created = await t.mutation(api.assets.finalizeUpload, {
      clientId: 'asset-1',
      filename: 'diagram.png',
      storageId,
    });

    expect(created.clientId).toBe('asset-1');

    const listed = await t.query(api.assets.listAssets, {});
    expect(listed).toHaveLength(1);
    expect(listed[0]?.filename).toBe('diagram.png');
    expect(listed[0]?.sizeBytes).toBeGreaterThan(0);

    const deleted = await t.mutation(api.assets.removeAsset, { clientId: 'asset-1' });
    expect(deleted).toBe(true);
    expect(await t.query(api.assets.listAssets, {})).toHaveLength(0);

    const blobAfterDelete = await t.run(async (ctx) => ctx.storage.get(storageId));
    expect(blobAfterDelete).toBeNull();
  });
});
