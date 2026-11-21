import { createOpenAI } from '@ai-sdk/openai';
import { RAG } from '@convex-dev/rag';
import { components } from '../_generated/api';
import { env } from '../_generated/server';

export const WORKSPACE_RAG_NAMESPACE = 'workspace';
const DEFAULT_EMBEDDING_MODEL = 'text-embedding-3-small';
const DEFAULT_EMBEDDING_DIMENSION = 1536;

export type WorkspaceRagFilters = {
  docId: string;
  tag: string;
  kind: string;
};

export function createWorkspaceRag() {
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured in Convex deployment environment variables.');
  }

  const openai = createOpenAI({ apiKey });
  const modelName = env.EMBEDDING_MODEL || DEFAULT_EMBEDDING_MODEL;

  return new RAG<WorkspaceRagFilters>(components.rag, {
    textEmbeddingModel: openai.embedding(modelName),
    embeddingDimension: DEFAULT_EMBEDDING_DIMENSION,
    filterNames: ['docId', 'tag', 'kind'],
  });
}
