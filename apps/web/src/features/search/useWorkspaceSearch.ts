import { useState } from 'react';
import { convexQuery } from '@convex-dev/react-query';
import { api } from '@repo/backend/_generated/api';
import type { SearchHitItem, SearchMode } from '@repo/ui';
import { useQuery } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { convexClient } from '../../data/clients';

export function useWorkspaceSearch() {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SearchMode>('keyword');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [semanticHits, setSemanticHits] = useState<SearchHitItem[]>([]);
  const [isSemanticLoading, setIsSemanticLoading] = useState(false);

  const keywordQuery = useQuery({
    ...convexQuery(api.search.keywordSearch, { query: submittedQuery }),
    enabled: mode === 'keyword' && submittedQuery.trim().length > 0,
  });

  const runSearch = async () => {
    const trimmed = query.trim();
    setSubmittedQuery(trimmed);

    if (!trimmed) {
      setSemanticHits([]);
      return;
    }

    if (mode === 'semantic') {
      setIsSemanticLoading(true);
      try {
        const hits = await convexClient.action(api.searchActions.semanticSearch, {
          query: trimmed,
        });
        setSemanticHits(
          hits
            .filter((hit) => hit.document !== null)
            .map((hit) => ({
              id: hit.document?.slug ?? hit.entryId,
              kind: 'document' as const,
              title: hit.document?.title ?? 'Matched Document',
              snippet: hit.text.slice(0, 180),
              score: hit.score,
            }))
        );
      } catch (error) {
        notifications.show({
          title: 'Semantic search unavailable',
          message: error instanceof Error ? error.message : 'Check OPENAI_API_KEY in Convex env',
        });
        setSemanticHits([]);
      } finally {
        setIsSemanticLoading(false);
      }
    }
  };

  const keywordHits: SearchHitItem[] =
    mode === 'keyword' && keywordQuery.data
      ? [
          ...keywordQuery.data.documents.map((doc) => ({
            id: doc.slug,
            kind: 'document' as const,
            title: doc.title,
            snippet: doc.snippet,
          })),
          ...keywordQuery.data.records.map((record) => ({
            id: record.clientId,
            kind: 'record' as const,
            title: record.title,
            snippet: `${record.category} · ${record.status}`,
          })),
        ]
      : [];

  return {
    query,
    mode,
    loading: mode === 'semantic' ? isSemanticLoading : keywordQuery.isFetching,
    results: mode === 'semantic' ? semanticHits : keywordHits,
    setQuery,
    setMode,
    runSearch,
  };
}
