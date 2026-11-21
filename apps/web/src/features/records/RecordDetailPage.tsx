import { convexQuery } from '@convex-dev/react-query';
import { api } from '@repo/backend/_generated/api';
import { EmptyState, PageHeader, RecordDetailCard, SemanticButton } from '@repo/ui';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Loader, Stack } from '@mantine/core';

export interface RecordDetailPageProps {
  clientId: string;
  onBack: () => void;
}

export function RecordDetailPage({ clientId, onBack }: RecordDetailPageProps) {
  const { data: record, isPending } = useQuery(convexQuery(api.records.getById, { clientId }));

  return (
    <Stack>
      <PageHeader
        title={record?.title ?? 'Record Detail'}
        description={`Client ID: ${clientId}`}
        actions={
          <SemanticButton intent="secondary" leftSection={<ArrowLeft />} onClick={onBack}>
            Back to Records
          </SemanticButton>
        }
      />

      {isPending ? (
        <Loader />
      ) : record ? (
        <RecordDetailCard
          title={record.title}
          category={record.category}
          status={record.status}
          tags={record.tags}
          attributes={record.attributes}
          updatedAt={record.updatedAt}
        />
      ) : (
        <EmptyState
          title="Record not found"
          description="This record may have been deleted or does not exist."
        />
      )}
    </Stack>
  );
}
