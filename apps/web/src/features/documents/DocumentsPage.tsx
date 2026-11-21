import { useState } from 'react';
import {
  AssetDropzone,
  EmptyState,
  PageHeader,
  SemanticButton,
  StatusBadge,
  WorkspaceSurface,
} from '@repo/ui';
import { FilePlus, Trash2 } from 'lucide-react';
import { ActionIcon, Stack, Text, TextInput } from '@mantine/core';
import { WorkspaceSearchSection } from '../search/WorkspaceSearchSection';
import { useDocumentsFeature } from './useDocumentsFeature';
import classes from './Documents.module.css';

export interface DocumentsPageProps {
  onOpenDocument: (slug: string) => void;
  onOpenRecord: (clientId: string) => void;
}

const MARKDOWN_MIME_TYPES = ['text/markdown', 'text/plain'];

export function DocumentsPage({ onOpenDocument, onOpenRecord }: DocumentsPageProps) {
  const {
    documents,
    filterText,
    isImporting,
    setFilterText,
    createDocument,
    importMarkdownFiles,
    deleteDocument,
  } = useDocumentsFeature();

  const [newTitle, setNewTitle] = useState('');

  const handleCreate = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    const slug = await createDocument(newTitle);
    if (slug) {
      setNewTitle('');
      onOpenDocument(slug);
    }
  };

  return (
    <Stack>
      <PageHeader
        title="Documents"
        description="BlockNote Markdown library synced as summaries in TanStack DB with Workpool RAG indexing."
      />

      <WorkspaceSearchSection onOpenDocument={onOpenDocument} onOpenRecord={onOpenRecord} />

      <WorkspaceSurface>
        <form onSubmit={(event) => void handleCreate(event)} className={classes.createRow}>
          <div className={classes.createInput}>
            <TextInput
              label="Create a Markdown document"
              placeholder="Document title..."
              value={newTitle}
              onChange={(event) => setNewTitle(event.currentTarget.value)}
            />
          </div>
          <SemanticButton type="submit" leftSection={<FilePlus />}>
            Create Document
          </SemanticButton>
        </form>
      </WorkspaceSurface>

      <AssetDropzone
        accept={MARKDOWN_MIME_TYPES}
        loading={isImporting}
        label="Drop .md files here to import with YAML frontmatter"
        hint="Frontmatter title and tags are extracted automatically via @repo/domain"
        onDropFiles={(files) => {
          void importMarkdownFiles(files);
        }}
      />

      <WorkspaceSurface>
        <Stack>
          <TextInput
            aria-label="Filter documents"
            placeholder="Filter documents by title, slug, or tag..."
            value={filterText}
            onChange={(event) => setFilterText(event.currentTarget.value)}
          />

          {documents.length === 0 ? (
            <EmptyState
              title="No documents yet"
              description="Create a new Markdown document or drop a .md file above."
            />
          ) : (
            <div className={classes.docGrid}>
              {documents.map((doc) => (
                <article key={doc.clientId} className={classes.docCard}>
                  <div className={classes.docHeader}>
                    <button
                      type="button"
                      className={classes.docTitleButton}
                      onClick={() => onOpenDocument(doc.slug)}
                    >
                      {doc.title}
                    </button>
                    <StatusBadge status={doc.ragStatus} />
                  </div>
                  <Text className={classes.docMeta}>/{doc.slug}</Text>
                  <div className={classes.docFooter}>
                    <Text className={classes.docMeta}>
                      {new Date(doc.updatedAt).toLocaleDateString()}
                    </Text>
                    <ActionIcon
                      aria-label={`Delete ${doc.title}`}
                      onClick={() => deleteDocument(doc.clientId)}
                    >
                      <Trash2 />
                    </ActionIcon>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Stack>
      </WorkspaceSurface>
    </Stack>
  );
}
