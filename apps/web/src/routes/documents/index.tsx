import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { DocumentsPage } from '../../features/documents/DocumentsPage';

export const Route = createFileRoute('/documents/')({
  component: DocumentsRoute,
});

function DocumentsRoute() {
  const navigate = useNavigate();
  return (
    <DocumentsPage
      onOpenDocument={(slug) => {
        void navigate({ to: '/documents/$slug', params: { slug } });
      }}
      onOpenRecord={(id) => {
        void navigate({ to: '/records/$id', params: { id } });
      }}
    />
  );
}
