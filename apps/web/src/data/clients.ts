import { ConvexQueryClient } from '@convex-dev/react-query';
import { QueryClient } from '@tanstack/react-query';
import { ConvexReactClient } from 'convex/react';
import { ENV } from 'varlock/env';

const convexUrl = ENV.VITE_CONVEX_URL || 'http://127.0.0.1:3210';

export const convexClient = new ConvexReactClient(convexUrl);
const convexQueryClient = new ConvexQueryClient(convexClient);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn: convexQueryClient.hashFn(),
      queryFn: convexQueryClient.queryFn(),
    },
  },
});

convexQueryClient.connect(queryClient);
