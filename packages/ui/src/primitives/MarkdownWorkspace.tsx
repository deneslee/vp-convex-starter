import '@blocknote/mantine/blocknoteStyles.css';

import { useEffect, useRef } from 'react';
import { BlockNoteView } from '@blocknote/mantine';
import { useCreateBlockNote } from '@blocknote/react';
import { SegmentedControl, Textarea } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import classes from './MarkdownWorkspace.module.css';

export type MarkdownEditorMode = 'blocks' | 'raw';

export interface MarkdownWorkspaceProps {
  documentKey: string;
  markdown: string;
  mode: MarkdownEditorMode;
  onModeChange: (mode: MarkdownEditorMode) => void;
  onChangeMarkdown: (nextMarkdown: string) => void;
  onUploadImage?: (file: File) => Promise<string>;
  readOnly?: boolean;
  debounceMs?: number;
}

const MODE_OPTIONS = [
  { value: 'blocks', label: 'BlockNote' },
  { value: 'raw', label: 'Raw Markdown' },
];

export function MarkdownWorkspace({
  documentKey,
  markdown,
  mode,
  onModeChange,
  onChangeMarkdown,
  onUploadImage,
  readOnly = false,
  debounceMs = 450,
}: MarkdownWorkspaceProps) {
  const editor = useCreateBlockNote(
    {
      uploadFile: onUploadImage,
    },
    [documentKey]
  );

  const hydratedKeyRef = useRef<string | null>(null);
  const lastEmittedRef = useRef<string>(markdown);

  const emitMarkdownDebounced = useDebouncedCallback((nextValue: string) => {
    lastEmittedRef.current = nextValue;
    onChangeMarkdown(nextValue);
  }, debounceMs);

  useEffect(() => {
    const needsHydration =
      hydratedKeyRef.current !== documentKey ||
      (mode === 'blocks' && markdown !== lastEmittedRef.current);

    if (!needsHydration) {
      return;
    }

    hydratedKeyRef.current = documentKey;
    lastEmittedRef.current = markdown;

    const blocks = editor.tryParseMarkdownToBlocks(markdown);
    editor.replaceBlocks(editor.document, blocks);
  }, [documentKey, editor, markdown, mode]);

  const handleBlockChange = () => {
    if (readOnly) {
      return;
    }
    const serialized = editor.blocksToMarkdownLossy(editor.document);
    emitMarkdownDebounced(serialized);
  };

  return (
    <div className={classes.workspace}>
      <div className={classes.toolbar}>
        <SegmentedControl
          aria-label="Editor view mode"
          data={MODE_OPTIONS}
          value={mode}
          onChange={(value) => {
            if (value === 'blocks' || value === 'raw') {
              onModeChange(value);
            }
          }}
        />
      </div>

      {mode === 'blocks' ? (
        <div className={classes.editorFrame}>
          <BlockNoteView editor={editor} editable={!readOnly} onChange={handleBlockChange} />
        </div>
      ) : (
        <Textarea
          aria-label="Raw Markdown editor"
          className={classes.rawTextarea}
          value={markdown}
          readOnly={readOnly}
          onChange={(event) => {
            const next = event.currentTarget.value;
            lastEmittedRef.current = next;
            onChangeMarkdown(next);
          }}
        />
      )}
    </div>
  );
}
