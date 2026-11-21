import { EmptyState, MarkdownWorkspace, PageHeader, SemanticButton, StatusBadge } from '@repo/ui';
import { ArrowLeft } from 'lucide-react';
import { Loader, Stack } from '@mantine/core';
import { useDocumentEditor } from './useDocumentEditor';

export interface DocumentEditorPageProps {
  slug: string;
  onBack: () => void;
}

export function DocumentEditorPage({ slug, onBack }: DocumentEditorPageProps) {
  const {
    document,
    isPending,
    isSaving,
    editorMode,
    setEditorMode,
    saveMarkdown,
    handleUploadImage,
  } = useDocumentEditor(slug);

  return (
    <Stack>
      <PageHeader
        title={document?.title ?? slug}
        description={isSaving ? 'Saving changes...' : `Slug: /${slug}`}
        actions={
          <>
            {document ? <StatusBadge status={document.ragStatus} /> : null}
            <SemanticButton intent="secondary" leftSection={<ArrowLeft />} onClick={onBack}>
              Back to Documents
            </SemanticButton>
          </>
        }
      />

      {isPending ? (
        <Loader />
      ) : document ? (
        <MarkdownWorkspace
          documentKey={document.clientId}
          markdown={document.markdown}
          mode={editorMode}
          onModeChange={setEditorMode}
          onChangeMarkdown={(nextMarkdown) => {
            void saveMarkdown(nextMarkdown);
          }}
          onUploadImage={handleUploadImage}
        />
      ) : (
        <EmptyState
          title="Document not found"
          description="This document does not exist or has been removed."
        />
      )}
    </Stack>
  );
}
