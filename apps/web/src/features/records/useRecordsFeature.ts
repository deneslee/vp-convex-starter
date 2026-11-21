import { useMemo, useState } from 'react';
import { createClientId, type RecordItem, type RecordStatus } from '@repo/domain';
import { useLiveQuery } from '@tanstack/react-db';
import { recordsCollection } from '../../data/collections';

export interface CreateRecordInput {
  title: string;
  category: string;
  status: RecordStatus;
  tagsInput: string;
}

export function useRecordsFeature() {
  const { data: records } = useLiveQuery((q) => q.from({ record: recordsCollection }));
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredRecords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return [...records]
      .filter((record: RecordItem) => {
        const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
        const matchesQuery =
          !query ||
          record.title.toLowerCase().includes(query) ||
          record.category.toLowerCase().includes(query) ||
          record.tags.some((tag) => tag.toLowerCase().includes(query));
        return matchesStatus && matchesQuery;
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [records, searchQuery, statusFilter]);

  const createRecord = (input: CreateRecordInput) => {
    const title = input.title.trim();
    if (!title) {
      return;
    }

    const tags = input.tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    recordsCollection.insert({
      clientId: createClientId(),
      title,
      category: input.category.trim() || 'General',
      status: input.status,
      tags,
      attributes: {},
      updatedAt: Date.now(),
    });
  };

  const deleteRecord = (clientId: string) => {
    recordsCollection.delete(clientId);
  };

  return {
    records: filteredRecords,
    searchQuery,
    statusFilter,
    setSearchQuery,
    setStatusFilter,
    createRecord,
    deleteRecord,
  };
}
