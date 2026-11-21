import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export const recordStatusValidator = v.union(
  v.literal('draft'),
  v.literal('active'),
  v.literal('archived')
);

export const ragStatusValidator = v.union(
  v.literal('pending'),
  v.literal('indexed'),
  v.literal('failed')
);

export const linkedEntityTypeValidator = v.union(v.literal('record'), v.literal('document'));

export default defineSchema({
  records: defineTable({
    clientId: v.string(),
    title: v.string(),
    category: v.string(),
    status: recordStatusValidator,
    tags: v.array(v.string()),
    attributes: v.record(v.string(), v.string()),
    updatedAt: v.number(),
  })
    .index('by_clientId', ['clientId'])
    .index('by_status_and_updatedAt', ['status', 'updatedAt'])
    .searchIndex('search_records', {
      searchField: 'title',
      filterFields: ['status', 'category'],
    }),

  documents: defineTable({
    clientId: v.string(),
    title: v.string(),
    slug: v.string(),
    markdown: v.string(),
    storageId: v.optional(v.id('_storage')),
    frontmatter: v.record(v.string(), v.string()),
    tags: v.array(v.string()),
    ragStatus: ragStatusValidator,
    ragEntryKey: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index('by_clientId', ['clientId'])
    .index('by_slug', ['slug'])
    .index('by_updatedAt', ['updatedAt'])
    .searchIndex('search_documents', {
      searchField: 'markdown',
      filterFields: ['ragStatus'],
    }),

  assets: defineTable({
    clientId: v.string(),
    filename: v.string(),
    mimeType: v.string(),
    sizeBytes: v.number(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    storageId: v.id('_storage'),
    linkedEntityType: v.optional(linkedEntityTypeValidator),
    linkedEntityId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index('by_clientId', ['clientId'])
    .index('by_linkedEntityType_and_linkedEntityId', ['linkedEntityType', 'linkedEntityId'])
    .index('by_createdAt', ['createdAt']),
});
