# Architecture audit (agent review)

Reviewer: Claude (Claude Code session), 2026-11-23, commit `898e983`. Read-only: no install, no build, no tests were run. This is an agent's opinion. Nothing here is a decision; see [../restructure/decisions.md](../restructure/decisions.md).

## Summary

The four packages follow the shape that `AGENTS.md` §5 describes, and the backend already bounds every list query. The main risk is in `apps/web`: data access is spread over pages, hooks and the shared `data/` folder, so the split that `AGENTS.md` §0 asks for (UI, logic, data apart) does not hold yet. Nothing in lint stops it from getting worse.

## Findings

| #   | Finding                                                                                                                                                                                                  | Where                                                                  | Severity |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | -------- |
| R1  | A page component runs a Convex query itself, so a UI file also does data loading                                                                                                                        | `apps/web/src/features/records/RecordDetailPage.tsx:14`                | Medium   |
| R2  | Feature hooks call `convexClient` directly for writes and actions, next to hooks that read through TanStack DB collections. There are two ways to reach Convex                                           | `useDocumentsFeature.ts:43,66`; `useWorkspaceSearch.ts:33`             | Medium   |
| R3  | `createDocument` writes with a direct mutation, not through `documentSummariesCollection`, so the new document gets no optimistic insert. `AGENTS.md` §6 gives optimistic writes to TanStack DB         | `useDocumentsFeature.ts:34-53`; `apps/web/src/data/collections.ts`     | Low      |
| R4  | No lint rule enforces the package graph or the feature layers; only the old plan's grep checks it                                                                                                       | `vite.config.ts:100-130`                                               | Medium   |
| R5  | The Convex wrappers are the single place for auth, which is good, but they pass everything through today. Deploying this as is exposes all data                                                         | `packages/backend/convex/lib/functions.ts:4-22`                        | High if deployed |
| R6  | The E2E harness exists but no task runs it                                                                                                                                                              | `tests/e2e/run.ts`; no reference in `package.json` or `vite.config.ts` | Low      |

## Suggestions (proposals only)

- Give each feature slice `ui/`, `hooks/` and `data/` folders, and let only `data/` import `@repo/backend` (relates to R1–R3).
- Add `no-restricted-imports` overrides per package and per slice layer in `vite.config.ts` (R4).
- Wire `node tests/e2e/run.ts --tier 1` into a `vpr` task and the phase sign-off (R6).
