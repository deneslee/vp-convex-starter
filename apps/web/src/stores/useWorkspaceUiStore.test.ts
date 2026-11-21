import { beforeEach, describe, expect, it } from 'vite-plus/test';
import { useWorkspaceUiStore } from './useWorkspaceUiStore';

describe('useWorkspaceUiStore', () => {
  beforeEach(() => {
    useWorkspaceUiStore.setState({
      sidebarOpen: true,
      inspectorOpen: false,
      selectedRecordIds: [],
      editorMode: 'blocks',
      activeLightboxIndex: null,
      uploadQueue: [],
    });
  });

  it('toggles sidebar and switches editor mode', () => {
    useWorkspaceUiStore.getState().toggleSidebar();
    expect(useWorkspaceUiStore.getState().sidebarOpen).toBe(false);

    useWorkspaceUiStore.getState().setEditorMode('raw');
    expect(useWorkspaceUiStore.getState().editorMode).toBe('raw');
  });

  it('tracks upload queue lifecycle and clears completed items', () => {
    const store = useWorkspaceUiStore.getState();
    store.enqueueUpload({ id: 'u-1', filename: 'a.png', status: 'uploading' });
    store.enqueueUpload({ id: 'u-2', filename: 'b.png', status: 'uploading' });
    store.updateUpload('u-1', { status: 'done' });
    store.clearCompletedUploads();

    expect(useWorkspaceUiStore.getState().uploadQueue).toEqual([
      { id: 'u-2', filename: 'b.png', status: 'uploading' },
    ]);
  });
});
