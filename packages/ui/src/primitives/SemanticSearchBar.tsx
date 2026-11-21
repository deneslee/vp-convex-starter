import { Search } from 'lucide-react';
import { Badge, SegmentedControl, Text, TextInput } from '@mantine/core';
import { SemanticButton } from './Surface';
import classes from './SemanticSearchBar.module.css';

export type SearchMode = 'keyword' | 'semantic';

export interface SearchHitItem {
  id: string;
  kind: 'record' | 'document';
  title: string;
  snippet: string;
  score?: number;
}

export interface SemanticSearchBarProps {
  query: string;
  mode: SearchMode;
  loading?: boolean;
  results: SearchHitItem[];
  onQueryChange: (value: string) => void;
  onModeChange: (mode: SearchMode) => void;
  onSubmit: () => void;
  onSelectResult: (hit: SearchHitItem) => void;
}

const SEARCH_MODES = [
  { value: 'keyword', label: 'Keyword' },
  { value: 'semantic', label: 'Semantic RAG' },
];

export function SemanticSearchBar({
  query,
  mode,
  loading = false,
  results,
  onQueryChange,
  onModeChange,
  onSubmit,
  onSelectResult,
}: SemanticSearchBarProps) {
  return (
    <div className={classes.container}>
      <form
        className={classes.controls}
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className={classes.inputWrap}>
          <TextInput
            aria-label="Search workspace"
            placeholder="Search records and documents..."
            leftSection={<Search />}
            value={query}
            onChange={(event) => onQueryChange(event.currentTarget.value)}
          />
        </div>
        <SegmentedControl
          aria-label="Search mode"
          data={SEARCH_MODES}
          value={mode}
          onChange={(value) => {
            if (value === 'keyword' || value === 'semantic') {
              onModeChange(value);
            }
          }}
        />
        <SemanticButton type="submit" loading={loading}>
          Search
        </SemanticButton>
      </form>

      {results.length > 0 ? (
        <div className={classes.resultList}>
          {results.map((hit) => (
            <button
              key={`${hit.kind}-${hit.id}`}
              type="button"
              className={classes.resultItem}
              onClick={() => onSelectResult(hit)}
            >
              <div className={classes.resultHeader}>
                <Text className={classes.resultTitle}>{hit.title}</Text>
                <Badge>
                  {hit.kind}
                  {typeof hit.score === 'number' ? ` · ${(hit.score * 100).toFixed(0)}%` : ''}
                </Badge>
              </div>
              {hit.snippet ? <Text className={classes.resultSnippet}>{hit.snippet}</Text> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
