import { v } from 'convex/values';
import { appQuery } from './lib/functions';

const MAX_HITS = 20;

export const keywordSearch = appQuery({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const trimmed = args.query.trim();
    if (!trimmed) {
      return {
        records: [],
        documents: [],
      };
    }

    const limit = Math.min(Math.max(args.limit ?? MAX_HITS, 1), 50);

    const [records, documents] = await Promise.all([
      ctx.db
        .query('records')
        .withSearchIndex('search_records', (q) => q.search('title', trimmed))
        .take(limit),
      ctx.db
        .query('documents')
        .withSearchIndex('search_documents', (q) => q.search('markdown', trimmed))
        .take(limit),
    ]);

    return {
      records: records.map((record) => ({
        clientId: record.clientId,
        title: record.title,
        category: record.category,
        status: record.status,
      })),
      documents: documents.map((doc) => ({
        clientId: doc.clientId,
        title: doc.title,
        slug: doc.slug,
        snippet: doc.markdown.slice(0, 180),
        ragStatus: doc.ragStatus,
      })),
    };
  },
});
