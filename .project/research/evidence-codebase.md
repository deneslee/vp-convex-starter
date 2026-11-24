# Evidence — codebase

Repo root: C:\Users\leede\Documents\Projects\CDSS\TEMP\vp-convex-starter-gsd-showcase
Scanned: 2026-11-23
Audited HEAD: dedc5306d60f8d7218c899e18a316fd4ee14dd4c
Checks run: `git status --short` → clean before inspection. `git rev-parse HEAD` → recorded baseline. `git log -8 --format='%h %s'` → three commits. `git ls-files apps packages tests tools .github` → source and test inventory with no tracked GitHub workflows. `git ls-files '_refs/*'` → zero files. `git check-ignore apps/web/src/routeTree.gen.ts apps/web/env.d.ts packages/backend/convex/_generated/api.js` → all three ignored. `Test-Path node_modules` → False. Static source, manifest and lockfile inspection only. Runtime verification is unverified.

## Map

- **Stack**: TypeScript 7.0.2, Vite+ 1.7.0, React 19.3.1, Mantine 9.8.2, TanStack Router 1.170.46, Convex 1.51.0 and Zod 4.6.7. The root pins pnpm 12.21.0 and declares Node ^24.11.0 or >=26.0.0. The workspace catalog and lockfile capture app and package dependencies (`pnpm-workspace.yaml:13–86`, `pnpm-lock.yaml:174–636`, `package.json:35–38`).
- **Entry points**: `apps/web/index.html:10` loads `apps/web/src/main.tsx:10`, which mounts `Providers`. `apps/web/src/router.tsx:5` builds the TanStack Router and `apps/web/src/routes` contains file routes for records, documents and assets. `packages/backend/package.json:10–11` declares Convex dev entry, with schema, functions and component registration under `packages/backend/convex`.
- **Architecture**: The web app composes provider setup, file routes, feature hooks and UI components. TanStack DB collections subscribe to Convex lists and implement write hooks where configured (`apps/web/src/data/collections.ts:7–127`). Document detail loads the full body via TanStack Query while the reactive list uses summary rows (`apps/web/src/features/documents/useDocumentEditor.ts:11`, `apps/web/src/data/collections.ts:64–68`). Shared schemas and IDs live in `packages/domain/src` and presentational primitives and theming live in `packages/ui/src`.
- **Conventions**: Route files use `index.tsx` and dollar-prefixed parameter names, feature hooks use `use…`, and module styles sit beside pages and primitives. Public Convex functions use object-form wrappers (`packages/backend/convex/lib/functions.ts:9–21`). The semantic search client catches action failures and displays a Mantine notification (`apps/web/src/features/search/useWorkspaceSearch.ts:30–50`). Tests use colocated `*.test.ts(x)` plus a separate tier harness. Recent commit prefixes are `feat:` and `docs:`.
- **Maturity**: The source includes CRUD slices, a Markdown editor, asset storage and keyword/semantic search. The root Vitest config declares domain (Node), backend (edge runtime), UI and web (jsdom) projects (`vite.config.ts:156–185`). Backend tests cover record CRUD, document summary/detail payloads and asset row/blob removal (`packages/backend/convex/backend.test.ts:9–66`). Search behavior, build, and browser execution were unverified.
- **Recent activity**: The complete three-commit history starts with `898e983` (initial implementation), followed by `ca83fe2` (planning layout) and `dedc530` (GSD Path scope and Convex AI file settings). The application/package path history shows only the initial implementation (`git log -3 --oneline -- apps packages docs package.json`).

## Finding: A fresh checkout leaves generated entry dependencies absent

- **Claim**: The router and backend import time require generated files that are ignored and absent from this baseline's tracked files. Root prepare runs Vite+ config and environment codegen.
- **Source**: `apps/web/src/router.tsx:1–5`, `packages/backend/package.json:6–8`, `packages/backend/convex/lib/functions.ts:2`, `package.json:8–10`, the recorded `git check-ignore` result and tracked-file inventory.
- **Confidence**: high
- **Why it matters here**: Checkout-based verification needs to account for the route tree, web environment types and Convex generation before treating a failure as a product regression.

## Finding: The default unit test task leaves the tier harness out

- **Claim**: The root test task invokes the four configured Vitest projects. The separate harness accepts tiers 1 through 4, and only Tier 1 test files are tracked.
- **Source**: `vite.config.ts:35`, `vite.config.ts:156–185`, `tests/e2e/run.ts:14–24`, `tests/e2e/run.ts:89–92`, and tracked test inventory.
- **Confidence**: high
- **Why it matters here**: A passing root test command alone would leave tier checks and browser behavior unverified.

## Finding: A Tier 1 preservation test expects a local reference fixture

- **Claim**: The preservation suite requires five reference directories under `_refs/`; the path is ignored and contributes zero tracked files.
- **Source**: `tests/e2e/tier1/t1-f14-preservation.test.ts:29–46`, `.gitignore:36`, `git ls-files '_refs/*'`.
- **Confidence**: high
- **Why it matters here**: A clean checkout cannot supply those preservation fixtures from Git, so they require explicit provisioning for any matching acceptance test.

## Finding: The shared Convex wrappers leave identity enforcement open

- **Claim**: Each shared public query, mutation and action wrapper passes arguments through without an identity lookup.
- **Source**: `packages/backend/convex/lib/functions.ts:5–21`.
- **Confidence**: high
- **Why it matters here**: Any intended multi-user or hosted scope needs an explicit ownership and access model. A shared wrapper existing in the baseline does not establish one.

## Finding: Keyword and semantic search have different runtime requirements

- **Claim**: Keyword search invokes a Convex query. Semantic search calls an action whose RAG helper requires a deployment OPENAI_API_KEY even though app configuration permits that key to be absent.
- **Source**: `apps/web/src/features/search/useWorkspaceSearch.ts:17–49`, `packages/backend/convex/searchActions.ts:65`, `packages/backend/convex/lib/rag.ts:17–26`, `packages/backend/convex/convex.config.ts:8`.
- **Confidence**: high
- **Why it matters here**: Verifying keyword search or booting the app with a Convex URL does not establish that the optional embedding-backed path works.

## Apparent intent

- Inference — the baseline appears to be a reusable Convex-backed SPA starter that demonstrates distinct data ownership patterns across records, Markdown documents, assets and search. Evidence is the dependency catalog, the route inventory and the list/detail separation in the web and backend code.

## Open questions for define

- Which starter behaviors should the first milestone preserve through end-to-end verification?
- Should the resulting starter target a trusted single-user environment or require identity and per-user data access?
- Are semantic search and the ignored Tier 1 reference fixtures required to reproduce milestone acceptance in a clean checkout?

## Blocked areas

- Build, lint, test execution and browser behavior — the clean sidecar has no installed dependencies or checked-in generated inputs. Static checks support source and integration shape only.
- Live Convex and semantic embedding behavior — no live deployment or provider credentials were consulted.
