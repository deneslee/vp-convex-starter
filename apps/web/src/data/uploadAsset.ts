import { api } from '@repo/backend/_generated/api';
import type { Id } from '@repo/backend/_generated/dataModel';
import { createClientId } from '@repo/domain';
import { convexClient } from './clients';

export interface UploadedAssetResult {
  clientId: string;
  url: string;
}

export async function uploadAssetFile(
  file: File,
  options?: {
    linkedEntityType?: 'record' | 'document';
    linkedEntityId?: string;
  }
): Promise<UploadedAssetResult> {
  const uploadUrl = await convexClient.mutation(api.assets.generateUploadUrl, {});
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Upload failed with HTTP ${response.status}`);
  }

  const payload = (await response.json()) as { storageId: Id<'_storage'> };
  const clientId = createClientId();

  const finalized = await convexClient.mutation(api.assets.finalizeUpload, {
    clientId,
    filename: file.name,
    mimeType: file.type || 'application/octet-stream',
    sizeBytes: file.size,
    storageId: payload.storageId,
    linkedEntityType: options?.linkedEntityType,
    linkedEntityId: options?.linkedEntityId,
  });

  if (!finalized.url) {
    throw new Error('Asset finalized but no storage URL was returned.');
  }

  return {
    clientId: finalized.clientId,
    url: finalized.url,
  };
}
