import { z } from 'zod';

export const LinkedEntityTypeSchema = z.enum(['record', 'document']);
export type LinkedEntityType = z.infer<typeof LinkedEntityTypeSchema>;

export const AssetSchema = z.object({
  clientId: z.string().min(1),
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.int().nonnegative(),
  width: z.int().nonnegative().optional(),
  height: z.int().nonnegative().optional(),
  storageId: z.string().min(1),
  url: z.string().min(1).optional(),
  linkedEntityType: LinkedEntityTypeSchema.optional(),
  linkedEntityId: z.string().min(1).optional(),
  createdAt: z.int().nonnegative(),
});

export type AssetItem = z.infer<typeof AssetSchema>;
