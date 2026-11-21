# Convex React Vite App Plan

**Created:** 20/11/2026 19:25:56  
**Updated:** 20/11/2026 21:00:32  
**Exported:** 20/11/2026 21:06:49  
**Link:** [https://gemini.google.com/app/dd2eecd189247a60](https://gemini.google.com/app/dd2eecd189247a60)  

## User:

> 20/11/2026 19:25:56

I want to use convex for a react viteplus tanstack query router, mantine, zustand app. Find repos, templates look at docs everything latest forconvex. I want to  use for data records, markdown files images etc, also look at possible components toadd create a plan after I approve which ill give antigravity to

## Gemini:

> 20/11/2026 19:25:56

> **Thinking steps**
>
> **Configured Convex client**
>
> Established the Convex provider wrapper and environment variables for the VitePlus and TanStack application setup.
> **Identified relevant library**
>
> Identified the official react-query package using the updated GitHub organization name to ensure accuracy, facilitating seamless integration with the Convex development ecosystem.
> **Evaluated plan handoff**
>
> Examined new documentation and existing skill sets to determine the feasibility of direct plan handoff to the Antigravity system, confirming a new workflow is possible using the available resources.
> **Compared starter app options**
>
> Compared `aurewill/vite-convex-starter-app` to `convex/convex-saas`, noting the technologies in each and its respective configuration, deciding to examine each in detail.
> **Evaluated Mantine version**
>
> Checked and confirmed the Mantine version, alongside associated packages like tiptap and lightbox, to verify compatibility and access updated features for the project utilizing Vite and Oxlint.
> **Evaluated development technologies**
>
> Assessed the information for Vite+ including its unified CLI and versioning details to understand how the tools are evolving.
> **Assessed project setup methods**
>
> Determined that a Vite+ Mantine template exists with Oxlint and Vitest, and an AI agent-first tooling approach with machine-readable skill files is now offered for integration.
> **Evaluated data management options**
>
> Determined that Convex should handle server state like records, Markdown files, and search results, while ephemeral UI state, such as sidebar layout, can be managed with Zustand. Different strategies for storing structured data records and markdown files were identified based on size considerations, alongside options for images and binary files.
> **Evaluated storage solutions**
>
> Determined that native Convex Storage or `@convex-dev/r2` are optimal storage choices based on image size and bandwidth use, while `@gilhrpenner/convex-files-control` provides access controls. Different Convex components for Markdown editing, search, and production features were also identified for tiered implementation.

Searching the web...

Here is the latest state of the **Convex + React + Vite+ + TanStack Router/Query + Mantine + Zustand** stack, the best reference repos/docs, recommended Convex Components for data records, Markdown, and images, and a **draft plan** ready for your review before turning it into an execution spec for Antigravity.

---

### 1. Latest Ecosystem Snapshot (Key Compatibility Findings)

* **Vite+ (`vite-plus` v1.6.x)**: Now past 1.0, unifying Vite 8 (Rolldown), Vitest, Oxlint, Oxfmt, `tsgo`, and Vite Task behind the single `vp` CLI and a unified `vite.config.ts` (`import { defineConfig } from 'vite-plus'`).
* **Mantine v9.8.x**: Mantine's own official Vite template migrated to **Vite+** in v9.7.0 and ships **`oxc-config-mantine`** for Oxlint. Mantine v9 also ships `@mantine/tiptap` on Tiptap v3 (with built-in `ImageUpload`, tables, and collapsible sections) plus `@mantine/lightbox` (great for viewing stored images).
* **Convex (GitHub org renamed `get-convex` → `convex`)**:
  * **TanStack Query adapter (`@convex-dev/react-query`)**: Bridges Convex's live WebSocket subscriptions directly into TanStack Query via `convexQuery()` and `useConvexMutation()`.
  * **Agent-first setup**: Convex now ships `npx convex ai-files install` (which generates `convex/_generated/ai/guidelines.md` and `.agents/skills/`), an official `convex/agent-skills` repo, and per-component `SKILL.md` / `llms.txt` files directly on `convex.dev/components` — ideal for feeding to Antigravity.

---

### 2. Best Repos, Templates & Docs to Reference

| Resource | Link | What to Borrow From It |
| :--- | :--- | :--- |
| **Vite + Convex + TanStack Router + Mantine Starter** | [`aurewill/vite-convex-starter-app`](https://github.com/aurewill/vite-convex-starter-app) | Closest match to your exact stack (Vite, Convex, TanStack Router, Mantine, `.agents` setup). |
| **Convex TanStack SaaS Starter** | [`convex.dev/examples/convex-saas`](https://www.convex.dev/examples/convex-saas) | Official Vite + TanStack Router + Convex SPA reference with auth, file uploads, and layout structure. |
| **TanStack + Convex Trellaux Example** | [`TanStack/router/.../start-convex-trellaux`](https://github.com/TanStack/router/blob/main/examples/react/start-convex-trellaux/README.md) | Canonical `@convex-dev/react-query` patterns (`convexQuery`, `useSuspenseQuery`, route loader prefetching). |
| **Collaborative Editor Example** | [`convex.dev/examples/collaborative-editor`](https://www.convex.dev/examples/collaborative-editor) | Reference wiring for `@convex-dev/prosemirror-sync` with Tiptap/BlockNote. |
| **Convex Components Directory Repo** | [`convex/components-submissions-directory`](https://github.com/convex/components-submissions-directory) | Up-to-date real-world Vite + Convex app showing `.agents/skills`, `AGENTS.md`, `convex-helpers`, and real-time search/filtering. |
| **Official Docs (Agent-Readable)** | [`docs.convex.dev/client/tanstack/tanstack-query/`](https://docs.convex.dev/client/tanstack/tanstack-query/)<br>[`github.com/convex/agent-skills`](https://github.com/convex/agent-skills)<br>[`convex.dev/agent-setup.md`](https://www.convex.dev/agent-setup.md) | Official adapter setup (append `.md` to any Convex docs URL for clean Markdown) and official agent skills. |

---

### 3. Architecture Strategy: Records, Markdown, Images & State Boundaries

#### A. Data Modeling & Storage Split
* **Structured Data Records**: Stored in Convex tables with strict `v.*` schema validators (plus optional Zod schemas via `convex-helpers`), composite indexes for filtering/sorting, and native `searchIndex` for full-text keyword search. *(Hard limit to keep in mind: **1 MiB max per Convex document**.)*
* **Markdown Files**:
  * **Standard docs (< ~500 KB)**: Store raw Markdown string + extracted metadata (title, tags, frontmatter, slug, `updatedAt`) directly in a `documents` table with a `searchIndex` on content/title — instant reactivity, zero extra storage calls, and easy diffing/export.
  * **Large Markdown files (> 500 KB) or raw `.md` uploads**: Store the raw file blob in File Storage/R2 and store parsed metadata + searchable text chunks in Convex tables to stay safely under the 1 MiB document limit.
  * **Rich / Multi-tab Editing (Optional)**: Pair `@mantine/tiptap` (Tiptap v3) with `@convex-dev/prosemirror-sync` (uses operational transforms so edits survive reloads and sync across tabs/devices) and serialize/import Markdown cleanly.
* **Images & Binary Assets (Free-Tier Considerations)**:
  * **Convex Built-in File Storage**: Zero extra accounts, 3-step upload (`generateUploadUrl` → `POST` → save `storageId`), but Free/Starter tier caps at **1 GB storage and 1 GB/month egress** (and file reads count toward function calls). Great for prototyping, avatars, and light image usage.
  * **Cloudflare R2 via `@convex-dev/r2`**: Recommended if your app will store/serve many images. Signed client uploads (`useUploadFile`), server uploads (`r2.store`), automatic metadata sync into Convex, and avoids Convex's 1 GB/mo file egress ceiling. *(Tip: attach a custom domain to R2 if you want permanent CDN-cached image URLs instead of expiring signed URLs.)*

#### B. State Ownership (Avoiding Overlap)
| Tool | Owns | Does NOT Own |
| :--- | :--- | :--- |
| **Convex + TanStack Query** (`@convex-dev/react-query`) | All server state: records, Markdown docs, file metadata/URLs, search results, auth user. Real-time WebSocket updates without manual `invalidateQueries`. | Ephemeral UI toggles, modals, local drafts. |
| **TanStack Router** | File-based routes (`@tanstack/router-plugin`), URL search params (filters, sort, active doc/record view), and zero-waterfall preloading via `context.queryClient.ensureQueryData(convexQuery(...))` in route loaders. | Non-shareable layout state. |
| **Zustand** | Client-only UI state: sidebar/inspector collapse, split-pane layout, multi-row selection IDs (for Mantine v9 `ActionBar`), Markdown editor mode (`rich` / `raw` / `split`), pending upload progress queues, active lightbox slide. | Cached Convex database rows. |

> **Important Integration Rule**: Wrap your app in **both** `<ConvexProvider>` and `<QueryClientProvider>`. `@convex-dev/react-query` powers TanStack Query hooks + Router loaders, while `<ConvexProvider>` is still required by official Convex Component React hooks (`useUploadFile`, `useTiptapSync`, `usePaginatedQuery`, auth hooks).

---

### 4. Candidate Convex Components to Add

Every component below isolates its own tables cleanly inside `convex/convex.config.ts` without polluting your app schema, and most expose a `SKILL.md` you can install for Antigravity.

#### Tier 1 — High-Value Core (Pick What Matches Your Scope)
1. **`convex-helpers`** *(utility library, not a component)*: Almost mandatory for serious apps — gives you `customQuery`/`customMutation` (auth/middleware wrappers), database **triggers** (auto-update aggregates, search chunks, or cleanup files on record delete), Zod validation, and `stream` queries.
2. **File/Image Storage (pick one)**:
   * **Native Convex Storage** (simplest, zero external accounts, 1 GB free)
   * **`@convex-dev/r2`** (official; best for image-heavy apps & low egress cost)
   * **`@gilhrpenner/convex-files-control`** (community; supports **both** Convex Storage & R2, adds access keys, expiring download grants, and scheduled orphan/expired file cleanup)
   * **`convex-fs`** (community; filesystem paths/directories, atomic moves, blob deduplication, soft deletes, optional Bunny CDN image transforms)
3. **Authentication (if multi-user)**:
   * **`@convex-dev/better-auth`** (modern, flexible, strong TanStack ecosystem alignment) or **`@convex-dev/auth`** (lightweight native Convex Auth).
4. **`@convex-dev/aggregate`**: Scalable O(log n) record counts, sums, and offset-style pagination stats without scanning entire tables.

#### Tier 2 — Markdown, Rich Text & Search
5. **`@convex-dev/prosemirror-sync`**: Real-time synced editing for `@mantine/tiptap` (multi-tab & multi-user safe via operational transforms).
6. **`@convex-dev/rag`**: Automatic text chunking, embeddings, namespaced vector semantic search, and filtered hybrid retrieval over your Markdown library.
7. **`@convex-dev/presence`**: Live "currently viewing / editing" user indicators per document or record.

#### Tier 3 — Production Hardening & Async Pipelines (Add When Needed)
8. **`@convex-dev/workpool`** or **`@convex-dev/workflow`**: Durable background queues/pipelines (e.g., on Markdown upload → parse frontmatter → extract image refs → chunk & index in RAG with automatic retries).
9. **`@convex-dev/migrations`**: Zero-downtime live schema backfills as your record shapes evolve.
10. **`@convex-dev/rate-limiter`**: App-layer rate limiting for uploads, mutations, or AI/search actions.

---

### 5. Draft Plan (For Your Approval → Antigravity Execution Spec)

Once you approve or tweak the choices below, I will convert this into a crisp, copy-pasteable `PLAN.md` / implementation prompt tailored specifically for **Antigravity**.

#### Phase 0 — Tooling, Vite+ & Agent Grounding
* Scaffold or verify **Vite+** (`vp`) with React 19, TypeScript, **Mantine v9** (`@mantine/core`, `@mantine/hooks`, `@mantine/notifications`, `@mantine/dropzone`, `@mantine/lightbox`, optional `@mantine/tiptap`), **TanStack Router** (`@tanstack/router-plugin`), **TanStack Query**, and **Zustand**.
* Configure unified `vite.config.ts` (`defineConfig` from `vite-plus`):
  * Register `@tanstack/router-plugin` (before React plugin).
  * Configure Oxlint with `oxc-config-mantine` and ignore generated files (`convex/_generated/**`, `src/routeTree.gen.ts`) in both `lint` and `fmt` blocks.
* Initialize Convex (`npm install convex @convex-dev/react-query convex-helpers`) and run `npx convex ai-files install` so Antigravity immediately has `convex/_generated/ai/guidelines.md` and `.agents/skills/`.
* Fetch `SKILL.md` files for whichever Convex Components you select into `.agents/skills/`.
* Wire a unified dev command (`vp dev` + `npx convex dev`) and verify `vp check` passes cleanly.

#### Phase 1 — Core Client & Router Wiring
* Create `src/lib/convex.ts` instantiating `ConvexReactClient(import.meta.env.VITE_CONVEX_URL)` and `ConvexQueryClient`, connected to `QueryClient` with `convexQueryClient.hashFn()` and `convexQueryClient.queryFn()`.
* Configure `src/routes/__root.tsx` using `createRootRouteWithContext<{ queryClient: QueryClient }>()` and `src/router.tsx` with `defaultPreload: 'intent'`.
* Mount provider hierarchy cleanly in `src/main.tsx`: `MantineProvider` → `ConvexProvider` (or `ConvexAuthProvider`) → `QueryClientProvider` → `RouterProvider` (plus `Notifications` & `Lightbox` portals).
* Establish typed helper layer in `convex/lib/functions.ts` using `convex-helpers` (`customQuery` / `customMutation` + optional triggers).

#### Phase 2 — Structured Data Records Module
* Define `convex/schema.ts` tables for your data records with composite indexes and `searchIndex`.
* Implement CRUD queries/mutations, cursor-based pagination, and (if selected) `@convex-dev/aggregate` for live counts.
* Build Mantine record views (list/table + detail/form + bulk `ActionBar`) with TanStack Router `loader` prefetching (`ensureQueryData(convexQuery(...))`) and URL-driven filters/sorting.

#### Phase 3 — Markdown Files Module
* Add `documents` table (title, slug, content/storageId, frontmatter/tags, folder/parentId, `updatedAt`) with full-text `searchIndex` (and optional `@convex-dev/prosemirror-sync` + `@mantine/tiptap` or raw Markdown + preview split view).
* Support `.md` file import/export (drag-and-drop via `@mantine/dropzone`, frontmatter extraction, auto-handling files approaching the 1 MiB document limit).
* *(Optional)* Wire `@convex-dev/rag` + `@convex-dev/workpool` for background chunking and semantic search.

#### Phase 4 — Images & File Assets Pipeline
* Configure chosen storage backend (Native Convex Storage, `@convex-dev/r2`, `Files Control`, or `ConvexFS`) in `convex/convex.config.ts` and `convex/files.ts`.
* Store normalized `assets` metadata table (filename, mimeType, size, width/height, storageId/r2Key, linked record/document IDs).
* Build reusable Mantine `Dropzone` uploader (client-side validation/preview + Zustand upload queue) and gallery/attachment viewer powered by `@mantine/lightbox`.
* Add orphan/cascade cleanup trigger when a linked record or Markdown doc is deleted.

#### Phase 5 — Zustand UI Store & Verification Gates
* Create modular Zustand stores strictly for UI/workspace state (layout panels, selection state, editor mode, upload queue).
* Verification gates for Antigravity to pass before completion:
  1. `npx convex dev --once` / `npx convex typecheck` passes with zero schema/validator errors.
  2. `vp check` (Oxlint + Oxfmt + `tsgo`) and `vp build` succeed with zero warnings/errors.
  3. End-to-end smoke checks: real-time record sync across 2 tabs, Markdown create/edit/search/import, image upload/render/delete cleanup.

---

### 6. Quick Decisions Before I Generate the Antigravity Handoff Plan

Tell me your preferences on these 5 points and I'll generate the exact step-by-step Antigravity blueprint (including exact packages, `convex.config.ts`, `vite.config.ts`, schema skeleton, and agent skill commands):

1. **Greenfield or existing repo?** Are we adding Convex into an already-scaffolded Vite+ app or scaffolding from scratch?
2. **Authentication**: Single-user / local-first for now, or multi-user right away (and if so, **Better Auth** vs **Convex Auth**)?
3. **File/Image Storage**: Start simple with **Native Convex Storage** (1 GB free, zero extra setup), go straight to **Cloudflare R2 (`@convex-dev/r2`)** (best for heavy images / zero egress), or add **Files Control** (hybrid Convex + R2 + access control + auto-cleanup)?
4. **Markdown Editing Experience**: Raw/split Markdown editor + rendered preview, or rich WYSIWYG via **`@mantine/tiptap` + `@convex-dev/prosemirror-sync`**?
5. **Extra Components**: Which optional ones do you want in v1 — **`@convex-dev/aggregate`** (counts/stats), **`@convex-dev/rag`** (semantic search), **`@convex-dev/presence`** (live collaborators), **`@convex-dev/workpool`** (background processing), or **`@convex-dev/migrations`**?

## User:

> 20/11/2026 19:43:51

Plan already wrong, id start with a template or starter or a repo not from scratch, also I use pnpm. I think re for starter vite plus templates ( maybe with tanstack start but don't want start instead only router query maybe db @rc latest. And same for mantine, for convex start from a repo or example or template So id maybe first have 3 or more repos, then idstart to take whatever useful out. Also some of these have cli, which do some of the work instead of by hand. Note, id want pnpm to remain as package manager ( use pnx, pnpm, pnpm execute etc,) for viteplus i want caching for everything that can ( using rust based),

## Gemini:

> 20/11/2026 19:43:51

> **Thinking steps**
>
> **Evaluated technical framework versions**
>
> Searched current release documentation for React 19, Vite 8, and Mantine 9 to verify modern syntax and configuration standards before writing implementation steps.
> **Identified new database features**
>
> Discovered that a specific database collection feature, `@tanstack/convex-db-collection`, exists within a recently released database version.
> **Explored Vite+ caching**
>
> Explored configurations for Vite+ caching, specifically examining options within 'run' blocks and potential interactions with Mantine, Rolldown, Oxlint, and tsgo caching to understand their impact.
> **Checked caching configurations**
>
> Evaluated two different caching configuration syntaxes to verify which is correct for implementation based on the user's provided references, resolving the ambiguity about which syntax to adopt for the specific project.
> **Confirmed user requirements**
>
> Confirmed the user's explicit request to search the web without ambiguity, ensuring no misinterpretation of intent occurred during task formulation.
> **Assembled web app components**
>
> Constructed a project workspace by integrating foundational configurations from various template repositories, including Vite, TanStack Router with database integration, and Convex references, adapting a CLI-driven workflow to set up core modules.
> **Configured build caching**
>
> Enabled caching for build tasks, determining that Vite Task's file and environment dependency tracking with content-based cache sharing would optimize repetitive build steps for speed.

Searching the web...

Got it — scratch the greenfield plan. A **multi-repo harvest + CLI-driven assembly** workflow is much smarter here, especially since Mantine, Vite+, TanStack, and Convex all ship CLIs/templates that already solve the annoying config wiring.

Also, one major upgrade worth knowing before locking the plan: **TanStack DB 1.0 RC** now ships an official **`@tanstack/convex-db-collection`** (`1.0.0-rc.1.4`) adapter.

---

### 1. The 4 Reference Repos / CLI Scaffolds to Pull First (`_refs/`)

Instead of hand-coding boilerplate, pull these into a temporary `_refs/` folder (all using `pnpm` / `pnpx` / `pnpm dlx`), inspect what works cleanly, and graft into one chosen base:

| Slot | Repo / CLI Command (strictly `pnpm`) | Why Pull It / What to Harvest |
| :--- | :--- | :--- |
| **1. Vite+ + Mantine Base** | `git clone [https://github.com/mantinedev/vite-template](https://github.com/mantinedev/vite-template) _refs/mantine-vp`<br>*(Alternative clean `pnpm` base: `pnpm dlx --package=vite-plus@1.7.0 vp create _refs/vp-app`)* | **Already migrated to Vite+** and updated to `@mantine/*` **9.8.0** + Vitest v5. Has working `vite.config.mjs` (Oxlint + Oxfmt + Vitest), `postcss.config.cjs`, `test-utils`, and Storybook. *(Caveat: ships with Yarn/Corepack — strip `yarn.lock`/`.yarnrc.yml` and convert to `pnpm`.)* |
| **2. TanStack SPA (Router + Query + DB — NO Start)** | `pnpm dlx @tanstack/cli create _refs/tanstack-spa --router-only --package-manager pnpm` | Uses `--router-only` to generate a pure file-based SPA **without** TanStack Start/SSR. Harvest the `@tanstack/router-plugin` wiring, `src/routes/__root.tsx`, `routeTree.gen.ts` setup, and Query integration. Pass `--intent` if you want TanStack's local coding-agent skill mappings generated too. |
| **3. Convex Backend + Agent Setup** | `pnpm create convex@latest _refs/convex-ref -- -t react-vite-shadcn` *(or `-t bare` for minimal `convex/`)*<br>Optional clone: [`aurewill/vite-convex-starter-app`](https://github.com/aurewill/vite-convex-starter-app) | `create-convex` supports `-t owner/repo` directly to pull any GitHub starter. Harvest `convex/` layout, `convex.json`, env wiring, and auth/file patterns. Note: Convex's own agent setup explicitly recommends `pnpm add convex` + `pnpm dlx convex ai-files install` inside an existing project rather than running `create-convex` over it. |
| **4. Convex Real-World Patterns** | `git clone [https://github.com/get-convex/convex-saas](https://github.com/get-convex/convex-saas) _refs/convex-saas` *(or `get-convex/templates`)* | Harvest production patterns for TanStack Router + Convex SPA, file uploads, and layout/auth guards without keeping Tailwind/shadcn baggage. |

#### Which Should Be the Actual Base Repo?
Two clean options — pick whichever feels less messy to you:
* **Option A (Fastest):** Clone `mantinedev/vite-template` as the main repo → delete `yarn.lock` & `.yarnrc.yml`, set `"packageManager": "pnpm@..."`, run `pnpm install` + `pnpm dlx --package=vite-plus@1.7.0 vp migrate --no-interactive` (to update to Vite+ 1.7.0 + `pnpm` overrides) → graft TanStack SPA & Convex in.
* **Option B (Cleanest `pnpm` lockfile from line 1):** Start with `pnpm dlx --package=vite-plus@1.7.0 vp create my-app` (picks `pnpm` natively, sets up `vite.config.ts` in TypeScript instead of `.mjs`) → copy Mantine's `postcss.config.cjs`, `test-utils`, and `vite.config` lint/fmt rules from `_refs/mantine-vp`, then graft TanStack SPA & Convex.

---

### 2. Keeping `pnpm` Strict + Letting CLIs Do the Heavy Lifting

* **Zero Yarn/npm leakage:** Lock `"packageManager": "pnpm@10.x"` in `package.json`. Vite+ automatically detects `packageManager` and `pnpm-lock.yaml`, routing `vp install` / `vp add` / `vp dlx` through `pnpm`.
* **Running `vp` strictly through `pnpm`:** You don't even need a global `vp` binary (or if you install it, run `vp env off` so it defers to your existing `fnm` Node manager). Every command works via:
  * `pnpm dlx --package=vite-plus@1.7.0 vp create` / `vp migrate`
  * `pnpm exec vp check` / `pnpm exec vp run <task>` / `pnpm exec vp cache clean`
  * `pnpm dlx convex ai-files install` (generates `convex/_generated/ai/guidelines.md` + `.agents/skills/` for Antigravity)
  * `pnpm exec vp config` (sets up Git hooks + coding-agent instructions automatically; note `proseWrap: 'preserve'` is useful for `AGENTS.md`/`CLAUDE.md` so `vp check` doesn't fight `vp config`).
* **Don't hand-edit Vite+ overrides:** Let `vp create` or `vp migrate` write the `pnpm.overrides` / `vite` → `@voidzero-dev/vite-plus-core` aliasing into `package.json` so plugins like `@tanstack/router-plugin` resolve Vite 8/Rolldown cleanly without duplicate Vite installs.

---

### 3. Maximizing Rust-Based Caching in Vite+ (`vite.config.ts`)

Vite+ bundles **Rolldown**, **Oxlint**, **Oxfmt**, and **Vite Task** (Rust-based task runner with content-addressed caching stored in `node_modules/.vite/task-cache`).

**Critical default that catches people off guard:**
In Vite+, `run.cache.tasks` defaults to `true`, while `run.cache.scripts` defaults to **`false`** — meaning normal `package.json` scripts are **not cached** unless you enable it in `vite.config.ts` or pass `--cache`.

To cache **everything deterministic** while staying safe with Convex:

`​`​`ts
// vite.config.ts (target shape to graft)
import { defineConfig } from 'vite-plus';

export default defineConfig({
  // ...plugins: [tanstackRouter(...), react()]
  run: {
    cache: {
      tasks: true,   // cache all tasks defined below
      scripts: true, // opt-in caching for package.json scripts run via `vp run`
    },
    tasks: {
      // Deterministic tasks -> cached with automatic file/env dependency tracking
      'check': { command: 'vp check' },
      'lint': { command: 'vp lint' },
      'fmt:check': { command: 'vp fmt --check' },
      'test': { command: 'vp test' }, // single-run (not watch) -> cacheable
      'convex:typecheck': {
        command: 'pnpm exec convex typecheck',
        cache: {
          input: [{ auto: true }, '!convex/_generated/**'],
        },
      },
      'build': {
        command: 'vp build',
        cache: {
          // Vite Task runs in a clean env by default!
          // Whitelist build-time env vars so cache keys stay accurate.
          env: ['NODE_ENV', 'VITE_CONVEX_URL'],
          untrackedEnv: ['CI'],
          input: [{ auto: true }, '!dist/**'],
          output: ['dist/**'],
        },
      },
      // Non-deterministic / long-running -> explicitly opt out
      'dev': { command: 'vp dev', cache: false },
      'convex:dev': { command: 'pnpm exec convex dev', cache: false },
      'test:watch': { command: 'vp test watch', cache: false },
    },
  },
});
`​`​`
*(Config rules verified from Vite+ Task Caching docs.)*

**Key caching mechanics to keep in mind:**
* **Automatic input tracking & content sharing:** Vite Task traces which files each command actually reads and shares cache entries across compound scripts (e.g., if `vp run check` ran `vp lint`, a subsequent `vp run release` containing `vp lint` hits cache instantly).
* **Always invoke via `pnpm exec vp run <task>`** (or `vp run <task>`) — running `vp build` directly bypasses Vite Task caching unless invoked through `vp run`.
* **Known Vite+ caveat (Nov 2026):** Built-in `vp build`/`vp pack` cache keys currently embed the absolute checkout path, so caching hits reliably in-place on your repo, but copying `node_modules/.vite/task-cache` to a different directory path will miss. Clear cache anytime with `pnpm exec vp cache clean`.

---

### 4. TanStack DB (`@rc`) + Convex — How It Fits With TanStack Query

Since you mentioned **TanStack DB (`@rc`/latest)** alongside TanStack Query, live docs confirm `@tanstack/convex-db-collection` (`1.0.0-rc.1.4`) is already live and tested against Convex:

* **What it gives you:** Subscribes to Convex queries via official `onUpdate` / `watchQuery` APIs and materializes rows into reactive TanStack DB collections for **instant local joins, filtering, sorting, and optimistic writes** (plus optional `@tanstack/offline-transactions` durable outbox).
* **Two schema/architecture rules it imposes right from Day 1:**
  1. **Add a client-generated `clientId` field** to tables that need optimistic inserts (Convex assigns `_id` server-side, while TanStack DB needs a stable key before the server responds).
  2. **Clean split with TanStack Query:**
     * **TanStack DB (`@tanstack/convex-db-collection`)** → interactive tables/collections you filter, join, sort locally, or optimistically edit (data records, document list/tree, tags, asset catalog).
     * **TanStack Query (`@convex-dev/react-query`)** → single-item detail views, search results, route-loader preloading, and one-off queries/actions.
     * **Zustand** → pure UI/workspace state (panels, tabs, active editor mode, multi-select IDs, upload progress queue).
* **Agent-ready docs:** TanStack DB exposes plain Markdown docs at `[tanstack.com/db/latest/docs/collections/convex-collection.md](https://tanstack.com/db/latest/docs/collections/convex-collection.md)` and `.../reference/convex-db-collection/offline.md` — easy to hand directly to Antigravity.

---

### 5. Revised Harvest-First Plan (Draft for Approval → Antigravity Spec)

* **Phase 0 — Pull `_refs/` & Audit (CLI-Only, Zero Hand-Coding)**
  * Pull the 3–4 reference repos into `_refs/` using `git clone`, `pnpm dlx @tanstack/cli create --router-only --package-manager pnpm`, and `pnpm create convex@latest`.
  * Compare `package.json`, `vite.config.*`, `tsconfig.json`, and `convex/` across `_refs/` to extract the exact dependency matrix and plugin order.
* **Phase 1 — Initialize Base Repo + Lock `pnpm` + Vite+ Rust Caching**
  * Initialize from chosen base (**Option A**: `mantinedev/vite-template` converted to `pnpm` + `vp migrate`, OR **Option B**: `vp create` + Mantine grafted from `_refs/mantine-vp`).
  * Configure `vite.config.ts` with `run.cache` (`tasks: true`, `scripts: true`), `lint` (`oxc-config-mantine`), `fmt`, `test`, and `staged`.
  * Verify `pnpm exec vp run check` and `pnpm exec vp run build` run clean and produce **cache hits** on immediate re-run.
* **Phase 2 — Graft TanStack Router SPA + Query + TanStack DB (`@rc`) + Zustand**
  * Port `@tanstack/router-plugin`, `routes/__root.tsx`, and `router.tsx` from `_refs/tanstack-spa` (strictly SPA, no Start).
  * Install `@convex-dev/react-query`, `@tanstack/react-query`, `@tanstack/db@rc`, `@tanstack/react-db@rc`, `@tanstack/convex-db-collection@rc`, and `zustand`.
* **Phase 3 — Wire Convex Backend + Agent Skills + Components**
  * Install `convex` + `convex-helpers`, run `pnpm dlx convex ai-files install` (verifying `convex/_generated/ai/guidelines.md` and `.agents/skills/`).
  * Wire chosen Convex Components in `convex/convex.config.ts` and download their `SKILL.md` files into `.agents/skills/`.
  * Add `clientId` fields in `convex/schema.ts` for TanStack DB optimistic collections.
* **Phase 4 — Domain Verticals (Records, Markdown, Images) & Delete `_refs/`**
  * Implement Records (DB collection + Mantine views), Markdown (table + search index + optional `@mantine/tiptap`/`prosemirror-sync` or raw/split), and Images (chosen storage component + Mantine `Dropzone` + `Lightbox`).
  * Run full verification gates (`pnpm exec vp run check`, `pnpm exec vp run convex:typecheck`, `pnpm exec vp run test`, `pnpm exec vp run build` ×2 to verify Rust task cache hits), then remove `_refs/`.

---

### Quick Sign-Off to Lock the Antigravity Spec

Confirm these 4 things and I'll generate the exact copy-pasteable Antigravity execution plan (`PLAN.md` + exact `pnpm` CLI commands):

1. **Base repo choice:** **Option A** (`mantinedev/vite-template` → strip Yarn → `pnpm` + `vp migrate`) or **Option B** (fresh `vp create` with `pnpm` → graft Mantine from `_refs/mantine-vp`)?
2. **TanStack DB (`@rc`):** Include **`@tanstack/convex-db-collection`** (+ optional `@tanstack/offline-transactions`) from Phase 2, or keep it as a Phase 2b opt-in?
3. **Storage & Auth components:** Which Convex components do you want in v1 — **Native Storage** vs **`@convex-dev/r2`** vs **`Files Control`**, and **No Auth** vs **Better Auth** vs **Convex Auth**?
4. **Markdown & Extras:** Raw/split Markdown or **`@mantine/tiptap` + `@convex-dev/prosemirror-sync`**, and any of **`aggregate` / `rag` / `workpool` / `presence`**?

## User:

> 20/11/2026 21:00:32

1. Whatever takes mode work, could consider reposike these too https://github.com/mugnavo/cove-monorepo , 2 use latest db rc, 3. start wit whatever is quickest, other options write to docs/something, markdown: blocknote but maybe other for quickest. @convex-dev/rag and @convex-dev/workpool for background chunking and semantic search yes. SO now create plan, you can create several files, also create AI intruction(AGENTS.md or whatever), there minimal text: mantine has to have createTheme, no props in ui code, use set default props there, at very max can use module.css BUT there also use: semantic css vars which are in a style folder. Also: i would consider: similar folder/file structure as the repo i sent you (packeges + app/web etc) AND have to apply best practices like seperation of concerns etc.

## Gemini:

> 20/11/2026 21:00:32

> **Thinking steps**
>
> **Evaluated operational protocols**
>
> Determined that mandatory web search protocols and interaction constraints must be incorporated before formulating any technical response to ensure compliance.
> **Examined repository architecture**
>
> Investigated the folder structure, workspace configuration, and modern software packages for the target monorepo to design an integrated project plan.
> **Analyzed project file structure**
>
> Examined the monorepo's folder structure, `apps/`, `packages/`, `pnpm-workspace.yaml`, and `vite.config.ts`, and also evaluated compatibility of @blocknote/mantine with Mantine v9 and React 19.
> **Verified Antigravity dependencies**
>
> Verified the proper versions and import paths for the Antigravity project's dependencies, ensuring compatibility with Mantine v9 and the Convex framework to prevent errors during the configuration process.
> **Assessed project code structure**
>
> Assessed the "mugnavo/cove-monorepo" repository, noting its organization with an "apps/web" structure indicating a single-page web application using Vite+ and pnpm workspaces.
> **Evaluated document generation requirements**
>
> Analyzed the constraints for creating a single document and determined that raw search details must be incorporated directly into the query parameter to ensure accurate generation.
> **Analyzed monorepo file structure**
>
> Selected the cove monorepo template as the primary structural base while removing unwanted frameworks to prepare the multi-file kit for copying.
> **Designed monorepo architecture**
>
> Configured separate workspaces for the frontend application, backend database services, design system, and shared TypeScript domain logic to establish strict separation of concerns.
> **Configured state and build architecture**
>
> Distributed application state cleanly across local reactive collections, detail fetchers, and ephemeral stores while establishing strict package manager caching rules for the build environment.

Searching the web...

Below is your complete **4-file handoff kit** ready to drop into the repo root and hand straight to **Antigravity**.

Key verified findings folded into the plan:
* **`mugnavo/cove-monorepo`** is a public-domain (`Unlicense`) **Vite+ + `pnpm` workspace monorepo** (`apps/web`, `packages/*`, `tools/tsconfig`, `pnpm-workspace.yaml`, `.agents/workflow.md`, `@tanstack/intent`, and Vite Task caching) — making it an ideal structural base to clone and strip of TanStack Start/Nitro/Tailwind/Drizzle/Better Auth [1.1.1, 1.1.2, 3.1.1].
* **`@tanstack/convex-db-collection`** (`1.0.0-rc.1.4`) uses official Convex `onUpdate`/`watchQuery` APIs and requires a client-generated `clientId` key for optimistic inserts [1.2.1, 1.2.2].
* **`@convex-dev/rag`** requires `ai@^7` as a peer dependency, registers via `@convex-dev/rag/convex.config.js`, and ships an official `SKILL.md` (`[https://www.convex.dev/components/rag/SKILL.md](https://www.convex.dev/components/rag/SKILL.md)`) [4.2.1, 4.2.2].
* **`@convex-dev/workpool`** registers via `@convex-dev/workpool/convex.config.js` with bounded `maxParallelism` (keep total `<= 20` on Convex's free tier) and exponential backoff retries [4.3.1].
* **BlockNote** (`@blocknote/core` `0.57.x` + `@blocknote/mantine`) integrates natively with `@convex-dev/prosemirror-sync/blocknote` [1.3.1, 1.3.4, 4.1.3]; the plan uses a zero-friction split Markdown editor for v1 speed while isolating the editor behind `@repo/ui` so BlockNote can be swapped in cleanly (documented in `docs/markdown-editor-options.md`).

---

### File 1: `AGENTS.md`

`​`​`markdown
# AGENTS.md

Minimal, strict engineering rules for this monorepo. Follow without exception.

## 1. Package Manager & Toolchain
- Use `pnpm`, `pnpm dlx`, and `pnpm exec` exclusively. Never use `npm`, `npx`, `yarn`, or `bun`.
- Run repo tasks through Vite+ (`pnpm exec vp run <task>`, `pnpm exec vp check`, `pnpm exec vp test`) to hit Rust-based Vite Task caches.
- Never hand-edit generated files: `**/routeTree.gen.ts`, `packages/backend/convex/_generated/**`.
- Before writing Convex code, read `packages/backend/convex/_generated/ai/guidelines.md` and `.agents/skills/*/SKILL.md`.

## 2. Mantine UI & Styling (STRICT)
- Theme lives ONLY in `packages/ui/src/theme/theme.ts` (`createTheme`) and `cssVariablesResolver.ts`.
- Configure component defaults via `theme.components.<Name>.defaultProps` and `classNames`.
- **NO visual/layout/styling props in UI JSX** (banned in `apps/web` and feature components: `p`, `px`, `py`, `pt`, `pb`, `pl`, `pr`, `m`, `mx`, `my`, `mt`, `mb`, `ml`, `mr`, `c`, `bg`, `fz`, `fw`, `lh`, `ta`, `radius`, `shadow`, `w`, `h`, `miw`, `maw`, `mih`, `mah`, `style`, `styles`, `gap`, `size`, `variant`, `color` unless a component explicitly accepts a semantic domain prop).
- If `defaultProps` cannot express a layout or state style, use a colocated `*.module.css` file.
- Inside `*.module.css`, **ONLY use semantic CSS variables** declared in `packages/ui/src/styles/` (e.g., `var(--surface-canvas)`, `var(--space-md)`, `var(--border-subtle)`). Never write raw hex/rgb colors or raw pixel/rem measurements in CSS Modules.

## 3. Monorepo Boundaries (Separation of Concerns)
Unidirectional dependency graph — never invert or bypass:

- `packages/domain`: Pure TypeScript + Zod schemas, domain types, Markdown frontmatter/chunk helpers, validation. **Zero** React, Mantine, Router, or `convex/server` imports.
- `packages/backend`: Convex schema, functions, `@convex-dev/rag`, `@convex-dev/workpool`, storage, triggers. Exports only generated `api`/`dataModel` types and safe client constants. **Zero** React/UI imports.
- `packages/ui`: Mantine v9 `createTheme`, `cssVariablesResolver`, `styles/` semantic CSS variables, and dumb presentational primitives. **Zero** Convex, TanStack Router, TanStack Query/DB, or Zustand imports.
- `packages/logger`: Structured logger and normalized error helpers.
- `apps/web`: Pure SPA composition layer (TanStack Router SPA, TanStack DB collections, TanStack Query hooks, Zustand UI stores, feature modules). Imports `@repo/ui`, `@repo/domain`, `@repo/backend`, `@repo/logger`.

## 4. State Ownership
- **TanStack DB (`@tanstack/convex-db-collection`)**: Reactive lists/tables needing local filtering, sorting, joins, or optimistic writes (tables MUST include `clientId`).
- **TanStack Query (`@convex-dev/react-query`)**: Single-item details, route loader prefetching, and RAG semantic search actions.
- **TanStack Router**: URL search params, active route/view/filter state.
- **Zustand**: Ephemeral client UI state ONLY (sidebar/panel layout, selection IDs, editor mode, upload progress queue). Never mirror Convex records in Zustand.

## 5. Verification Before Completing Any Phase
1. `pnpm exec vp run convex:typecheck`
2. `pnpm exec vp run check` (Oxlint + Oxfmt + typecheck)
3. `pnpm exec vp run test`
4. `pnpm exec vp run build`
`​`​`

---

### File 2: `PLAN.md`

`​`​`markdown
# Execution Plan — Vite+ Monorepo (Convex + TanStack Router/Query/DB + Mantine v9 + Zustand)

> **Execution Strategy:** Harvest from existing templates/repos via CLIs first (`_refs/`), assemble into a clean `pnpm` + Vite+ monorepo modeled on `mugnavo/cove-monorepo`, enforce strict Separation of Concerns, verify every phase via cached Vite+ tasks, then delete `_refs/`.

---

## Target Monorepo Layout

`​`​`text
.
├── apps/
│   └── web/                         # Pure Vite+ React 19 SPA (NO TanStack Start / SSR)
│       ├── src/
│       │   ├── app/                 # Providers (Mantine, Convex, QueryClient, Router)
│       │   ├── data/                # Convex client, QueryClient, TanStack DB collections
│       │   ├── features/            # Vertical slices (records/, documents/, assets/, search/)
│       │   ├── routes/              # TanStack Router file-based SPA routes
│       │   ├── stores/              # Zustand client-only UI stores
│       │   └── main.tsx
│       ├── .env.local               # VITE_CONVEX_URL (gitignored)
│       ├── .env.example
│       ├── postcss.config.cjs       # Harvested from mantinedev/vite-template
│       ├── vite.config.ts           # App Vite+ config (tanstackRouter + react + cached build)
│       └── package.json
├── packages/
│   ├── backend/                     # Convex workspace (@repo/backend)
│   │   ├── convex/
│   │   │   ├── lib/                 # convex-helpers customQuery/Mutation, triggers, rag, workpool
│   │   │   ├── convex.config.ts     # Registers @convex-dev/rag + @convex-dev/workpool
│   │   │   ├── schema.ts            # records, documents, assets (with clientId + searchIndex)
│   │   │   ├── records.ts
│   │   │   ├── documents.ts
│   │   │   ├── assets.ts
│   │   │   └── search.ts            # Keyword + RAG semantic search actions
│   │   ├── convex.json
│   │   └── package.json
│   ├── ui/                          # Mantine v9 Design System (@repo/ui)
│   │   ├── src/
│   │   │   ├── styles/              # tokens.css, semantic.css (ALL semantic CSS vars live here)
│   │   │   ├── theme/               # theme.ts (createTheme + defaultProps), cssVariablesResolver.ts
│   │   │   ├── primitives/          # Layout, Surface, DataList, Dropzone, Lightbox, MarkdownPane
│   │   │   └── index.ts
│   │   └── package.json
│   ├── domain/                      # Pure TS + Zod schemas, frontmatter parser (@repo/domain)
│   └── logger/                      # Harvested from cove-monorepo (@repo/logger)
├── tools/
│   └── tsconfig/                    # Harvested from cove-monorepo (@repo/tsconfig)
├── docs/
│   ├── storage-and-auth-options.md
│   └── markdown-editor-options.md
├── .agents/
│   ├── skills/                      # Convex AI skills, component SKILL.md files, TanStack Intent
│   └── workflow.md
├── AGENTS.md
├── PLAN.md
├── pnpm-workspace.yaml
├── vite.config.ts                   # Root Vite+ config (Oxlint, Oxfmt, Rust Vite Task cache)
└── package.json
`​`​`

---

## Phase 0 — Harvest Reference Repos & Scaffolds (`_refs/`)

Do NOT hand-write boilerplate that CLIs already generate. Pull reference repos into `_refs/` (add `_refs/` to `.gitignore` immediately):

`​`​`bash
mkdir -p _refs

# 1. Monorepo base structure + Vite+ workspace + tools/tsconfig + packages/logger
git clone --depth 1 [https://github.com/mugnavo/cove-monorepo](https://github.com/mugnavo/cove-monorepo) _refs/cove-monorepo

# 2. Mantine v9.8+ Vite+ template (postcss, oxc-config-mantine, test-utils, Vite+ config)
git clone --depth 1 [https://github.com/mantinedev/vite-template](https://github.com/mantinedev/vite-template) _refs/mantine-vp

# 3. Pure TanStack Router SPA (NO TanStack Start) + Query + Intent skills
pnpm dlx @tanstack/cli create _refs/tanstack-spa --router-only --package-manager pnpm

# 4. Minimal Convex starter reference
pnpm create convex@latest _refs/convex-ref -- -t bare
`​`​`

**Audit Checklist before moving to Phase 1:**
- Inspect `_refs/cove-monorepo/pnpm-workspace.yaml`, root `vite.config.ts`, `apps/web/vite.config.ts`, `tools/tsconfig/`, `packages/logger/`, and `.agents/workflow.md`.
- Inspect `_refs/mantine-vp/vite.config.mjs`, `postcss.config.cjs`, and `package.json` for exact `@mantine/*` v9 versions and `oxc-config-mantine`.
- Inspect `_refs/tanstack-spa/vite.config.ts` and `src/routes/__root.tsx` for pure SPA router plugin options (`target: 'react'`, `autoCodeSplitting: true`).

---

## Phase 1 — Assemble Monorepo Base, Lock `pnpm` & Rust Caching

1. **Copy monorepo skeleton** from `_refs/cove-monorepo` into repo root:
   - Keep: `pnpm-workspace.yaml`, `tools/tsconfig/`, `packages/logger/`, `.agents/workflow.md`, root `vite.config.ts`, root `package.json` structure.
   - Delete / Do NOT copy: `packages/auth`, `packages/db`, `packages/ui` (shadcn/Tailwind), Nitro config, Drizzle config, TanStack Start deps, Tailwind deps.
2. **Lock `pnpm` and Vite+ overrides** in `pnpm-workspace.yaml`:
   `​`​`yaml
   packages:
     - "apps/*"
     - "packages/*"
     - "tools/*"

   overrides:
     vite: npm:@voidzero-dev/vite-plus-core@latest
     vitest: npm:@voidzero-dev/vite-plus-test@latest
   `​`​`
   Set `"packageManager": "pnpm@10.x"` (match local `pnpm -v`) in root `package.json`.
3. **Configure Root `vite.config.ts` for maximum Rust-based caching:**
   - Enable `run.cache.tasks: true` and `run.cache.scripts: true`.
   - Configure Oxlint (merging `oxc-config-mantine` rules harvested from `_refs/mantine-vp`) and Oxfmt (`proseWrap: 'preserve'` so `AGENTS.md`/`PLAN.md` stay clean).
   - Ignore `**/routeTree.gen.ts`, `packages/backend/convex/_generated/**`, `dist/**`, `_refs/**` in lint/fmt.
   - Define cached tasks in `run.tasks`:
     - `check`: `vp check` (cached)
     - `lint`: `vp lint` (cached)
     - `fmt:check`: `vp fmt --check` (cached)
     - `test`: `vp test` (single-run, cached)
     - `convex:typecheck`: `pnpm --filter @repo/backend exec convex typecheck` (cached with `input: [{ auto: true }, '!packages/backend/convex/_generated/**']`)
     - `build`: `vp run -r build` (cached; in `apps/web/vite.config.ts` whitelist `env: ['NODE_ENV', 'VITE_CONVEX_URL']`, `untrackedEnv: ['CI']`, `output: ['dist/**']`)
     - Non-cached long-running tasks (`cache: false`): `dev`, `convex:dev`, `test:watch`.
4. **Root Dev Orchestration:**
   - Wire `dev` script to run `@repo/backend` (`convex dev`) and `@repo/web` (`vp dev`) concurrently via `vp run --recursive --parallel dev`.

**Gate 1:** `pnpm install` succeeds cleanly; `pnpm exec vp run check` succeeds and hits Rust cache on immediate second run.

---

## Phase 2 — Build `packages/ui` (Mantine v9 + Semantic CSS Variables) & `packages/domain`

### 2A. `packages/ui` (`@repo/ui`)
1. Install Mantine v9 packages (`@mantine/core`, `@mantine/hooks`, `@mantine/notifications`, `@mantine/dropzone`, `@mantine/lightbox`, `lucide-react` or `@tabler/icons-react`). Copy `postcss.config.cjs` from `_refs/mantine-vp` into `apps/web/`.
2. Create **`packages/ui/src/styles/`**:
   - `tokens.css`: Primitive scale tokens (spacing scale, radii, typography sizes, z-index layers, transition durations).
   - `semantic.css`: Semantic CSS custom properties mapped cleanly for light and `[data-mantine-color-scheme="dark"]`:
     - Surfaces: `--surface-canvas`, `--surface-panel`, `--surface-elevated`, `--surface-interactive`, `--surface-interactive-hover`
     - Borders: `--border-subtle`, `--border-default`, `--border-strong`, `--border-focus`
     - Text: `--text-primary`, `--text-secondary`, `--text-muted`, `--text-inverse`
     - Status/Accent: `--accent-primary`, `--accent-subtle`, `--status-success`, `--status-warning`, `--status-danger`
     - Layout/Spacing: `--space-xs`, `--space-sm`, `--space-md`, `--space-lg`, `--space-xl`, `--radius-sm`, `--radius-md`, `--radius-lg`
3. Create **`packages/ui/src/theme/theme.ts`** using `createTheme`:
   - Set typography, color palettes, `primaryColor`, `defaultRadius`.
   - Define **`components.<Name>.defaultProps`** and **`classNames`** for every Mantine component used across the app (`AppShell`, `Button`, `ActionIcon`, `Card`, `Paper`, `TextInput`, `Textarea`, `Select`, `Table`, `Modal`, `Badge`, `NavLink`, `Tabs`, `Stack`, `Group`, `Title`, `Text`, `Dropzone`, etc.) so `apps/web` JSX requires **zero styling props**.
4. Create **`packages/ui/src/theme/cssVariablesResolver.ts`** exporting a typed `CSSVariablesResolver` for Mantine's `MantineProvider`.
5. Export clean, dumb presentational primitives from `packages/ui/src/primitives/`:
   - `AppFrame` (sidebar + header + workspace pane using `AppFrame.module.css` + semantic vars)
   - `RecordTable` / `RecordDetailCard`
   - `AssetDropzone` / `AssetGallery` (wrapping `@mantine/dropzone` + `@mantine/lightbox`)
   - `MarkdownWorkspace` (split editor + rendered preview behind a clean `EditorProps` interface so BlockNote can replace it later with zero changes to `apps/web`)
   - `SemanticSearchBar`

### 2B. `packages/domain` (`@repo/domain`)
1. Install `zod`.
2. Define shared schemas & types:
   - `RecordSchema` (`clientId`, `title`, `category`, `status`, `tags`, `attributes`, `updatedAt`)
   - `DocumentSchema` (`clientId`, `title`, `slug`, `markdown`, `frontmatter`, `tags`, `storageId?`, `ragStatus`, `updatedAt`)
   - `AssetSchema` (`clientId`, `filename`, `mimeType`, `sizeBytes`, `width?`, `height?`, `storageId`, `linkedEntityType?`, `linkedEntityId?`)
3. Pure utility functions:
   - `parseMarkdownFrontmatter(raw: string)` → `{ frontmatter, body, title }`
   - `chunkMarkdownByHeadings(markdown: string)` → clean heading-aware chunks (fallback/complement to `@convex-dev/rag`'s `defaultChunker`)
   - `createClientId()` → stable UUID/ULID generator for TanStack DB optimistic inserts.

**Gate 2:** `packages/ui` has zero imports from `convex`, `@tanstack/*`, or `zustand`; `packages/domain` has zero React/Mantine imports; `pnpm exec vp run check` passes.

---

## Phase 3 — Build `packages/backend` (Convex + RAG + Workpool + Agent Skills)

1. Scaffold `packages/backend` using structure harvested from `_refs/convex-ref`.
2. Install dependencies inside `@repo/backend`:
   `​`​`bash
   pnpm --filter @repo/backend add convex convex-helpers @convex-dev/rag @convex-dev/workpool ai @ai-sdk/openai
   `​`​`
   *(Embedding provider in `convex/lib/rag.ts` is isolated in one factory function so you can switch between OpenAI / DeepSeek / OpenRouter / Gemini AI SDK embedding models via env var without touching calling code.)*
3. **Install AI Agent Files & Component Skills:**
   `​`​`bash
   # Official Convex AI guidelines & skills
   pnpm --filter @repo/backend dlx convex ai-files install

   # Fetch component SKILL.md files into .agents/skills/
   mkdir -p .agents/skills/convex-dev-rag .agents/skills/convex-dev-workpool
   curl -fsSL [https://www.convex.dev/components/rag/SKILL.md](https://www.convex.dev/components/rag/SKILL.md) -o .agents/skills/convex-dev-rag/SKILL.md
   curl -fsSL [https://www.convex.dev/components/workpool/SKILL.md](https://www.convex.dev/components/workpool/SKILL.md) -o .agents/skills/convex-dev-workpool/SKILL.md
   `​`​`
4. **Configure `packages/backend/convex/convex.config.ts`:**
   `​`​`ts
   import { defineApp } from "convex/server";
   import rag from "@convex-dev/rag/convex.config.js";
   import workpool from "@convex-dev/workpool/convex.config.js";

   const app = defineApp();
   app.use(rag);
   app.use(workpool, { name: "ragIndexPool" });
   export default app;
   `​`​`
5. **Configure `packages/backend/convex/lib/`:**
   - `functions.ts`: Wrap `query`/`mutation`/`action` via `convex-helpers` (`customQuery`, `customMutation`) — currently pass-through for fastest single-user v1, single drop-in choke point for adding auth later (see `docs/storage-and-auth-options.md`).
   - `workpool.ts`: Instantiate `ragIndexPool` with `maxParallelism: 5` (well inside free-tier limit of 20), `retryActionsByDefault: true`, `defaultRetryBehavior: { maxAttempts: 3, initialBackoffMs: 1000, base: 2 }`.
   - `rag.ts`: Instantiate `new RAG(components.rag, { textEmbeddingModel, embeddingDimension, filterNames: ["docId", "tag", "kind"] })`.
6. **Define `packages/backend/convex/schema.ts`:**
   - `records`: `clientId`, `title`, `category`, `status`, `tags`, `attributes`, `updatedAt` + indexes `by_clientId`, `by_status_updatedAt`, `searchIndex("search_records", ...)`.
   - `documents`: `clientId`, `title`, `slug`, `markdown` (inline for `< 500 KB`), `storageId` (optional overflow blob for `>= 500 KB`), `frontmatter`, `tags`, `ragStatus` (`"pending" | "indexed" | "failed"`), `ragEntryKey`, `updatedAt` + indexes `by_clientId`, `by_slug`, `searchIndex("search_documents", ...)`.
   - `assets`: `clientId`, `filename`, `mimeType`, `sizeBytes`, `width`, `height`, `storageId` (`v.id("_storage")`), `linkedEntityType`, `linkedEntityId`, `createdAt` + indexes `by_clientId`, `by_linked`.
7. **Implement Backend Modules:**
   - `records.ts`: List query (TanStack DB compatible), getById, upsert/insert (accepting `clientId`), update, remove.
   - `documents.ts`: List, getBySlug, create/update (accepting `clientId`), import `.md` file; on create/update mutation, set `ragStatus: "pending"` and enqueue `internal.search.indexDocument` into `ragIndexPool` with `onComplete` callback updating `ragStatus` to `"indexed"` or `"failed"`. On delete, remove RAG entry and delete linked overflow storage file if present.
   - `assets.ts`: Native Convex File Storage flow (`generateUploadUrl` → `finalizeUpload` saving metadata + returning resolved `ctx.storage.getUrl(storageId)` → `listAssets` → `removeAsset` deleting both metadata row and `ctx.storage.delete(storageId)`).
   - `search.ts`:
     - `indexDocument` (`internalAction`): reads document (from inline field or storage blob), chunks via heading-aware Markdown chunker or `defaultChunker`, calls `rag.add(ctx, { namespace: "workspace", key: doc._id, title: doc.title, chunks, filterValues })` (graceful replacement by key!).
     - `semanticSearch` (`action`): calls `rag.search(ctx, { namespace: "workspace", query, limit, chunkContext: { before: 1, after: 1 }, filters })` and returns ranked chunks + matched document metadata.
     - `keywordSearch` (`query`): fast native Convex `searchIndex` query across `records` and `documents`.

**Gate 3:** `pnpm exec vp run convex:typecheck` passes with zero errors; `packages/backend/package.json` cleanly exports `./_generated/api` and `./_generated/dataModel` for `@repo/web`.

---

## Phase 4 — Wire `apps/web` (TanStack Router SPA + Query + TanStack DB `@rc` + Zustand)

1. **Install frontend dependencies inside `@repo/web`:**
   `​`​`bash
   pnpm --filter @repo/web add react react-dom @tanstack/react-router @tanstack/react-query @tanstack/db@rc @tanstack/react-db@rc @tanstack/convex-db-collection@rc @convex-dev/react-query convex zustand
   pnpm --filter @repo/web add -D @tanstack/router-plugin @tanstack/intent
   `​`​`
   Run TanStack Intent sync if configured so `.agents/skills/` stays synced with installed TanStack versions.
2. **Configure `apps/web/vite.config.ts`:**
   - Harvest `@tanstack/router-plugin` config from `_refs/tanstack-spa` (registered **before** `@vitejs/plugin-react`, `target: 'react'`, `autoCodeSplitting: true`).
   - Add Vite Task `build` config with `env: ['NODE_ENV', 'VITE_CONVEX_URL']`.
3. **Wire Data Clients (`apps/web/src/data/`):**
   - `clients.ts`: Singletons for `convexClient = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL)`, `convexQueryClient = new ConvexQueryClient(convexClient)`, and `queryClient = new QueryClient(...)` bound to `convexQueryClient.hashFn()` and `convexQueryClient.queryFn()`.
   - `collections.ts`: Stable TanStack DB collections via `convexCollectionOptions` (`recordsCollection`, `documentsCollection`, `assetsCollection`) keyed on `clientId` with optimistic `onInsert` / `onUpdate` / `onDelete` handlers calling Convex mutations.
4. **Mount Provider Tree (`apps/web/src/app/Providers.tsx`):**
   - Import `@mantine/core/styles.css`, `@mantine/notifications/styles.css`, `@mantine/dropzone/styles.css`, `@mantine/lightbox/styles.css`, and `@repo/ui/styles` (`tokens.css` + `semantic.css`) ONCE at entry.
   - Nest: `MantineProvider` (`theme` + `cssVariablesResolver`) → `ConvexProvider` → `QueryClientProvider` → `Notifications` → `RouterProvider` (`context: { queryClient }`, `defaultPreload: 'intent'`).
5. **Create Zustand UI Stores (`apps/web/src/stores/`):**
   - `useWorkspaceUiStore.ts`: `sidebarOpen`, `inspectorOpen`, `selectedRecordIds`, `markdownViewMode` (`"edit" | "split" | "preview"`), `activeLightboxIndex`, `uploadQueue`. (Zero server entities stored here.)
6. **Implement Vertical Feature Slices (`apps/web/src/features/` + `src/routes/`):**
   - `/records`: Live TanStack DB table with instant local filtering/sorting, optimistic inline create/edit/delete, and detail route preloaded via `queryClient.ensureQueryData(convexQuery(...))`.
   - `/documents` & `/documents/$slug`: Markdown library backed by TanStack DB collection, `.md` drag-and-drop import (frontmatter extracted via `@repo/domain`), live `ragStatus` badge (`pending` / `indexed` / `failed`), split Markdown editor/preview via `@repo/ui`'s `MarkdownWorkspace`, and unified Keyword + Semantic RAG search bar.
   - `/assets`: Drag-and-drop image upload (`AssetDropzone` → Convex 3-step upload → progress tracked in Zustand upload queue), responsive image grid, fullscreen viewer (`@mantine/lightbox`), and copy-Markdown-image-link action (`![filename](url)`).

---

## Phase 5 — Full Verification & Cleanup

1. Audit `apps/web/src/**` to confirm **zero banned Mantine styling props** in JSX and **zero raw hex/px values** in `*.module.css`.
2. Run full verification pipeline:
   `​`​`bash
   pnpm exec vp run convex:typecheck
   pnpm exec vp run check
   pnpm exec vp run test
   pnpm exec vp run build
   # Immediately re-run to confirm Rust Vite Task cache HITs:
   pnpm exec vp run check
   pnpm exec vp run build
   `​`​`
3. Smoke test in browser (2 side-by-side tabs):
   - Create/edit a record in Tab A → instant optimistic render + real-time sync in Tab B.
   - Upload or create a Markdown doc → verify Workpool runs `indexDocument`, `ragStatus` flips `pending → indexed`, and semantic search returns relevant chunks.
   - Upload an image → preview in Lightbox → delete image → verify both metadata row and Convex storage blob are deleted.
4. Remove `_refs/`: `rm -rf _refs`.
`​`​`

---

### File 3: `docs/storage-and-auth-options.md`

`​`​`markdown
# Storage & Auth Options (v1 Defaults vs. Upgrade Paths)

v1 starts with the **fastest zero-external-account options** while isolating both behind thin adapters in `packages/backend/convex/` so upgrades require minimal refactoring.

---

## 1. File & Image Storage

### Current v1 Default: Native Convex File Storage
- **Why v1:** Zero extra cloud accounts, zero CORS/bucket setup, built-in `ctx.storage.generateUploadUrl()`, `getUrl()`, and `delete()`.
- **Free-tier ceiling to watch:** 1 GB storage + 1 GB/month file bandwidth (and storage URL lookups count toward function calls).
- **Isolation boundary:** All upload URL generation, URL resolution, and deletion go through `packages/backend/convex/assets.ts` and the `assets` metadata table (`storageId`, `storageProvider: "convex"`).

### Upgrade Path A: Cloudflare R2 (`@convex-dev/r2`) — Recommended for Image-Heavy Apps
- **When to switch:** As soon as image bandwidth approaches 1 GB/month or you want zero-egress CDN caching via a custom domain.
- **Setup:**
  1. `pnpm --filter @repo/backend add @convex-dev/r2`
  2. Register in `packages/backend/convex/convex.config.ts`:
     `​`​`ts
     import r2 from "@convex-dev/r2/convex.config.js";
     app.use(r2);
     `​`​`
  3. Set R2 env vars (`R2_TOKEN`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`, `R2_BUCKET`) in Convex dashboard.
  4. Swap `assets.ts` to use `r2.clientApi()` + `useUploadFile` on the client; add `r2Key` alongside `storageId` in `assets` schema.
- **Tip:** Attach a Cloudflare custom domain to the R2 bucket for permanent CDN-cached image URLs instead of short-lived presigned URLs.

### Upgrade Path B: Hybrid + Access Control + Orphan Cleanup (`@gilhrpenner/convex-files-control`)
- **When to switch:** You want **both** Convex Storage and R2 behind one unified API, expiring download grants, access-key gating, and automatic scheduled cleanup of abandoned uploads.

### Upgrade Path C: Path-Based Virtual Filesystem (`convex-fs`)
- **When to switch:** You want hierarchical folders/paths, atomic moves/renames, content-hash blob deduplication, soft deletes, and optional Bunny CDN on-the-fly image resizing.

---

## 2. Authentication

### Current v1 Default: Single-User / No Auth (Middleware-Ready)
- **Why v1:** Fastest iteration on Records, Markdown, Images, and RAG without login walls.
- **Isolation boundary:** Every Convex function in `packages/backend/convex/` MUST use `appQuery` / `appMutation` / `appAction` from `convex/lib/functions.ts` (`convex-helpers` `customQuery`/`customMutation`).
- **Migration rule:** When enabling auth later, enforce `ctx.auth.getUserIdentity()` inside `convex/lib/functions.ts` once and pass `userId` via `ctx` — zero boilerplate duplication across functions. Also pass `namespace: userId` into `@convex-dev/rag`.

### Upgrade Path A: `@convex-dev/better-auth` (Recommended for Multi-User)
- **Best fit:** Strong alignment with TanStack Router/Query and modern TypeScript apps; supports email/password, OAuth, organizations, and sessions inside Convex.
- **Migration:** Install `@convex-dev/better-auth` + `better-auth`, register in `convex.config.ts`, swap `<ConvexProvider>` for Better Auth's Convex provider in `apps/web/src/app/Providers.tsx`, and populate `ctx.user` in `convex/lib/functions.ts`.

### Upgrade Path B: `@convex-dev/auth` (Lightweight Native)
- **Best fit:** Minimal dependencies, built directly on Convex tables with OAuth/magic links/passwords and zero third-party auth SaaS.

### Upgrade Path C: Clerk (`@clerk/clerk-react` + `ConvexProviderWithClerk`)
- **Best fit:** Managed enterprise auth UI, organizations, and zero auth maintenance (free tier up to 10k MAU).
`​`​`

---

### File 4: `docs/markdown-editor-options.md`

`​`​`markdown
# Markdown Editor Options (v1 Speed vs. BlockNote & Collaborative Sync)

The editor is isolated behind a single presentational boundary in `packages/ui/src/primitives/MarkdownWorkspace` accepting `{ value, onChange, onUploadImage, mode }` so switching editors never affects `apps/web` routes, TanStack DB collections, or Convex RAG indexing.

---

## 1. Current v1 Default: Split Raw Markdown + Preview (Quickest)
- **Why v1:**
  - Zero peer-dependency friction with React 19 + Mantine v9.8+.
  - Source of truth is pure `.md` text — instant compatibility with `.md` file import/export, frontmatter parsing (`@repo/domain`), and `@convex-dev/rag` chunking.
  - Lightweight bundle and trivial styling via `packages/ui/src/styles/semantic.css`.
- **Recommended packages:** Plain Mantine `Textarea` (configured via `createTheme` `defaultProps`) + `react-markdown` + `remark-gfm` (rendered inside a styled semantic prose container in `@repo/ui`).

---

## 2. Primary Target Upgrade: BlockNote (`@blocknote/mantine`) + Optional `@convex-dev/prosemirror-sync`
- **Why BlockNote:** Notion-style block editor with slash commands (`/`), drag-and-drop blocks, built-in Mantine UI adapter (`@blocknote/mantine`), native Markdown import/export (`editor.blocksToMarkdownLossy()` / `editor.tryParseMarkdownToBlocks()`), and first-class Convex real-time sync (`useBlockNoteSync` from `@convex-dev/prosemirror-sync/blocknote`).
- **Mantine v9 Compatibility Check (Run Before Swapping):**
  1. Test installing `@blocknote/core @blocknote/react @blocknote/mantine` inside `packages/ui` with `pnpm --filter @repo/ui add ...`.
  2. Verify peer dependency resolution against `@mantine/core@^9.8.0` and `react@^19`. If `@blocknote/mantine` still pins `@mantine/core@^7 || ^8` in `peerDependencies`, either add a scoped `peerDependencyRules` entry in root `package.json` and visually test slash menus/toolbars, OR use `@blocknote/shadcn` / headless `@blocknote/react` styled with `packages/ui/src/styles/semantic.css`.
  3. Import `@blocknote/mantine/style.css` ONLY inside `packages/ui` and override `--bn-colors-*` CSS variables to point to your semantic tokens from `packages/ui/src/styles/semantic.css` (keeps strict zero-hardcoded-color compliance).
- **Wiring Real-Time Sync + RAG Together:**
  1. Register `@convex-dev/prosemirror-sync` in `packages/backend/convex/convex.config.ts`.
  2. Keep `documents.markdown` as a debounced Markdown snapshot exported from BlockNote (or generated in `onSnapshot` callback on the backend).
  3. Trigger `ragIndexPool.enqueue(ctx, internal.search.indexDocument, { docId })` on snapshot save (debounced so RAG isn't re-embedding on every keystroke).
- **Image Uploads in BlockNote:** Pass `uploadFile` option on `useCreateBlockNote` calling the existing Convex `generateUploadUrl` → `POST` → `finalizeUpload` flow from `assets.ts`.
- **Licensing note:** Core `@blocknote/core`, `@blocknote/react`, `@blocknote/mantine` are MPL-2.0; avoid `@blocknote/xl-*` packages unless GPL-3.0 or a commercial license fits your project.

---

## 3. Alternative Upgrade: `@mantine/tiptap` (Native Mantine v9)
- **When to choose instead of BlockNote:** If `@blocknote/mantine` hits any Mantine v9 peer/styling friction and you want guaranteed first-party Mantine v9 parity.
- **Highlights:** Built on Tiptap v3, automatically inherits `createTheme` + `cssVariablesResolver`, supports `@convex-dev/prosemirror-sync/tiptap` (`useTiptapSync`), and ships built-in `ImageUpload` and table controls.
`​`​`

---

### How to Hand This to Antigravity

Save those 4 files at the root (`AGENTS.md`, `PLAN.md`, `docs/storage-and-auth-options.md`, `docs/markdown-editor-options.md`) and give Antigravity this single opening prompt:

> Read `AGENTS.md` and `PLAN.md` completely before running any command. Execute `PLAN.md` one phase at a time, stopping only if a verification gate fails or requires a Convex account login (`convex dev` initial setup). Follow every rule in `AGENTS.md` strictly — especially `pnpm`-only commands, Vite+ Rust task caching, monorepo dependency boundaries, and zero Mantine styling props in JSX.

If you want me to also draft the starter `packages/ui/src/styles/semantic.css` + `packages/ui/src/theme/theme.ts` skeleton or add a `docs/rag-and-workpool.md` chunking spec before you kick off Antigravity, just say the word.

Powered by Gemini Exporter (https://www.ai-chat-exporter.com)
