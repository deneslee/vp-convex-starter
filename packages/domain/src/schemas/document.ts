import { z } from 'zod';

export const RagStatusSchema = z.enum(['pending', 'indexed', 'failed']);
export type RagStatus = z.infer<typeof RagStatusSchema>;

export const DocumentSummarySchema = z.object({
  clientId: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  frontmatter: z.record(z.string(), z.string()),
  tags: z.array(z.string()),
  ragStatus: RagStatusSchema,
  updatedAt: z.int().nonnegative(),
});

export type DocumentSummary = z.infer<typeof DocumentSummarySchema>;

export const DocumentDetailSchema = z.object({
  ...DocumentSummarySchema.shape,
  markdown: z.string(),
  storageId: z.string().min(1).optional(),
});

export type DocumentDetail = z.infer<typeof DocumentDetailSchema>;
