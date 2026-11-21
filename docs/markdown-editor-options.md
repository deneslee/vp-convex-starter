# Markdown Editor Options (v1 BlockNote Default vs. Upgrade & Alternative Paths)

The editor is isolated behind a single presentational boundary in `packages/ui/src/primitives/MarkdownWorkspace` accepting `{ markdown, onChangeMarkdown, onUploadImage, mode, onModeChange, readOnly }` so switching or upgrading editors never affects `apps/web` routes, TanStack DB collections, or Convex RAG indexing.

---

## 1. Active v1 Default: BlockNote (`@blocknote/mantine@0.57.0`) + Raw Markdown Fallback

- **Why BlockNote in v1:**
  - Verified peer compatibility with **React 19.3.x** and **`@mantine/core@^9.0.2`** (`@blocknote/mantine@0.57.0`, `@blocknote/react@0.57.0`, `@blocknote/core@0.57.0`) — zero peer-dependency overrides needed.
  - Notion-style block editor with slash commands (`/`), drag-and-drop blocks, tables, and built-in Mantine UI adapter.
  - Native Markdown interoperability via `editor.tryParseMarkdownToBlocks(markdown)` and `editor.blocksToMarkdownLossy(editor.document)`.
  - Clean raw-Markdown toggle (`mode: "blocks" | "raw"`) using a `createTheme`-configured Mantine `Textarea` for editing YAML frontmatter or raw `.md` syntax directly.
- **Avoid Mantine CSS Clashes:**
  - Import `@blocknote/mantine/blocknoteStyles.css` (and `@blocknote/core/fonts/inter.css` if needed) — **not** `@blocknote/mantine/style.css` — because `apps/web` already imports `@mantine/core/styles.css` natively.
  - Override BlockNote's `--bn-colors-*` CSS custom properties in `packages/ui/src/styles/semantic.css` to map straight to your light/dark semantic tokens (`--surface-*`, `--text-*`, `--border-*`, `--accent-*`).
- **Image Uploads & RAG Sync:**
  - Pass `uploadFile` on `useCreateBlockNote` wired to the `onUploadImage` prop, calling Convex's `generateUploadUrl` → `POST` → `finalizeUpload` flow in `packages/backend/convex/assets.ts` and returning the resolved image URL.
  - Debounce `onChangeMarkdown` updates (using `useDebouncedCallback` from `@mantine/hooks`) before saving to `documents.upsert`, which triggers `ragIndexPool` background re-indexing.
- **Licensing note:** Core `@blocknote/core`, `@blocknote/react`, and `@blocknote/mantine` are MPL-2.0. Avoid `@blocknote/xl-*` packages unless GPL-3.0 or a commercial license fits your project.

---

## 2. Primary Upgrade Path: Real-Time Collaborative Sync (`@convex-dev/prosemirror-sync@0.2.7`)

Add collaborative multi-tab / multi-user OT editing without rewriting the document model:

1. Install `@convex-dev/prosemirror-sync` (`0.2.7` supports `@blocknote/mantine` `>=0.31.0 <=1.0.0` and React 19) in `@repo/backend` and `@repo/ui`.
2. Mount `@convex-dev/prosemirror-sync` in `packages/backend/convex/convex.config.ts`.
3. Swap BlockNote's initialization inside `packages/ui` (`MarkdownWorkspace`) to `useBlockNoteSync` from `@convex-dev/prosemirror-sync/blocknote`.
4. Keep `documents.markdown` as a periodic/on-snapshot Markdown projection on the backend (`onSnapshot`), enqueuing `ragIndexPool.enqueue(ctx, internal.searchActions.indexDocument, { docId })` on snapshot save so RAG never re-embeds on every keystroke.

---

## 3. Alternative Option: `@mantine/tiptap@9.8.2` (First-Party Mantine Editor)

- **When to choose instead of BlockNote:** If you prefer a compact toolbar-first WYSIWYG editor that inherits `createTheme` + `cssVariablesResolver` automatically with zero extra CSS overrides, or want built-in `@mantine/tiptap` `ImageUpload` + Tiptap v3 extensions.
- **Sync parity:** Also pairs cleanly with `@convex-dev/prosemirror-sync/tiptap` (`useTiptapSync`).
