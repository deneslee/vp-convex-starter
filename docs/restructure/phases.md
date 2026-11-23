# Phases

This file owns the phase order and the status of each step. The current phase and the next action are on the [start page](README.md); how to run a step is in [workflow.md](workflow.md).

**Status:** P0–P5 come from the old plan ([../ecc/work/04-plan.md](../ecc/work/04-plan.md)). P6–P8 are a proposal and are not yet approved.

- Steps are written only when their phase is next. Each step gets a small spec in [specs/](specs/README.md) with focused research, a scope, a verification and a rollback, sized to its risk.
- The "Candidate scope" column lists known gaps (G-rows in [research/current-state.md](research/current-state.md) §B). It is not a commitment.

**Order.** P2A, P2B and P3 can run in parallel after P1; P4 needs all three. P6 (restructure) moves code without changing behaviour; auth (P7) and live editing (P8) change behaviour and come after it.

| #   | Phase                                  | Goal                                                                         | Needs decisions  | Candidate scope            | Status          |
| --- | -------------------------------------- | ---------------------------------------------------------------------------- | ---------------- | -------------------------- | --------------- |
| P0  | Reference harvest (`_refs/`)           | Take what is useful from five reference repos                                | —                | —                          | done            |
| P1  | Monorepo and toolchain                 | Root configs, `tools/tsconfig`, hooks, env schema; `vpr check` hits cache twice | —             | —                          | done            |
| P2A | `packages/domain`                      | Zod v4 schemas, frontmatter and chunk helpers, `createClientId()`            | —                | —                          | done            |
| P2B | `packages/ui`                          | Theme, semantic tokens, dumb primitives                                      | D-02             | —                          | **in progress** |
| P3  | `packages/backend` (Convex)            | Schema, records, documents, assets, search, RAG with a Workpool              | D-02             | G-004 (wrappers only)      | not started     |
| P4  | `apps/web` SPA                         | Routes, data layer, feature slices, stores                                   | —                | G-002                      | not started     |
| P5  | Verification and cleanup               | Full pipeline twice with cache hits, 2-tab smoke test, `_refs/` removed       | D-06             | G-001, G-006, G-007, G-008 | not started     |
| P6  | Restructure feature slices             | Every slice in `apps/web` is `ui/` + `hooks/` + `data/` (AGENTS.md §0); same behaviour, same tests | D-03, D-04, D-05, D-09 | G-002, G-003, G-005, G-010 | not started |
| P7  | Auth                                   | Several users; identity checked once in the Convex wrappers                  | D-01             | G-004                      | not started     |
| P8  | Live collaborative editing             | Two tabs edit one document at the same time                                  | D-07             | G-009                      | not started     |

Verification gates per phase are in the old phase specs under [../ecc/work/04-plan/](../ecc/work/04-plan.md); each step's spec copies the commands it needs.

**Deferred, with reasons:**

- **D-08** (external file storage): wait until file bandwidth nears the free-tier limit.

## P3 unverified items

Each item gets a yes or no before or during P3. A "no" reopens the matching research file.

- `convex-test` on the edge runtime covers the `@convex-dev/rag` and `@convex-dev/workpool` components;
- `@convex-dev/rag` accepts a `namespace` per user without a schema change (needed by P7);
- the TanStack DB Convex collection keeps `.take(n)` bounds when it re-subscribes;
- the second `vpr check` still hits the cache after a `docs/**` change.

## Steps

Steps are added here once a phase starts, one row per independently reviewable change.

| Step  | Title                          | Spec                                                       | Status                                       |
| ----- | ------------------------------ | ---------------------------------------------------------- | -------------------------------------------- |
| P2B-1 | Tokens and semantic CSS        | — (done before this system)                                | done                                         |
| P2B-2 | Theme and CSS-variables resolver | — (done before this system)                              | done                                         |
| P2B-3 | AppFrame and RecordTable       | [P2B-3-appframe-recordtable.md](specs/P2B-3-appframe-recordtable.md) | in progress                        |
| P2B-4 | AssetDropzone and AssetGallery | —                                                          | not started                                  |
| P2B-5 | MarkdownWorkspace (BlockNote)  | —                                                          | blocked: waiting on your BlockNote API check |
