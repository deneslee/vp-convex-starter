import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { RecordsPage } from '../../features/records/RecordsPage';

export const Route = createFileRoute('/records/')({
  component: RecordsRoute,
});

function RecordsRoute() {
  const navigate = useNavigate();
  return (
    <RecordsPage
      onOpenRecord={(id) => {
        void navigate({ to: '/records/$id', params: { id } });
      }}
    />
  );
}
