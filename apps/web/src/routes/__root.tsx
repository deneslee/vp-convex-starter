import { Suspense } from 'react';
import { AppFrame } from '@repo/ui';
import type { QueryClient } from '@tanstack/react-query';
import {
  createRootRouteWithContext,
  Outlet,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router';
import { Database, FileText, Image as ImageIcon } from 'lucide-react';
import { Loader } from '@mantine/core';
import { useWorkspaceUiStore } from '../stores/useWorkspaceUiStore';

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

function RootLayout() {
  const sidebarOpen = useWorkspaceUiStore((state) => state.sidebarOpen);
  const toggleSidebar = useWorkspaceUiStore((state) => state.toggleSidebar);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <AppFrame
      title="Convex Workspace"
      sidebarOpen={sidebarOpen}
      onToggleSidebar={toggleSidebar}
      navItems={[
        {
          id: 'records',
          label: 'Records',
          description: 'TanStack DB table',
          icon: <Database />,
          active: pathname.startsWith('/records'),
          onSelect: () => {
            void navigate({ to: '/records' });
          },
        },
        {
          id: 'documents',
          label: 'Documents',
          description: 'BlockNote + RAG',
          icon: <FileText />,
          active: pathname.startsWith('/documents'),
          onSelect: () => {
            void navigate({ to: '/documents' });
          },
        },
        {
          id: 'assets',
          label: 'Assets',
          description: 'Storage + Lightbox',
          icon: <ImageIcon />,
          active: pathname.startsWith('/assets'),
          onSelect: () => {
            void navigate({ to: '/assets' });
          },
        },
      ]}
    >
      <Suspense fallback={<Loader />}>
        <Outlet />
      </Suspense>
    </AppFrame>
  );
}
