import {
  AssetDropzone,
  AssetGallery,
  PageHeader,
  SemanticButton,
  StatusBadge,
  WorkspaceSurface,
} from '@repo/ui';
import { Stack, Text } from '@mantine/core';
import { useAssetsFeature } from './useAssetsFeature';
import classes from './Assets.module.css';

export function AssetsPage() {
  const {
    assets,
    activeLightboxIndex,
    uploadQueue,
    isUploading,
    setActiveLightboxIndex,
    uploadFiles,
    copyMarkdownLink,
    deleteAsset,
    clearCompletedUploads,
  } = useAssetsFeature();

  return (
    <Stack>
      <PageHeader
        title="Assets"
        description="Native Convex File Storage uploader with fullscreen Mantine Lightbox preview."
        actions={
          uploadQueue.length > 0 ? (
            <SemanticButton intent="subtle" onClick={clearCompletedUploads}>
              Clear Completed
            </SemanticButton>
          ) : undefined
        }
      />

      <AssetDropzone
        loading={isUploading}
        onDropFiles={(files) => {
          void uploadFiles(files);
        }}
      />

      {uploadQueue.length > 0 ? (
        <WorkspaceSurface density="compact">
          <div className={classes.queueList}>
            {uploadQueue.map((item) => (
              <div key={item.id} className={classes.queueRow}>
                <Text className={classes.queueFilename}>{item.filename}</Text>
                <StatusBadge
                  status={
                    item.status === 'done'
                      ? 'indexed'
                      : item.status === 'error'
                        ? 'failed'
                        : 'pending'
                  }
                  label={item.status}
                />
              </div>
            ))}
          </div>
        </WorkspaceSurface>
      ) : null}

      <AssetGallery
        assets={assets}
        activeLightboxIndex={activeLightboxIndex}
        onOpenLightbox={(index) => setActiveLightboxIndex(index)}
        onCloseLightbox={() => setActiveLightboxIndex(null)}
        onLightboxIndexChange={(index) => setActiveLightboxIndex(index)}
        onCopyMarkdownLink={copyMarkdownLink}
        onDeleteAsset={deleteAsset}
      />
    </Stack>
  );
}
