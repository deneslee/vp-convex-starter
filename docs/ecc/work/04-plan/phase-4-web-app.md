# Phase 4 — `apps/web` (Pure Vite+ SPA + TanStack Router/Query/DB + BlockNote + Zustand)

> **Owned Paths:** `apps/web/**`.
> **Depends On:** Phase 2 (`@repo/domain`, `@repo/ui`, `apps/web/postcss.config.mjs`), Phase 3 (`@repo/backend`), [packages-and-versions.md](../../../restructure/research/packages-and-versions.md).

---

## 0. Mandatory Pre-Implementation Checks

1. Query **`mantine-mcp`** before writing any helper hook (`useDebouncedCallback`, `useClipboard`, `useDisclosure`, `useHotkeys`, `useMediaQuery`) or UI element.
2. Run `vpx @tanstack/intent@latest list` and load matching TanStack Router/Query/DB skills before wiring routes and collections.
3. **Do NOT copy `_refs/tanstack-spa/vite.config.ts` or `__root.tsx`** — that reference was generated with TanStack Start (`routerOnly: false`). Write the pure SPA router setup below directly.

---

## 1. Package Manifest & Pure SPA `apps/web/vite.config.ts`

1. **`apps/web/package.json` (`"@repo/web"`):**
   - `dependencies` (`"catalog:"` / `"workspace:*"`): `react`, `react-dom`, `@tanstack/react-router`, `@tanstack/react-query`, `@tanstack/db`, `@tanstack/react-db`, `@tanstack/convex-db-collection`, `@convex-dev/react-query`, `convex`, `zustand`, `varlock`, `@repo/ui`, `@repo/domain`, `@repo/backend`. *(Remember: `@tanstack/db`, `@tanstack/react-db`, and `@tanstack/convex-db-collection` come from `catalog:` at `1.0.0-rc.1.5` — if running `pnpm add` manually, use `@latest`.)*
   - `devDependencies`: `@repo/tsconfig`, `@tanstack/router-plugin`, `@tanstack/intent`, `@tanstack/devtools-vite`, `@tanstack/react-devtools`, `@tanstack/react-router-devtools`, `@tanstack/react-query-devtools`, `@varlock/vite-integration`, `@vitejs/plugin-react`, `@types/react`, `@types/react-dom`, `postcss`, `postcss-preset-mantine`, `postcss-simple-vars`, `cross-env`, `typescript`.
2. **`apps/web/vite.config.ts`:**
   - Plugins (strict order — `tanstackRouter` **before** `viteReact`):
     - `devtools({ consolePiping: { enabled: false } })`
     - `varlockVitePlugin()` *(SPA client injection for `VITE_*` vars from `.env.schema`)*
     - `tanstackRouter({ target: "react", autoCodeSplitting: true })`
     - `viteReact()`
   - Vite Task `build` config:
     ```ts
     run: {
       tasks: {
         build: {
           command: "cross-env NODE_ENV=production vp build",
           cache: {
             input: [{ auto: true }, "!**/dist/**", "!**/*.tsbuildinfo", "!**/node_modules/.vite/**"],
           },
         },
       },
     }
     ```
     *(No manual `env: ["VITE_CONVEX_URL"]` or `untrackedEnv: ["CI"]` — Vite+ `1.7` automatically tracks `VITE_*` and `dist/**` via cooperative tracking.)*
3. **`apps/web/tsconfig.json`:** Extends `@repo/tsconfig/react.json`, includes `src`, `env.d.ts`, `vite.config.ts`.

---

## 2. Data Clients & TanStack DB Collections (`apps/web/src/data/`)

1. **`src/data/clients.ts`:**
   - Import `ENV` from `"varlock/env"` (`ENV.VITE_CONVEX_URL`) — never read `import.meta.env` directly.
   - Export stable singletons:
     - `convexClient = new ConvexReactClient(ENV.VITE_CONVEX_URL)`
     - `convexQueryClient = new ConvexQueryClient(convexClient)`
     - `queryClient = new QueryClient({ defaultOptions: { queries: { queryKeyHashFn: convexQueryClient.hashFn(), queryFn: convexQueryClient.queryFn() } } })`
     - Connect `convexQueryClient.connect(queryClient)`.
2. **`src/data/collections.ts`:**
   - Create stable collections once at module scope via `createCollection(convexCollectionOptions(...))`:
     - `recordsCollection` (`api.records.list`, `getKey: (r) => r.clientId`, `select` omitting `_id`/`_creationTime`, optimistic `onInsert` / `onUpdate` / `onDelete` calling `convexClient.mutation(...)`).
     - `documentSummariesCollection` (`api.documents.listSummaries`, `getKey: (d) => d.clientId`, `select` omitting `_id`/`_creationTime`, optimistic metadata updates/deletes — **never** includes inline `markdown`).
     - `assetsCollection` (`api.assets.listAssets`, `getKey: (a) => a.clientId`, optimistic `onDelete` calling `api.assets.removeAsset`).
   - Always pass and `await` mutations on the exact same `convexClient` instance so TanStack DB reconciles optimistic transactions with Convex subscription updates cleanly.

---

## 3. Provider Tree & Zustand Store

1. **`src/app/Providers.tsx`:**
   - Single global CSS import order:
     1. `@mantine/core/styles.css`
     2. `@mantine/notifications/styles.css`
     3. `@mantine/dropzone/styles.css`
     4. `@mantine/lightbox/styles.css`
     5. `@blocknote/mantine/blocknoteStyles.css` *(NOT `@blocknote/mantine/style.css`)*
     6. `@repo/ui/styles` (`tokens.css` + `semantic.css`)
   - Provider nesting:
     - `MantineProvider` (`theme`, `cssVariablesResolver`)
     - `ConvexProvider` (`client={convexClient}`)
     - `QueryClientProvider` (`client={queryClient}`)
     - `Notifications`
     - `RouterProvider` (`router={router}`, `context={{ queryClient }}`, `defaultPreload="intent"`, `defaultPreloadStaleTime={0}`)
     - Dev-only `<TanStackDevtools />` (Router + Query panels).
2. **`src/stores/useWorkspaceUiStore.ts`:**
   - Ephemeral client UI state ONLY: `sidebarOpen`, `inspectorOpen`, `selectedRecordIds`, `editorMode: "blocks" | "raw"`, `activeLightboxIndex`, `uploadQueue`. Zero server records cached here.

---

## 4. Vertical Feature Slices & SPA Routes

Follow `AGENTS.md` strictly: zero banned visual/layout Mantine props in `apps/web` JSX; use `@repo/ui` primitives + semantic `*.module.css` files + `@mantine/hooks`.

- **`src/routes/__root.tsx`:** `createRootRouteWithContext<{ queryClient: QueryClient }>()` rendering `@repo/ui`'s `AppFrame` + `<Outlet />` (with inner `<Suspense>` so layout shell never unmounts during child loading).
- **`/records` & `/records/$id` (`src/features/records/`):**
  - Live `recordsCollection` table with instant client-side filtering/sorting, optimistic inline create/edit/delete, and detail route warmed via `queryClient.ensureQueryData(convexQuery(api.records.getById, ...))`.
- **`/documents` & `/documents/$slug` (`src/features/documents/` + `src/features/search/`):**
  - Library index backed by `documentSummariesCollection`, `.md` file drop import (frontmatter extracted via `@repo/domain` `parseMarkdownFrontmatter`), live `ragStatus` badge (`pending` / `indexed` / `failed`), and unified Keyword + Semantic RAG search bar (`SemanticSearchBar`).
  - Document editor route `/documents/$slug`: fetches full document via `convexQuery(api.documents.getBySlug, { slug })`, renders `@repo/ui`'s BlockNote `MarkdownWorkspace` with `useDebouncedCallback` (`@mantine/hooks`) saving via `api.documents.upsert`, and wires BlockNote `uploadFile` directly to Convex `assets.ts` 3-step upload returning permanent asset URL.
- **`/assets` (`src/features/assets/`):**
  - `AssetDropzone` → 3-step Convex upload (`generateUploadUrl` → `POST` → `finalizeUpload`) tracked in Zustand `uploadQueue` → `AssetGallery` (`@mantine/lightbox`) → copy `![filename](url)` via `useClipboard` (`@mantine/hooks`) → delete triggering metadata + storage blob removal.

---

## Gate 4

```bash
vpr env:audit
vpr check
vpr stylelint
vpr test
vpr build
vpr fallow
```
