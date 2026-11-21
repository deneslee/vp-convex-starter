import { SemanticSearchBar, WorkspaceSurface, type SearchHitItem } from '@repo/ui';
import { useWorkspaceSearch } from './useWorkspaceSearch';

export interface WorkspaceSearchSectionProps {
  onOpenDocument: (slug: string) => void;
  onOpenRecord: (clientId: string) => void;
}

export function WorkspaceSearchSection({
  onOpenDocument,
  onOpenRecord,
}: WorkspaceSearchSectionProps) {
  const { query, mode, loading, results, setQuery, setMode, runSearch } = useWorkspaceSearch();

  const handleSelectResult = (hit: SearchHitItem) => {
    if (hit.kind === 'document') {
      onOpenDocument(hit.id);
      return;
    }
    onOpenRecord(hit.id);
  };

  return (
    <WorkspaceSurface density="compact">
      <SemanticSearchBar
        query={query}
        mode={mode}
        loading={loading}
        results={results}
        onQueryChange={setQuery}
        onModeChange={setMode}
        onSubmit={() => {
          void runSearch();
        }}
        onSelectResult={handleSelectResult}
      />
    </WorkspaceSurface>
  );
}
