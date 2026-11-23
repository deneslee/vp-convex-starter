# Current state: facts, gaps, requirements

Last verified: commit `898e983`, 2026-11-23. The facts were checked with grep and `git ls-files`. Nothing was run: no install, no build, no tests.

**This is a snapshot.** It saves re-exploring the code, but it goes out of date with every change. Before you act on a row, check it against the code and, if it has changed, update the row and its date. If this page and the code disagree, the code wins.

## A. Facts

| ID   | Fact                                                                                                                                                         | Evidence                                                                      |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| F-01 | A pnpm workspace with `apps/*`, `packages/*` and `tools/*`; packages `@repo/web`, `@repo/domain`, `@repo/ui`, `@repo/backend`                                 | `pnpm-workspace.yaml:1-4`, each `package.json:2`                              |
| F-02 | Pinned in the catalog: Mantine 9.8.2, BlockNote 0.57.0, TanStack Router 1.170.46, Query 5.108.2, DB 1.0.0-rc.1.5, Convex 1.51.0, Zod 4.6.7, Zustand 5.1.0      | `pnpm-workspace.yaml:45,60,63,65,67,78,86,87`                                 |
| F-03 | `packages/domain` has schemas, Markdown helpers and `ids.ts`, with three test files                                                                          | `packages/domain/src/**`                                                      |
| F-04 | `packages/ui` has tokens, semantic CSS, theme, resolver and eight primitive files, including `MarkdownWorkspace` and `AssetGallery`                                 | `packages/ui/src/{styles,theme,primitives}/`                                  |
| F-05 | `packages/backend` has a schema with `records`, `documents` and `assets` tables, each keyed by `clientId` with a search index                                | `packages/backend/convex/schema.ts:19-67`                                     |
| F-06 | All list queries are bounded with `.take(limit)`                                                                                                             | `records.ts:11`, `documents.ts:19`, `assets.ts:57`, `search.ts:26,30`         |
| F-07 | Every Convex function goes through `appQuery`, `appMutation` or `appAction`; the wrappers pass through with no identity check                                | `packages/backend/convex/lib/functions.ts:4-22`                               |
| F-08 | `apps/web` has routes for home, records, documents and assets, and four feature folders: records, documents, assets, search                                   | `apps/web/src/routes/**`, `apps/web/src/features/*`                           |
| F-09 | Features are flat folders: page components, one `use*Feature` hook and a module CSS file each. There are no `ui/`, `hooks/` or `data/` subfolders               | `apps/web/src/features/*/`                                                    |
| F-10 | Vitest has four projects: `domain`, `backend` (edge runtime), `ui` and `web`. There are 6 unit test files                                                     | `vite.config.ts:156-190`, `git ls-files '*.test.*'`                           |
| F-11 | Lint is oxlint with Mantine, TanStack and Convex plugins. No rule restricts imports between packages or layers                                               | `vite.config.ts:100-130`                                                      |
| F-12 | `tests/e2e/` holds a tiered E2E harness (tier 1 only, 7 files) run by `node tests/e2e/run.ts`                                                                 | `tests/e2e/run.ts:1-30`, `tests/e2e/tier1/`                                   |
| F-13 | `_refs/` is git-ignored; it is not in the repository                                                                                                         | `.gitignore:36`                                                               |

## B. Gap register

Severity runs from P0 (highest) to P3. Status: **C** means confirmed at `898e983`; **nr** means not re-checked. Each gap's phase is in [../phases.md](../phases.md).

| ID    | Gap                                                                                                                                                           | Sev            | Status |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------ |
| G-001 | [../phases.md](../phases.md) shows P3 and P4 as not started, but `packages/backend` and `apps/web` already hold code (F-05, F-08). The phase status does not match the code | P1             | C      |
| G-002 | `RecordDetailPage.tsx` (a page component) runs a Convex query itself, so UI and data handling are mixed (A-6)                                                  | P2             | C      |
| G-003 | Feature hooks call Convex directly: `useDocumentsFeature.ts:43`, `useWorkspaceSearch.ts:33`. There is no data layer between hooks and Convex (D-03, D-04)       | P2             | C      |
| G-004 | No identity, auth or ownership: the `app*` wrappers pass everything through (F-07)                                                                            | P0 if deployed | C      |
| G-005 | The package and layer rules in AGENTS.md §5 are not enforced by lint (F-11); the old plan relied on a grep                                                    | P2             | C      |
| G-006 | The E2E harness (F-12) is not wired into a `vpr` task, so the baseline loop never runs it                                                                     | P2             | C      |
| G-007 | The capability catalog generator in `apps/docs/` needs `yaml` and `zod` at the root; neither is a root dependency                                              | P3             | C      |
| G-008 | The old P5 gate says "`_refs/` removed"; git cannot show that, because `_refs/` is ignored (F-13)                                                             | P3             | C      |
| G-009 | Live editing would replace the BlockNote set-up inside `MarkdownWorkspace` in `packages/ui`                                                                    | P2             | nr     |
| G-010 | There is no glossary. The same things have different names across AGENTS.md, the old plan and the Gemini brainstorm                                           | P3             | nr     |

## C. Original requirements and earlier proposals

- **Your requirements** (A-1…A-6) are in [../decisions.md](../decisions.md).
- **The first plan** is the Gemini brainstorm ([../../archive/20261120-gemini-initial-brainstorm.md](../../archive/20261120-gemini-initial-brainstorm.md)). It is a proposal only. Parts of it became the old plan; the rest was not adopted.
- **The old plan** is [../../ecc/work/04-plan.md](../../ecc/work/04-plan.md) with five phase specs. Its target layout, phase graph and verification gates are carried into [../phases.md](../phases.md). It is on the [cleanup list](../cleanup.md).
- **An agent review** of the code is in [../../review/architecture-audit.md](../../review/architecture-audit.md). Its findings are not verified unless a G-row above cites them.
