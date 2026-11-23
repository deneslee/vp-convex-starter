# Phase 3 — `packages/backend` (Convex 1.51 + RAG + Workpool + Typed Env)

> **Owned Paths:** `packages/backend/**`, `.agents/skills/**`.
> **Depends On:** Phase 1, [packages-and-versions.md](../../../restructure/research/packages-and-versions.md).
> **Parallelism:** Can run in parallel with Phase 2A and Phase 2B after Gate 1 passes (only `packages/backend` imports `@repo/domain` if shared constants/parsers are needed, or keeps pure Convex validators self-contained).

---

## 1. Scaffold & Harvest Official Convex Agent Skills

1. Harvest from `_refs/convex-ref/`:
   - `convex/tsconfig.json`
   - `convex/_generated/ai/guidelines.md`
   - `.agents/skills/` (35 official Convex skills) and `skills-lock.json`
   - **Do NOT copy** `_refs/convex-ref`'s auth files (`auth.ts`, `auth.config.ts`, `users.ts`) or its TS6 `package.json` alias.
2. Create `packages/backend/package.json` (`"@repo/backend"`) exporting generated types cleanly for `apps/web`:
   ```json
   "exports": {
     "./_generated/api": "./convex/_generated/api.js",
     "./_generated/dataModel": "./convex/_generated/dataModel.d.ts"
   }
   ```
   - `dependencies` (all `"catalog:"`): `convex`, `convex-helpers`, `@convex-dev/rag`, `@convex-dev/workpool`, `ai`, `@ai-sdk/openai`.
   - `devDependencies` (all `"catalog:"`): `@repo/tsconfig`, `convex-test`, `@edge-runtime/vm`, `typescript`.
3. Sync component docs & Convex AI guidelines:
   ```bash
   vp install
   pnpm --filter @repo/backend exec convex ai-files install
   mkdir -p .agents/skills/convex-dev-rag .agents/skills/convex-dev-workpool
   curl -fsSL https://www.convex.dev/components/rag/SKILL.md -o .agents/skills/convex-dev-rag/SKILL.md
   curl -fsSL https://www.convex.dev/components/workpool/llms.txt -o .agents/skills/convex-dev-workpool/llms.txt
   ```
4. Read `packages/backend/convex/_generated/ai/guidelines.md` and `.agents/skills/convex-dev-rag/SKILL.md` + `.agents/skills/convex-dev-workpool/llms.txt` before writing backend functions.

---

## 2. `convex.config.ts` & Typed Env + Auth-Ready Middleware (`convex/lib/`)

1. **`packages/backend/convex/convex.config.ts`:**
   - Mount `@convex-dev/rag/convex.config.js` and `@convex-dev/workpool/convex.config.js` (named `"ragIndexPool"`).
   - Declare typed environment variables via `defineApp({ env: { OPENAI_API_KEY: v.optional(v.string()), EMBEDDING_MODEL: v.optional(v.string()) } })` so functions import `env` from `../_generated/server` instead of reading `process.env`.
2. **`packages/backend/convex/lib/functions.ts`:**
   - Wrap `query`, `mutation`, and `action` using `convex-helpers` (`customQuery`, `customMutation`, `customAction`) exporting `appQuery`, `appMutation`, `appAction`.
   - Single-user pass-through for v1, acting as the single choke point for adding auth later (see [docs/storage-and-auth-options.md](../../../restructure/research/storage-and-auth-options.md)).
3. **`packages/backend/convex/lib/workpool.ts`:**
   - Instantiate `ragIndexPool = new Workpool(components.ragIndexPool, { maxParallelism: 5, retryActionsByDefault: true, defaultRetryBehavior: { maxAttempts: 3, initialBackoffMs: 1000, base: 2 } })` (safely under Convex free-tier limit of 20).
4. **`packages/backend/convex/lib/rag.ts`:**
   - Isolate embedding model creation in one factory reading `env.EMBEDDING_MODEL` / `env.OPENAI_API_KEY` from `../_generated/server`.
   - Instantiate `new RAG(components.rag, { textEmbeddingModel, embeddingDimension: 1536, filterNames: ["docId", "tag", "kind"] })`.

---

## 3. Schema (`packages/backend/convex/schema.ts`)

Follow Convex naming & index conventions from `guidelines.md`:
- **`records`:** `clientId`, `title`, `category`, `status` (`v.union(v.literal("draft"), v.literal("active"), v.literal("archived"))`), `tags` (`v.array(v.string())`), `attributes` (`v.record(v.string(), v.string())`), `updatedAt` (`v.number()`).
  - Indexes: `by_clientId`, `by_status_and_updatedAt`, `searchIndex("search_records", { searchField: "title", filterFields: ["status", "category"] })`.
- **`documents`:** `clientId`, `title`, `slug`, `markdown` (`v.string()` inline for `< 500 KB`), `storageId` (`v.optional(v.id("_storage"))` overflow blob for `>= 500 KB`), `frontmatter` (`v.record(v.string(), v.string())`), `tags` (`v.array(v.string())`), `ragStatus` (`v.union(v.literal("pending"), v.literal("indexed"), v.literal("failed"))`), `ragEntryKey` (`v.optional(v.string())`), `updatedAt` (`v.number()`).
  - Indexes: `by_clientId`, `by_slug`, `by_updatedAt`, `searchIndex("search_documents", { searchField: "markdown", filterFields: ["ragStatus"] })`.
- **`assets`:** `clientId`, `filename`, `mimeType`, `sizeBytes`, `width` (`v.optional(v.number())`), `height` (`v.optional(v.number())`), `storageId` (`v.id("_storage")`), `linkedEntityType` (`v.optional(v.union(v.literal("record"), v.literal("document")))`), `linkedEntityId` (`v.optional(v.string())`), `createdAt` (`v.number()`).
  - Indexes: `by_clientId`, `by_linkedEntityType_and_linkedEntityId`, `by_createdAt`.

---

## 4. Backend Modules & Split Actions

Follow `guidelines.md`: always include `args` validators, use `.take(n)` instead of unbounded `.collect()`, never call deprecated `ctx.storage.getMetadata` (read `_storage` via `ctx.db.system.get("_storage", storageId)`), and keep Node/external-fetch actions isolated from query files.

1. **`records.ts`:** `list` (bounded `.take(200)`), `getById`, `upsert` (keyed on `clientId` for idempotent TanStack DB optimistic inserts), `update`, `remove`.
2. **`documents.ts`:**
   - `listSummaries`: bounded `.take(200)` mapping ONLY summary fields (`_id`, `clientId`, `title`, `slug`, `frontmatter`, `tags`, `ragStatus`, `updatedAt`) — **never** returns inline `markdown` so TanStack DB eager sync never hits memory/16 MiB caps.
   - `getBySlug`: returns full document metadata + inline `markdown` (or resolved overflow URL).
   - `upsert` / `update` / `importMarkdown`: sets `ragStatus: "pending"`, enqueues `internal.searchActions.indexDocument` into `ragIndexPool` with `onComplete` `internalMutation` (`markRagStatus`) flipping `ragStatus` to `"indexed"` or `"failed"`.
   - `remove`: removes document row, deletes RAG entry if `ragEntryKey` exists, and deletes overflow `storageId` if present.
3. **`assets.ts`:**
   - `generateUploadUrl` (`mutation`)
   - `finalizeUpload` (`mutation`): inspects `ctx.db.system.get("_storage", args.storageId)` for `size`/`contentType`, stores `assets` row with `clientId`, returns `{ id, url: await ctx.storage.getUrl(args.storageId) }`.
   - `listAssets` (`query`, bounded `.take(200)` resolving `ctx.storage.getUrl()` per item).
   - `removeAsset` (`mutation`): deletes both `assets` row and `ctx.storage.delete(row.storageId)`.
4. **Split Search Modules:**
   - **`search.ts` (`query`):** `keywordSearch` using native `.withSearchIndex(...)` + `.take(20)` across `records` and `documents`.
   - **`searchActions.ts` (`action` / `internalAction`):**
     - `indexDocument` (`internalAction`): loads doc content (inline or from storage), chunks content, calls `rag.add(ctx, { namespace: "workspace", key: doc._id, title: doc.title, chunks, filterValues })` (graceful replacement by key). Guard cleanly if `OPENAI_API_KEY` is absent so non-AI flows fail clearly into `"failed"` status without crashing mutations.
     - `semanticSearch` (`action`): calls `rag.search(ctx, { namespace: "workspace", query, limit, chunkContext: { before: 1, after: 1 }, filters })` and hydrates matched `documents` summaries via one `internalQuery`.

---

## 5. Backend Tests (`convex-test` + `@edge-runtime/vm`)

Add `packages/backend/convex/*.test.ts` testing:
- `records` CRUD & `clientId` idempotent upsert
- `documents.listSummaries` omits `markdown` body while `getBySlug` returns it
- `assets` metadata creation & cascade deletion cleanup.

---

## Gate 3

```bash
vpr convex:typecheck
vpr check
vpr test
```
