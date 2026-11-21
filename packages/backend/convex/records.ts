import { v } from 'convex/values';
import { appMutation, appQuery, clampListLimit } from './lib/functions';
import { recordStatusValidator } from './schema';

export const list = appQuery({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = clampListLimit(args.limit);
    return await ctx.db.query('records').order('desc').take(limit);
  },
});

export const getById = appQuery({
  args: {
    clientId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('records')
      .withIndex('by_clientId', (q) => q.eq('clientId', args.clientId))
      .unique();
  },
});

export const upsert = appMutation({
  args: {
    clientId: v.string(),
    title: v.string(),
    category: v.string(),
    status: recordStatusValidator,
    tags: v.array(v.string()),
    attributes: v.record(v.string(), v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query('records')
      .withIndex('by_clientId', (q) => q.eq('clientId', args.clientId))
      .unique();

    if (existing) {
      await ctx.db.patch('records', existing._id, {
        title: args.title,
        category: args.category,
        status: args.status,
        tags: args.tags,
        attributes: args.attributes,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert('records', {
      clientId: args.clientId,
      title: args.title,
      category: args.category,
      status: args.status,
      tags: args.tags,
      attributes: args.attributes,
      updatedAt: now,
    });
  },
});

export const update = appMutation({
  args: {
    clientId: v.string(),
    title: v.optional(v.string()),
    category: v.optional(v.string()),
    status: v.optional(recordStatusValidator),
    tags: v.optional(v.array(v.string())),
    attributes: v.optional(v.record(v.string(), v.string())),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('records')
      .withIndex('by_clientId', (q) => q.eq('clientId', args.clientId))
      .unique();

    if (!existing) {
      return null;
    }

    const patch: {
      title?: string;
      category?: string;
      status?: 'draft' | 'active' | 'archived';
      tags?: string[];
      attributes?: Record<string, string>;
      updatedAt: number;
    } = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) {
      patch.title = args.title;
    }
    if (args.category !== undefined) {
      patch.category = args.category;
    }
    if (args.status !== undefined) {
      patch.status = args.status;
    }
    if (args.tags !== undefined) {
      patch.tags = args.tags;
    }
    if (args.attributes !== undefined) {
      patch.attributes = args.attributes;
    }

    await ctx.db.patch('records', existing._id, patch);
    return existing._id;
  },
});

export const remove = appMutation({
  args: {
    clientId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('records')
      .withIndex('by_clientId', (q) => q.eq('clientId', args.clientId))
      .unique();

    if (!existing) {
      return false;
    }

    await ctx.db.delete('records', existing._id);
    return true;
  },
});
