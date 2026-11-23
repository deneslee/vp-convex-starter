# P2B-3: AppFrame and RecordTable

Status: approved
Decisions used: none (A-2 and A-6 are requirements, not decisions)

## Scope — in / out (owned paths)

**In:**

- `packages/ui/src/primitives/AppFrame.tsx`, `AppFrame.module.css`: `AppShell` with sidebar, top header, colour-scheme toggle and navigation links.
- `packages/ui/src/primitives/RecordTable.tsx`, `RecordDetailCard.tsx`, `RecordViews.module.css`: data table, inline filter bar, status badges (`status` prop), and the detail and edit surface.
- `packages/ui/src/index.ts`: exports for the above.
- `packages/ui/src/primitives/primitives.test.tsx`: render tests for `AppFrame` and `RecordTable`.

**Out:** data, routing and stores (P4). `AssetDropzone`, `AssetGallery` (P2B-4), `MarkdownWorkspace` (P2B-5). No Convex, TanStack or Zustand imports (AGENTS.md §5).

## Evidence — links to research rows, plus anything newly checked (file:line)

- Old phase spec: [../../ecc/work/04-plan/phase-2-ui-and-domain.md](../../ecc/work/04-plan/phase-2-ui-and-domain.md), Phase 2B §3 and §4.
- Mantine MCP first (AGENTS.md §2): `AppShell`, `NavLink`, `ActionIcon`, `Table`, `Badge`, `TextInput`, `Select`, `useDisclosure`.
- Semantic props only: `intent`, `status`, `density`, `viewMode` (AGENTS.md §3).
- Tokens and theme from P2B-1 and P2B-2: `packages/ui/src/styles/semantic.css`, `packages/ui/src/theme/theme.ts`.

## Change — what moves or changes

1. Query the Mantine MCP for each component above; record what it returned in this section.
2. Write `AppFrame` and its module CSS (semantic CSS variables only).
3. Write `RecordTable` and `RecordDetailCard` with a typed `status` prop that maps to a semantic badge colour in the theme.
4. Add render tests: `AppFrame` shows navigation and children; `RecordTable` shows rows and calls `onSelect`.

## Verify — commands and the expected result

- Boundary grep: no import of `convex`, `@tanstack/*` or `zustand` under `packages/ui/` (zero hits).
- `vpr check`: zero errors.
- `vpr stylelint`: zero errors; no raw hex, colour functions or `px`/`rem` in `*.module.css`.
- `vpr test --project ui`: the two new tests pass.

## Rollback — how to undo; irreversible effects (data, persisted keys, URLs)

Revert the step branch. The package is new and nothing consumes it yet, so there are no data, keys or URLs to undo.
