import { z } from 'zod';

export const RecordStatusSchema = z.enum(['draft', 'active', 'archived']);
export type RecordStatus = z.infer<typeof RecordStatusSchema>;

export const RecordSchema = z.object({
  clientId: z.string().min(1),
  title: z.string().min(1),
  category: z.string(),
  status: RecordStatusSchema,
  tags: z.array(z.string()),
  attributes: z.record(z.string(), z.string()),
  updatedAt: z.int().nonnegative(),
});

export type RecordItem = z.infer<typeof RecordSchema>;
