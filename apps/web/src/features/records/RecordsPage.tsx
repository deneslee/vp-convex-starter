import { useState } from 'react';
import type { RecordStatus } from '@repo/domain';
import { PageHeader, RecordTable, SemanticButton, WorkspaceSurface } from '@repo/ui';
import { Plus } from 'lucide-react';
import { Select, Stack, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useRecordsFeature } from './useRecordsFeature';
import classes from './Records.module.css';

export interface RecordsPageProps {
  onOpenRecord: (clientId: string) => void;
}

const STATUS_SELECT_DATA = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
];

export function RecordsPage({ onOpenRecord }: RecordsPageProps) {
  const {
    records,
    searchQuery,
    statusFilter,
    setSearchQuery,
    setStatusFilter,
    createRecord,
    deleteRecord,
  } = useRecordsFeature();

  const [composerOpen, { toggle: toggleComposer, close: closeComposer }] = useDisclosure(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<RecordStatus>('active');
  const [tagsInput, setTagsInput] = useState('');

  const handleSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (!title.trim()) {
      return;
    }
    createRecord({ title, category, status, tagsInput });
    setTitle('');
    setCategory('');
    setTagsInput('');
    closeComposer();
  };

  return (
    <Stack>
      <PageHeader
        title="Records"
        description="Structured records synced optimistically via TanStack DB and Convex."
        actions={
          <SemanticButton leftSection={<Plus />} onClick={toggleComposer}>
            New Record
          </SemanticButton>
        }
      />

      {composerOpen ? (
        <WorkspaceSurface elevated>
          <form onSubmit={handleSubmit}>
            <Stack>
              <div className={classes.formGrid}>
                <TextInput
                  label="Title"
                  placeholder="Record title"
                  required
                  value={title}
                  onChange={(event) => setTitle(event.currentTarget.value)}
                />
                <TextInput
                  label="Category"
                  placeholder="Architecture, Research, Notes..."
                  value={category}
                  onChange={(event) => setCategory(event.currentTarget.value)}
                />
                <Select
                  label="Status"
                  data={STATUS_SELECT_DATA}
                  value={status}
                  onChange={(value) => {
                    if (value === 'draft' || value === 'active' || value === 'archived') {
                      setStatus(value);
                    }
                  }}
                />
                <TextInput
                  label="Tags"
                  placeholder="comma, separated, tags"
                  value={tagsInput}
                  onChange={(event) => setTagsInput(event.currentTarget.value)}
                />
              </div>
              <div className={classes.formActions}>
                <SemanticButton intent="subtle" onClick={closeComposer}>
                  Cancel
                </SemanticButton>
                <SemanticButton type="submit">Save Record</SemanticButton>
              </div>
            </Stack>
          </form>
        </WorkspaceSurface>
      ) : null}

      <WorkspaceSurface>
        <RecordTable
          records={records}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          onSearchQueryChange={setSearchQuery}
          onStatusFilterChange={setStatusFilter}
          onSelectRecord={onOpenRecord}
          onDeleteRecord={deleteRecord}
        />
      </WorkspaceSurface>
    </Stack>
  );
}
