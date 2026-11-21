import { v } from 'convex/values';
import { appMutation, appQuery, clampListLimit } from './lib/functions';
import { linkedEntityTypeValidator } from './schema';

export const generateUploadUrl = appMutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const finalizeUpload = appMutation({
  args: {
    clientId: v.string(),
    filename: v.string(),
    mimeType: v.optional(v.string()),
    sizeBytes: v.optional(v.number()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    storageId: v.id('_storage'),
    linkedEntityType: v.optional(linkedEntityTypeValidator),
    linkedEntityId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const storageMeta = await ctx.db.system.get('_storage', args.storageId);
    const mimeType = args.mimeType ?? storageMeta?.contentType ?? 'application/octet-stream';
    const sizeBytes = args.sizeBytes ?? storageMeta?.size ?? 0;

    const id = await ctx.db.insert('assets', {
      clientId: args.clientId,
      filename: args.filename,
      mimeType,
      sizeBytes,
      width: args.width,
      height: args.height,
      storageId: args.storageId,
      linkedEntityType: args.linkedEntityType,
      linkedEntityId: args.linkedEntityId,
      createdAt: Date.now(),
    });

    const url = await ctx.storage.getUrl(args.storageId);
    return {
      id,
      clientId: args.clientId,
      url,
    };
  },
});

export const listAssets = appQuery({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = clampListLimit(args.limit);
    const rows = await ctx.db.query('assets').withIndex('by_createdAt').order('desc').take(limit);

    return await Promise.all(
      rows.map(async (row) => ({
        ...row,
        url: (await ctx.storage.getUrl(row.storageId)) ?? undefined,
      }))
    );
  },
});

export const removeAsset = appMutation({
  args: {
    clientId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('assets')
      .withIndex('by_clientId', (q) => q.eq('clientId', args.clientId))
      .unique();

    if (!existing) {
      return false;
    }

    await ctx.storage.delete(existing.storageId);
    await ctx.db.delete('assets', existing._id);
    return true;
  },
});
