import { customAction, customMutation, customQuery } from 'convex-helpers/server/customFunctions';
import { action, mutation, query } from '../_generated/server';

/**
 * Single auth-ready middleware choke point.
 * In v1 (single-user), functions pass through cleanly.
 * When enabling multi-user auth, enforce `ctx.auth.getUserIdentity()` here once.
 */
export const appQuery = customQuery(query, {
  args: {},
  input: async (_ctx, args) => ({ ctx: {}, args }),
});

export const appMutation = customMutation(mutation, {
  args: {},
  input: async (_ctx, args) => ({ ctx: {}, args }),
});

export const appAction = customAction(action, {
  args: {},
  input: async (_ctx, args) => ({ ctx: {}, args }),
});

export function clampListLimit(limit: number | undefined, defaultLimit = 200, maxLimit = 500) {
  return Math.min(Math.max(limit ?? defaultLimit, 1), maxLimit);
}
