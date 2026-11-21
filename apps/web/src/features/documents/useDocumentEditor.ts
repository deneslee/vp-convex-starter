import { useCallback, useState } from 'react';
import { convexQuery } from '@convex-dev/react-query';
import { api } from '@repo/backend/_generated/api';
import { useQuery } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { convexClient } from '../../data/clients';
import { uploadAssetFile } from '../../data/uploadAsset';
import { useWorkspaceUiStore } from '../../stores/useWorkspaceUiStore';

export function useDocumentEditor(slug: string) {
  const { data: document, isPending } = useQuery(convexQuery(api.documents.getBySlug, { slug }));
  const editorMode = useWorkspaceUiStore((state) => state.editorMode);
  const setEditorMode = useWorkspaceUiStore((state) => state.setEditorMode);
  const [isSaving, setIsSaving] = useState(false);

  const saveMarkdown = useCallback(
    async (nextMarkdown: string) => {
      if (!document) {
        return;
      }
      setIsSaving(true);
      try {
        await convexClient.mutation(api.documents.upsert, {
          clientId: document.clientId,
          title: document.title,
          slug: document.slug,
          markdown: nextMarkdown,
          storageId: document.storageId,
          frontmatter: document.frontmatter,
          tags: document.tags,
        });
      } catch (error) {
        notifications.show({
          title: 'Failed to save document',
          message: error instanceof Error ? error.message : 'Unexpected error',
        });
      } finally {
        setIsSaving(false);
      }
    },
    [document]
  );

  const handleUploadImage = useCallback(
    async (file: File): Promise<string> => {
      const uploaded = await uploadAssetFile(file, {
        linkedEntityType: 'document',
        linkedEntityId: document?.clientId,
      });
      return uploaded.url;
    },
    [document?.clientId]
  );

  return {
    document,
    isPending,
    isSaving,
    editorMode,
    setEditorMode,
    saveMarkdown,
    handleUploadImage,
  };
}
