import type { MarkdownEditorMode } from '@repo/ui';
import { create } from 'zustand';

interface UploadQueueItem {
  id: string;
  filename: string;
  status: 'uploading' | 'done' | 'error';
  errorMessage?: string;
}

interface WorkspaceUiState {
  sidebarOpen: boolean;
  inspectorOpen: boolean;
  selectedRecordIds: string[];
  editorMode: MarkdownEditorMode;
  activeLightboxIndex: number | null;
  uploadQueue: UploadQueueItem[];
  toggleSidebar: () => void;
  toggleInspector: () => void;
  setSelectedRecordIds: (ids: string[]) => void;
  setEditorMode: (mode: MarkdownEditorMode) => void;
  setActiveLightboxIndex: (index: number | null) => void;
  enqueueUpload: (item: UploadQueueItem) => void;
  updateUpload: (id: string, patch: Partial<Omit<UploadQueueItem, 'id'>>) => void;
  clearCompletedUploads: () => void;
}

export const useWorkspaceUiStore = create<WorkspaceUiState>((set) => ({
  sidebarOpen: true,
  inspectorOpen: false,
  selectedRecordIds: [],
  editorMode: 'blocks',
  activeLightboxIndex: null,
  uploadQueue: [],
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleInspector: () => set((state) => ({ inspectorOpen: !state.inspectorOpen })),
  setSelectedRecordIds: (selectedRecordIds) => set({ selectedRecordIds }),
  setEditorMode: (editorMode) => set({ editorMode }),
  setActiveLightboxIndex: (activeLightboxIndex) => set({ activeLightboxIndex }),
  enqueueUpload: (item) => set((state) => ({ uploadQueue: [...state.uploadQueue, item] })),
  updateUpload: (id, patch) =>
    set((state) => ({
      uploadQueue: state.uploadQueue.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    })),
  clearCompletedUploads: () =>
    set((state) => ({
      uploadQueue: state.uploadQueue.filter((item) => item.status === 'uploading'),
    })),
}));
