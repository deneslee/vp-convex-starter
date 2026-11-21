import { convexQuery } from '@convex-dev/react-query';
import { api } from '@repo/backend/_generated/api';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { DocumentEditorPage } from '../../features/documents/DocumentEditorPage';

export const Route = createFileRoute('/documents/$slug')({
  loader: ({ context, params }) => {
    void context.queryClient
      .query({
        ...convexQuery(api.documents.getBySlug, { slug: params.slug }),
        staleTime: 'static',
      })
      .catch(() => {});
  },
  component: DocumentEditorRoute,
});

function DocumentEditorRoute() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  return (
    <DocumentEditorPage
      slug={slug}
      onBack={() => {
        void navigate({ to: '/documents' });
      }}
    />
  );
}
