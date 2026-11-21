import { vResultValidator } from '@convex-dev/workpool';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import type { Id } from './_generated/dataModel';
import { internalMutation, internalQuery } from './_generated/server';
import { appMutation, appQuery, clampListLimit } from './lib/functions';
import { ragIndexPool } from './lib/workpool';

export const listSummaries = appQuery({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = clampListLimit(args.limit);
    const docs = await ctx.db
      .query('documents')
      .withIndex('by_updatedAt')
      .order('desc')
      .take(limit);

    // Intentionally omit `markdown` so TanStack DB eager sync stays lightweight.
    return docs.map((doc) => ({
      _id: doc._id,
      _creationTime: doc._creationTime,
      clientId: doc.clientId,
      title: doc.title,
      slug: doc.slug,
      frontmatter: doc.frontmatter,
      tags: doc.tags,
      ragStatus: doc.ragStatus,
      updatedAt: doc.updatedAt,
    }));
  },
});

export const getBySlug = appQuery({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query('documents')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique();

    if (!doc) {
      return null;
    }

    const overflowUrl = doc.storageId ? await ctx.storage.getUrl(doc.storageId) : null;
    return {
      ...doc,
      overflowUrl,
    };
  },
});

export const getInternalById = internalQuery({
  args: {
    docId: v.id('documents'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get('documents', args.docId);
  },
});

export const hydrateSummariesByIds = internalQuery({
  args: {
    docIds: v.array(v.id('documents')),
  },
  handler: async (ctx, args) => {
    const results = await Promise.all(
      args.docIds.map(async (id) => {
        const doc = await ctx.db.get('documents', id);
        if (!doc) {
          return null;
        }
        return {
          _id: doc._id,
          clientId: doc.clientId,
          title: doc.title,
          slug: doc.slug,
          tags: doc.tags,
          ragStatus: doc.ragStatus,
          updatedAt: doc.updatedAt,
        };
      })
    );
    return results.filter((item): item is NonNullable<typeof item> => item !== null);
  },
});

export const markRagStatus = internalMutation({
  args: {
    workId: v.string(),
    context: v.object({
      docId: v.id('documents'),
    }),
    result: vResultValidator,
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get('documents', args.context.docId);
    if (!existing) {
      return;
    }

    const nextStatus = args.result.kind === 'success' ? 'indexed' : 'failed';
    await ctx.db.patch('documents', args.context.docId, {
      ragStatus: nextStatus,
      ragEntryKey: nextStatus === 'indexed' ? String(args.context.docId) : existing.ragEntryKey,
    });
  },
});

export const upsert = appMutation({
  args: {
    clientId: v.string(),
    title: v.string(),
    slug: v.string(),
    markdown: v.string(),
    storageId: v.optional(v.id('_storage')),
    frontmatter: v.record(v.string(), v.string()),
    tags: v.array(v.string()),
    skipIndex: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query('documents')
      .withIndex('by_clientId', (q) => q.eq('clientId', args.clientId))
      .unique();

    let docId: Id<'documents'>;
    if (existing) {
      docId = existing._id;
      await ctx.db.patch('documents', docId, {
        title: args.title,
        slug: args.slug,
        markdown: args.markdown,
        storageId: args.storageId,
        frontmatter: args.frontmatter,
        tags: args.tags,
        ragStatus: 'pending',
        updatedAt: now,
      });
    } else {
      docId = await ctx.db.insert('documents', {
        clientId: args.clientId,
        title: args.title,
        slug: args.slug,
        markdown: args.markdown,
        storageId: args.storageId,
        frontmatter: args.frontmatter,
        tags: args.tags,
        ragStatus: 'pending',
        updatedAt: now,
      });
    }

    if (!args.skipIndex) {
      await ragIndexPool.enqueueAction(
        ctx,
        internal.searchActions.indexDocument,
        { docId },
        {
          onComplete: internal.documents.markRagStatus,
          context: { docId },
        }
      );
    }

    return docId;
  },
});

export const updateMetadata = appMutation({
  args: {
    clientId: v.string(),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    frontmatter: v.optional(v.record(v.string(), v.string())),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('documents')
      .withIndex('by_clientId', (q) => q.eq('clientId', args.clientId))
      .unique();

    if (!existing) {
      return null;
    }

    const patch: {
      title?: string;
      slug?: string;
      tags?: string[];
      frontmatter?: Record<string, string>;
      updatedAt: number;
    } = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) {
      patch.title = args.title;
    }
    if (args.slug !== undefined) {
      patch.slug = args.slug;
    }
    if (args.tags !== undefined) {
      patch.tags = args.tags;
    }
    if (args.frontmatter !== undefined) {
      patch.frontmatter = args.frontmatter;
    }

    await ctx.db.patch('documents', existing._id, patch);
    return existing._id;
  },
});

export const remove = appMutation({
  args: {
    clientId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('documents')
      .withIndex('by_clientId', (q) => q.eq('clientId', args.clientId))
      .unique();

    if (!existing) {
      return false;
    }

    if (existing.storageId) {
      await ctx.storage.delete(existing.storageId);
    }

    await ctx.db.delete('documents', existing._id);
    return true;
  },
});
