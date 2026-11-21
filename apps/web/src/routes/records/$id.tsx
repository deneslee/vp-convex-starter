import { convexQuery } from '@convex-dev/react-query';
import { api } from '@repo/backend/_generated/api';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { RecordDetailPage } from '../../features/records/RecordDetailPage';

export const Route = createFileRoute('/records/$id')({
  loader: ({ context, params }) => {
    void context.queryClient
      .query({ ...convexQuery(api.records.getById, { clientId: params.id }), staleTime: 'static' })
      .catch(() => {});
  },
  component: RecordDetailRoute,
});

function RecordDetailRoute() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  return (
    <RecordDetailPage
      clientId={id}
      onBack={() => {
        void navigate({ to: '/records' });
      }}
    />
  );
}
