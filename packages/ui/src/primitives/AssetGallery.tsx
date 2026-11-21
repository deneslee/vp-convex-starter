import { Copy, Trash2 } from 'lucide-react';
import { ActionIcon, Group, Text } from '@mantine/core';
import { Lightbox, type LightboxSlideData } from '@mantine/lightbox';
import { EmptyState } from './Surface';
import classes from './AssetViews.module.css';

export interface AssetGalleryItem {
  clientId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  url?: string;
}

export interface AssetGalleryProps {
  assets: AssetGalleryItem[];
  activeLightboxIndex: number | null;
  onOpenLightbox: (index: number) => void;
  onCloseLightbox: () => void;
  onLightboxIndexChange: (index: number) => void;
  onCopyMarkdownLink: (asset: AssetGalleryItem) => void;
  onDeleteAsset: (clientId: string) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function AssetGallery({
  assets,
  activeLightboxIndex,
  onOpenLightbox,
  onCloseLightbox,
  onLightboxIndexChange,
  onCopyMarkdownLink,
  onDeleteAsset,
}: AssetGalleryProps) {
  if (assets.length === 0) {
    return (
      <EmptyState
        title="No assets uploaded"
        description="Drop an image above to store it in Convex File Storage."
      />
    );
  }

  const slides: LightboxSlideData[] = assets
    .filter((asset): asset is AssetGalleryItem & { url: string } => Boolean(asset.url))
    .map((asset) => ({
      src: asset.url,
      alt: asset.filename,
      caption: asset.filename,
    }));

  return (
    <>
      <div className={classes.galleryGrid}>
        {assets.map((asset, index) => (
          <article key={asset.clientId} className={classes.assetCard}>
            <button
              type="button"
              className={classes.thumbButton}
              aria-label={`Preview ${asset.filename}`}
              onClick={() => onOpenLightbox(index)}
            >
              {asset.url ? (
                <img src={asset.url} alt={asset.filename} className={classes.thumbImage} />
              ) : (
                <Text className={classes.assetDetails}>No preview</Text>
              )}
            </button>
            <div className={classes.assetMeta}>
              <Text className={classes.assetName}>{asset.filename}</Text>
              <Text className={classes.assetDetails}>
                {asset.mimeType} · {formatBytes(asset.sizeBytes)}
              </Text>
            </div>
            <div className={classes.assetActions}>
              <Group>
                <ActionIcon
                  aria-label={`Copy Markdown link for ${asset.filename}`}
                  onClick={() => onCopyMarkdownLink(asset)}
                >
                  <Copy />
                </ActionIcon>
                <ActionIcon
                  aria-label={`Delete ${asset.filename}`}
                  onClick={() => onDeleteAsset(asset.clientId)}
                >
                  <Trash2 />
                </ActionIcon>
              </Group>
            </div>
          </article>
        ))}
      </div>

      <Lightbox
        opened={activeLightboxIndex !== null && slides.length > 0}
        onClose={onCloseLightbox}
        currentIndex={activeLightboxIndex ?? 0}
        onIndexChange={onLightboxIndexChange}
        slides={slides}
        withZoom
        withThumbnails
      />
    </>
  );
}
