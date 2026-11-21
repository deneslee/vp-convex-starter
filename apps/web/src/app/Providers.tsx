import '@mantine/core/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/lightbox/styles.css';
import '@mantine/notifications/styles.css';
import '@repo/ui/styles';

import { cssVariablesResolver, theme } from '@repo/ui';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import { RouterProvider } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { ConvexProvider } from 'convex/react';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { convexClient, queryClient } from '../data/clients';
import { router } from '../router';

const isLocalDevHost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export function Providers() {
  return (
    <MantineProvider theme={theme} cssVariablesResolver={cssVariablesResolver}>
      <ConvexProvider client={convexClient}>
        <QueryClientProvider client={queryClient}>
          <Notifications />
          <RouterProvider router={router} context={{ queryClient }} />
          {isLocalDevHost ? (
            <TanStackDevtools
              config={{ position: 'bottom-right' }}
              plugins={[
                {
                  name: 'TanStack Router',
                  render: <TanStackRouterDevtoolsPanel router={router} />,
                },
                { name: 'TanStack Query', render: <ReactQueryDevtoolsPanel /> },
              ]}
            />
          ) : null}
        </QueryClientProvider>
      </ConvexProvider>
    </MantineProvider>
  );
}
