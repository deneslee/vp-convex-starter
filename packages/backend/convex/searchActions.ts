import { v } from 'convex/values';
import { internal } from './_generated/api';
import type { Doc, Id } from './_generated/dataModel';
import { internalAction } from './_generated/server';
import { appAction } from './lib/functions';
import { createWorkspaceRag, WORKSPACE_RAG_NAMESPACE } from './lib/rag';

interface HydratedDocumentSummary {
  _id: Id<'documents'>;
  clientId: string;
  title: string;
  slug: string;
  tags: string[];
  ragStatus: 'pending' | 'indexed' | 'failed';
  updatedAt: number;
}

export interface SemanticSearchHit {
  entryId: string;
  score: number;
  text: string;
  document: HydratedDocumentSummary | null;
}

export const indexDocument = internalAction({
  args: {
    docId: v.id('documents'),
  },
  handler: async (ctx, args): Promise<{ indexed: boolean }> => {
    const doc: Doc<'documents'> | null = await ctx.runQuery(internal.documents.getInternalById, {
      docId: args.docId,
    });

    if (!doc) {
      return { indexed: false };
    }

    let text = doc.markdown;
    if (!text.trim() && doc.storageId) {
      const blob = await ctx.storage.get(doc.storageId);
      if (blob) {
        text = await blob.text();
      }
    }

    const rag = createWorkspaceRag();
    const filterValues = [
      { name: 'docId' as const, value: String(doc._id) },
      { name: 'kind' as const, value: 'document' },
      ...doc.tags.map((tag: string) => ({ name: 'tag' as const, value: tag })),
    ];

    await rag.add(ctx, {
      namespace: WORKSPACE_RAG_NAMESPACE,
      key: String(doc._id),
      title: doc.title,
      text: `${doc.title}\n\n${text}`,
      filterValues,
    });

    return { indexed: true };
  },
});

export const semanticSearch = appAction({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<SemanticSearchHit[]> => {
    const trimmed = args.query.trim();
    if (!trimmed) {
      return [];
    }

    const rag = createWorkspaceRag();
    const { results, entries } = await rag.search(ctx, {
      namespace: WORKSPACE_RAG_NAMESPACE,
      query: trimmed,
      limit: Math.min(Math.max(args.limit ?? 10, 1), 25),
      chunkContext: { before: 1, after: 1 },
    });

    const entryKeyById = new Map<string, string>();
    for (const entry of entries) {
      if (entry.key) {
        entryKeyById.set(entry.entryId, entry.key);
      }
    }

    const docIds: Id<'documents'>[] = [];
    for (const result of results) {
      const key = entryKeyById.get(result.entryId);
      if (key) {
        docIds.push(key as Id<'documents'>);
      }
    }

    const uniqueIds = [...new Set(docIds)];
    const hydrated: HydratedDocumentSummary[] =
      uniqueIds.length > 0
        ? await ctx.runQuery(internal.documents.hydrateSummariesByIds, { docIds: uniqueIds })
        : [];

    const docMap = new Map<string, HydratedDocumentSummary>(
      hydrated.map((doc) => [String(doc._id), doc])
    );

    return results.map((result) => {
      const key = entryKeyById.get(result.entryId);
      const doc = key ? docMap.get(key) : undefined;
      return {
        entryId: result.entryId,
        score: result.score,
        text: result.content.map((part) => part.text).join('\n'),
        document: doc ?? null,
      };
    });
  },
});
