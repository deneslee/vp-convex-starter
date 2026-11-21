import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vite-plus/test';
import { renderWithUi } from '../../test-utils/render';
import { AppFrame } from './AppFrame';
import { RecordTable } from './RecordTable';
import { SemanticSearchBar } from './SemanticSearchBar';
import { StatusBadge } from './Surface';

describe('@repo/ui primitives', () => {
  it('renders AppFrame with navigation and children', () => {
    const onSelect = vi.fn();
    renderWithUi(
      <AppFrame
        title="Workspace"
        sidebarOpen
        onToggleSidebar={vi.fn()}
        navItems={[{ id: 'records', label: 'Records', active: true, onSelect }]}
      >
        <div>Body Content</div>
      </AppFrame>
    );

    expect(screen.getByText('Workspace')).toBeInTheDocument();
    expect(screen.getByText('Body Content')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Records'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('renders RecordTable rows and triggers selection', () => {
    const onSelectRecord = vi.fn();
    renderWithUi(
      <RecordTable
        records={[
          {
            clientId: 'rec-1',
            title: 'Alpha Record',
            category: 'Specs',
            status: 'active',
            tags: ['v1'],
            updatedAt: 1700000000000,
          },
        ]}
        searchQuery=""
        statusFilter="all"
        onSearchQueryChange={vi.fn()}
        onStatusFilterChange={vi.fn()}
        onSelectRecord={onSelectRecord}
      />
    );

    fireEvent.click(screen.getByText('Alpha Record'));
    expect(onSelectRecord).toHaveBeenCalledWith('rec-1');
  });

  it('renders SemanticSearchBar results and StatusBadge', () => {
    const onSelectResult = vi.fn();
    renderWithUi(
      <>
        <StatusBadge status="indexed" />
        <SemanticSearchBar
          query="convex"
          mode="keyword"
          results={[
            { id: 'doc-1', kind: 'document', title: 'Convex Guide', snippet: 'RAG indexing' },
          ]}
          onQueryChange={vi.fn()}
          onModeChange={vi.fn()}
          onSubmit={vi.fn()}
          onSelectResult={onSelectResult}
        />
      </>
    );

    expect(screen.getByText('indexed')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Convex Guide'));
    expect(onSelectResult).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'doc-1', kind: 'document' })
    );
  });
});
