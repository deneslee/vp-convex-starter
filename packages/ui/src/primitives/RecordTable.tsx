import { Trash2 } from 'lucide-react';
import { ActionIcon, Badge, Group, Select, Stack, Table, Text, TextInput } from '@mantine/core';
import { EmptyState, StatusBadge, type SemanticStatus } from './Surface';
import classes from './RecordViews.module.css';

export interface RecordRowItem {
  clientId: string;
  title: string;
  category: string;
  status: Extract<SemanticStatus, 'draft' | 'active' | 'archived'>;
  tags: string[];
  updatedAt: number;
}

export interface RecordTableProps {
  records: RecordRowItem[];
  searchQuery: string;
  statusFilter: string;
  onSearchQueryChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onSelectRecord: (clientId: string) => void;
  onDeleteRecord?: (clientId: string) => void;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
];

export function RecordTable({
  records,
  searchQuery,
  statusFilter,
  onSearchQueryChange,
  onStatusFilterChange,
  onSelectRecord,
  onDeleteRecord,
}: RecordTableProps) {
  return (
    <Stack>
      <div className={classes.toolbar}>
        <div className={classes.filterGroup}>
          <TextInput
            aria-label="Filter records"
            placeholder="Filter records by title or category..."
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.currentTarget.value)}
          />
          <Select
            aria-label="Filter by status"
            data={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(value) => onStatusFilterChange(value ?? 'all')}
          />
        </div>
      </div>

      {records.length === 0 ? (
        <EmptyState
          title="No records found"
          description="Create a record or adjust your active filters."
        />
      ) : (
        <div className={classes.tableContainer}>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Title</Table.Th>
                <Table.Th>Category</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Tags</Table.Th>
                <Table.Th>Updated</Table.Th>
                {onDeleteRecord ? <Table.Th>Actions</Table.Th> : null}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {records.map((record) => (
                <Table.Tr key={record.clientId}>
                  <Table.Td>
                    <button
                      type="button"
                      className={classes.rowTitleButton}
                      onClick={() => onSelectRecord(record.clientId)}
                    >
                      {record.title}
                    </button>
                  </Table.Td>
                  <Table.Td>
                    <Text>{record.category || 'Uncategorized'}</Text>
                  </Table.Td>
                  <Table.Td>
                    <StatusBadge status={record.status} />
                  </Table.Td>
                  <Table.Td>
                    <div className={classes.tagList}>
                      {record.tags.map((tag) => (
                        <Badge key={tag} className={classes.tagChip}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </Table.Td>
                  <Table.Td>
                    <Text>{new Date(record.updatedAt).toLocaleDateString()}</Text>
                  </Table.Td>
                  {onDeleteRecord ? (
                    <Table.Td>
                      <Group>
                        <ActionIcon
                          aria-label={`Delete ${record.title}`}
                          onClick={() => onDeleteRecord(record.clientId)}
                        >
                          <Trash2 />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  ) : null}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
      )}
    </Stack>
  );
}
