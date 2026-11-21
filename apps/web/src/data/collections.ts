import { api } from '@repo/backend/_generated/api';
import type { AssetItem, DocumentSummary, RecordItem } from '@repo/domain';
import { convexCollectionOptions } from '@tanstack/convex-db-collection';
import { createCollection } from '@tanstack/db';
import { convexClient } from './clients';

export const recordsCollection = createCollection(
  convexCollectionOptions({
    id: 'records',
    client: convexClient,
    query: api.records.list,
    queryArgs: {},
    select: (rows): RecordItem[] =>
      rows.map((row) => ({
        clientId: row.clientId,
        title: row.title,
        category: row.category,
        status: row.status,
        tags: row.tags,
        attributes: row.attributes,
        updatedAt: row.updatedAt,
      })),
    getKey: (record) => record.clientId,
    onInsert: async ({ transaction }) => {
      await Promise.all(
        transaction.mutations.map(({ modified }) =>
          convexClient.mutation(api.records.upsert, {
            clientId: modified.clientId,
            title: modified.title,
            category: modified.category,
            status: modified.status,
            tags: modified.tags,
            attributes: modified.attributes,
          })
        )
      );
    },
    onUpdate: async ({ transaction }) => {
      await Promise.all(
        transaction.mutations.map(({ original, changes }) =>
          convexClient.mutation(api.records.update, {
            clientId: original.clientId,
            title: changes.title,
            category: changes.category,
            status: changes.status,
            tags: changes.tags,
            attributes: changes.attributes,
          })
        )
      );
    },
    onDelete: async ({ transaction }) => {
      await Promise.all(
        transaction.mutations.map(({ original }) =>
          convexClient.mutation(api.records.remove, {
            clientId: original.clientId,
          })
        )
      );
    },
  })
);

export const documentSummariesCollection = createCollection(
  convexCollectionOptions({
    id: 'document-summaries',
    client: convexClient,
    query: api.documents.listSummaries,
    queryArgs: {},
    select: (rows): DocumentSummary[] =>
      rows.map((row) => ({
        clientId: row.clientId,
        title: row.title,
        slug: row.slug,
        frontmatter: row.frontmatter,
        tags: row.tags,
        ragStatus: row.ragStatus,
        updatedAt: row.updatedAt,
      })),
    getKey: (doc) => doc.clientId,
    onUpdate: async ({ transaction }) => {
      await Promise.all(
        transaction.mutations.map(({ original, changes }) =>
          convexClient.mutation(api.documents.updateMetadata, {
            clientId: original.clientId,
            title: changes.title,
            slug: changes.slug,
            tags: changes.tags,
            frontmatter: changes.frontmatter,
          })
        )
      );
    },
    onDelete: async ({ transaction }) => {
      await Promise.all(
        transaction.mutations.map(({ original }) =>
          convexClient.mutation(api.documents.remove, {
            clientId: original.clientId,
          })
        )
      );
    },
  })
);

export const assetsCollection = createCollection(
  convexCollectionOptions({
    id: 'assets',
    client: convexClient,
    query: api.assets.listAssets,
    queryArgs: {},
    select: (rows): AssetItem[] =>
      rows.map((row) => ({
        clientId: row.clientId,
        filename: row.filename,
        mimeType: row.mimeType,
        sizeBytes: row.sizeBytes,
        width: row.width,
        height: row.height,
        storageId: String(row.storageId),
        url: row.url,
        linkedEntityType: row.linkedEntityType,
        linkedEntityId: row.linkedEntityId,
        createdAt: row.createdAt,
      })),
    getKey: (asset) => asset.clientId,
    onDelete: async ({ transaction }) => {
      await Promise.all(
        transaction.mutations.map(({ original }) =>
          convexClient.mutation(api.assets.removeAsset, {
            clientId: original.clientId,
          })
        )
      );
    },
  })
);
