import { Workpool } from '@convex-dev/workpool';
import { components } from '../_generated/api';

export const ragIndexPool = new Workpool(components.ragIndexPool, {
  maxParallelism: 5,
  retryActionsByDefault: true,
  defaultRetryBehavior: {
    maxAttempts: 3,
    initialBackoffMs: 1000,
    base: 2,
  },
});
