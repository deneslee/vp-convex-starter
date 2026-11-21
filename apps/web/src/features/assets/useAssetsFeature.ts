import { createClientId } from '@repo/domain';
import type { AssetGalleryItem } from '@repo/ui';
import { useLiveQuery } from '@tanstack/react-db';
import { useClipboard } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { assetsCollection } from '../../data/collections';
import { uploadAssetFile } from '../../data/uploadAsset';
import { useWorkspaceUiStore } from '../../stores/useWorkspaceUiStore';

export function useAssetsFeature() {
  const { data: assets } = useLiveQuery((q) => q.from({ asset: assetsCollection }));
  const clipboard = useClipboard({ timeout: 2000 });

  const activeLightboxIndex = useWorkspaceUiStore((state) => state.activeLightboxIndex);
  const setActiveLightboxIndex = useWorkspaceUiStore((state) => state.setActiveLightboxIndex);
  const uploadQueue = useWorkspaceUiStore((state) => state.uploadQueue);
  const enqueueUpload = useWorkspaceUiStore((state) => state.enqueueUpload);
  const updateUpload = useWorkspaceUiStore((state) => state.updateUpload);
  const clearCompletedUploads = useWorkspaceUiStore((state) => state.clearCompletedUploads);

  const isUploading = uploadQueue.some((item) => item.status === 'uploading');

  const uploadFiles = async (files: File[]) => {
    for (const file of files) {
      const queueId = createClientId();
      enqueueUpload({ id: queueId, filename: file.name, status: 'uploading' });
      try {
        await uploadAssetFile(file);
        updateUpload(queueId, { status: 'done' });
      } catch (error) {
        updateUpload(queueId, {
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Upload failed',
        });
      }
    }
  };

  const copyMarkdownLink = (asset: AssetGalleryItem) => {
    if (!asset.url) {
      return;
    }
    clipboard.copy(`![${asset.filename}](${asset.url})`);
    notifications.show({
      title: 'Markdown link copied',
      message: asset.filename,
    });
  };

  const deleteAsset = (clientId: string) => {
    assetsCollection.delete(clientId);
  };

  return {
    assets: [...assets].sort((a, b) => b.createdAt - a.createdAt),
    activeLightboxIndex,
    uploadQueue,
    isUploading,
    setActiveLightboxIndex,
    uploadFiles,
    copyMarkdownLink,
    deleteAsset,
    clearCompletedUploads,
  };
}
