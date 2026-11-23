# Phase 2 — `packages/domain` & `packages/ui` (Mantine v9 + BlockNote 0.57)

> **Owned Paths:** `packages/domain/**`, `packages/ui/**`, `apps/web/postcss.config.mjs`.
> **Depends On:** Phase 1, [packages-and-versions.md](../../../restructure/research/packages-and-versions.md).
> **Parallelism:** Phase 2A (`packages/domain`), Phase 2B (`packages/ui`), and [Phase 3](phase-3-convex-backend.md) can run concurrently once Gate 1 passes.

---

## Phase 2A — `packages/domain` (`@repo/domain`)

1. **Dependencies:** `"zod": "catalog:"`; `"devDependencies": { "@repo/tsconfig": "workspace:*", "typescript": "catalog:" }`.
2. **Zod v4 Schemas (`packages/domain/src/schemas/`):**
   - `RecordSchema`: `clientId`, `title`, `category`, `status` (`"draft" | "active" | "archived"`), `tags`, `attributes`, `updatedAt`.
   - `DocumentSummarySchema`: `clientId`, `title`, `slug`, `frontmatter`, `tags`, `ragStatus` (`"pending" | "indexed" | "failed"`), `updatedAt` *(intentionally omits `markdown` body so TanStack DB list sync stays lean)*.
   - `DocumentDetailSchema`: extends `DocumentSummarySchema` with `markdown` (`string`) and optional `storageId` (`string`).
   - `AssetSchema`: `clientId`, `filename`, `mimeType`, `sizeBytes`, `width?`, `height?`, `storageId`, `url?`, `linkedEntityType?`, `linkedEntityId?`, `createdAt`.
3. **Pure Helpers (`packages/domain/src/markdown/` & `ids.ts`):**
   - `parseMarkdownFrontmatter(raw: string)` → `{ frontmatter, body, title, tags }`
   - `chunkMarkdownByHeadings(markdown: string)` → heading-aware chunks with section title + text (complement/fallback for RAG ingestion)
   - `slugifyTitle(title: string)` → URL-safe slug helper
   - `createClientId()` → `crypto.randomUUID()` wrapper for TanStack DB optimistic inserts.
4. **Tests (`packages/domain/src/*.test.ts`):**
   - Vitest (`node` project, importing from `"vite-plus/test"`) tests covering frontmatter extraction, heading chunking edge cases, and Zod schema validation.

---

## Phase 2B — `packages/ui` (`@repo/ui` — Mantine v9.8.2 + BlockNote 0.57)

### Step 0 (Mandatory): Query `mantine-mcp` First
Before writing any component, layout, or hook:
- Call `mantine-mcp` (`list_items`, `search_docs`, `get_item_doc`, `get_item_props`, `get_api`) for:
  - Layout & navigation primitives (`AppShell`, `NavLink`, `ActionIcon`, `Group`, `Stack`, `Card`, `Paper`, `Table`, `Badge`, `Modal`, `Tabs`, `SegmentedControl`, `TextInput`, `Select`, `Button`, `Loader`, `Skeleton`).
  - Existing Mantine add-ons (`@mantine/dropzone`, `@mantine/lightbox`, `@mantine/notifications`).
  - Hooks (`useDisclosure`, `useDebouncedValue`, `useDebouncedCallback`, `useClipboard`, `useHotkeys`, `useMediaQuery`).
- Never rebuild a component or hook that Mantine already exports.

### 1. Dependencies & PostCSS / Test Setup
- Add to `packages/ui/package.json` via `"catalog:"`:
  - `dependencies`: `@mantine/core`, `@mantine/hooks`, `@mantine/notifications`, `@mantine/dropzone`, `@mantine/lightbox`, `embla-carousel`, `embla-carousel-react`, `lucide-react`, `@blocknote/core`, `@blocknote/react`, `@blocknote/mantine`.
  - `peerDependencies`: `react`, `react-dom`.
  - `devDependencies`: `@repo/tsconfig`, `@types/react`, `@types/react-dom`, `react`, `react-dom`, `typescript`, `@testing-library/react`, `@testing-library/dom`, `@testing-library/jest-dom`, `@testing-library/user-event`.
- Copy `_refs/vite-template/postcss.config.mjs` → `apps/web/postcss.config.mjs`.
- Harvest `_refs/vite-template/vitest.setup.mjs` and `test-utils/render.tsx` into `packages/ui/test-utils/` (updating Vitest imports to `"vite-plus/test"`, `@testing-library/jest-dom/vitest`, and wrapping `<MantineProvider theme={theme} cssVariablesResolver={cssVariablesResolver} env="test">`).

### 2. Design Tokens & Theme (`packages/ui/src/styles/` & `src/theme/`)
- **`src/styles/tokens.css`:** Primitive scales (spacing, radii, typography, z-index, transition durations, palette ramps). *(Only file exempt from Stylelint raw-unit/color rules.)*
- **`src/styles/semantic.css`:** Light + `[data-mantine-color-scheme="dark"]` semantic tokens:
  - Surfaces: `--surface-canvas`, `--surface-panel`, `--surface-elevated`, `--surface-interactive`, `--surface-interactive-hover`
  - Borders: `--border-subtle`, `--border-default`, `--border-strong`, `--border-focus`
  - Text: `--text-primary`, `--text-secondary`, `--text-muted`, `--text-inverse`
  - Accents/Status: `--accent-primary`, `--accent-subtle`, `--status-success`, `--status-warning`, `--status-danger`
  - Spacing/Radii: `--space-xs`, `--space-sm`, `--space-md`, `--space-lg`, `--space-xl`, `--radius-sm`, `--radius-md`, `--radius-lg`
  - BlockNote overrides: map `--bn-colors-editor-background`, `--bn-colors-editor-text`, `--bn-colors-menu-*`, `--bn-colors-hovered-*`, `--bn-colors-border`, etc. directly to the semantic vars above.
- **`src/theme/theme.ts`:** `createTheme` configuring fonts, radius, primaryColor, and `components.<Name>.defaultProps` + `classNames` for all Mantine components used in `apps/web` so feature JSX requires **zero visual/layout props**.
- **`src/theme/cssVariablesResolver.ts`:** Thin `CSSVariablesResolver` bridging only Mantine internal `--mantine-*` variables where needed — never duplicating `semantic.css` tokens.

### 3. Dumb Presentational Primitives (`packages/ui/src/primitives/`)
All primitives use colocated `*.module.css` files referencing **only** semantic CSS vars (verified by Stylelint v18), and expose clean, typed semantic domain props (`intent`, `status`, `density`, `viewMode`) rather than raw styling props:

- **`AppFrame`**: `AppShell` sidebar + top header + color-scheme toggle + navigation links (`AppFrame.module.css`).
- **`RecordTable` & `RecordDetailCard`**: structured data table, inline filter bar, status badges (`status` semantic prop), and detail/edit surface.
- **`AssetDropzone` & `AssetGallery`**: wraps `@mantine/dropzone` + `@mantine/lightbox` (`embla-carousel-react`) with image grid, lightbox trigger, and copy-link / delete actions.
- **`MarkdownWorkspace` (BlockNote v0.57 default + Raw Fallback):**
  - Import `@blocknote/mantine/blocknoteStyles.css` (and `@blocknote/core/fonts/inter.css` if desired) — **never** `@blocknote/mantine/style.css`, avoiding clashes with `@mantine/core/styles.css`.
  - Clean boundary props: `{ markdown: string; onChangeMarkdown: (next: string) => void; onUploadImage?: (file: File) => Promise<string>; mode: "blocks" | "raw"; onModeChange: (mode: "blocks" | "raw") => void; readOnly?: boolean }`.
  - `"blocks"` mode: `useCreateBlockNote({ uploadFile: onUploadImage })` + `<BlockNoteView editor={editor} />`; hydrates via `editor.tryParseMarkdownToBlocks(markdown)` on document switch and emits serialized Markdown via `editor.blocksToMarkdownLossy(editor.document)` (debounced via `@mantine/hooks` `useDebouncedCallback`).
  - `"raw"` mode: Mantine `Textarea` for inspecting/editing raw Markdown + YAML frontmatter directly.
- **`SemanticSearchBar`**: search input + mode toggle (`"keyword" | "semantic" | "hybrid"`) + ranked hit list.

### 4. Render Tests
- Write focused component render smoke tests (`*.test.tsx`) using `packages/ui/test-utils/render.tsx` for `AppFrame`, `RecordTable`, and `SemanticSearchBar`.

---

## Gate 2 (Boundary & Quality Verification)

1. Verify zero forbidden imports:
   - `packages/ui` has zero imports from `convex`, `@tanstack/*`, or `zustand`.
   - `packages/domain` has zero imports from `react`, `@mantine/*`, `@blocknote/*`, `@tanstack/*`, or `convex/server`.
2. Run:
   ```bash
   vpr check
   vpr stylelint
   vpr test
   ```
