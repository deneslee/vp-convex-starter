# Docs Audit

<!-- Written by the docs auditor ($gsd-path-inspect). -->

Repo root: C:\Users\leede\Documents\Projects\CDSS\TEMP\vp-convex-starter-gsd-showcase
Audited: 2026-11-23
Audited HEAD: dedc5306d60f8d7218c899e18a316fd4ee14dd4c
Alignment mode: no

## Summary

| Verdict | Count |
|---------|-------|
| verified | 62 |
| stale | 17 |
| aspirational | 5 |
| unverifiable | 12 |
| descriptive docs (no testable claims) | 41 |

Worst drift: The phase table calls the backend and SPA unstarted even though the repository already has working source entry points for both, leaving their review status ambiguous.

Evidence is static at the recorded sidecar HEAD. Command findings verify task wiring where applicable. Build, test, cache-hit, hosted service behavior and third-party version claims require separate runtime or external evidence.

## Doc: .agents/workflow.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Baseline and sign-off commands" | command | verified | .agents/workflow.md:5–12. vite.config.ts:26–50 maps check, stylelint, test, convex:typecheck, fallow, env:audit and build. package.json:9 maps env:codegen. Static wiring checked. |
| "Long-running development and watch commands" | command | verified | .agents/workflow.md:16–18. vite.config.ts:51–62 registers dev, convex:dev and test:watch. |
| "Oxfmt and Stylelint run automatically via .vite-hooks/pre-commit" | config | stale | .agents/workflow.md:22. git ls-files -- '*pre-commit*' returns no files. vite.config.ts:19–22 owns the staged configuration. |
| "vpr format or vpr check:fix" | command | verified | .agents/workflow.md:23. package.json:5–7 defines both scripts. |

## Doc: .claude/CLAUDE.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Import AGENTS.md and WORKFLOW.md" | structure | verified | .claude/CLAUDE.md:1–2. Test-Path AGENTS.md and WORKFLOW.md succeeds from the referenced parent directory. |

## Doc: AGENTS.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "pnpm@12.21.0 and Vite+ check with type-aware lint" | config | verified | AGENTS.md:239–240. package.json:28–35 pins pnpm and vite.config.ts:30,103–104 enables both flags. |
| "Stylelint bans raw colors and units in module CSS" | config | verified | AGENTS.md:259. .stylelintrc.json:28–42 defines module CSS bans and style-file exceptions. |
| "Web uses Varlock and backend typed env" | config | verified | AGENTS.md:262–263. apps/web/.env.schema:1–7, apps/web/src/data/clients.ts:1–8, packages/backend/convex/convex.config.ts:6–10 and packages/backend/convex/lib/rag.ts:1–20. |
| "Domain, backend, UI and web have distinct dependency surfaces" | structure | verified | AGENTS.md:266–269. The four package.json manifests define @repo packages and their exports/dependencies. apps/web/package.json:16–18 consumes all three libraries. |
| "TanStack Query owns RAG semantic search actions" | feature | stale | AGENTS.md:273. apps/web/src/features/search/useWorkspaceSearch.ts:13–19,30–46 calls the action directly and stores hits in local React state. |
| "Read generated Convex AI guidelines before backend changes" | structure | stale | AGENTS.md:283. git ls-files -- '*guidelines.md' has no matching result. Root convex.json:3–5 disables AI files. The backend Convex configuration only sets the functions path. |
| "Baseline and sign-off task names" | command | verified | AGENTS.md:278–279. vite.config.ts:26–50 registers all listed tasks. Checked wiring. |

## Doc: CLAUDE.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "ECC workflow and local Convex skills are referenced" | structure | verified | CLAUDE.md:5–7. docs/restructure/workflow.md:5–13,55–67 exists and the frozen inventory contains the local Convex skills. |
| "Project skills and agents. None yet" | status | stale | CLAUDE.md:8. git ls-files -- .claude/skills/gsd-path/SKILL.md returns the installed project-local GSD Path skill. |

## Doc: apps/docs/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Catalog source, schema and generated pages exist" | structure | verified | apps/docs/README.md:7–11. apps/docs/catalog/catalog.yaml, apps/docs/catalog/schema.mjs, apps/docs/scripts/generate-catalog.mjs and both Markdown outputs exist in the sidecar. |
| "Run generator from the repo root" | command | unverifiable | apps/docs/README.md:16. apps/docs/scripts/generate-catalog.mjs:2–4 requires yaml and zod, absent from root package.json:15–26. Reproducing generation requires a dependency install and execution. |
| "yaml and zod are not root dev dependencies yet" | config | verified | apps/docs/README.md:18. package.json:15–26 omits both. |
| "Static docs site and app features page come later" | feature | aspirational | apps/docs/README.md:22–23. apps/docs contains data, schema, generator and Markdown files. apps/web/src/routes has no features page. |

## Doc: apps/docs/core.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "React 19 and strict TypeScript 7 on a Vite+ client-only SPA" | config | verified | apps/docs/core.md:15–17. pnpm-workspace.yaml:15–17,27–33, apps/web/vite.config.ts:1–24, apps/web/src/main.tsx:1–20 and tools/tsconfig/base.json. |
| "Every function goes through the app wrappers" | feature | stale | apps/docs/core.md:18. packages/backend/convex/searchActions.ts:25 uses internalAction. packages/backend/convex/documents.ts:58,67,93 uses internalQuery/internalMutation. |
| "File routing, DB lists, Query details, Zustand UI, Zod domain and Mantine theme" | integration | verified | apps/docs/core.md:19–23. apps/web/vite.config.ts, apps/web/src/data/collections.ts, apps/web/src/features/records/RecordDetailPage.tsx:14, apps/web/src/stores/useWorkspaceUiStore.ts, packages/domain/package.json and packages/ui/src/theme/theme.ts. |
| "TanStack Query for search" | feature | stale | apps/docs/core.md:20. apps/web/src/features/search/useWorkspaceSearch.ts:13–19,30–46 uses Query for keyword only. |
| "Optimistic record operations and bounded lists" | feature | verified | apps/docs/core.md:33. apps/web/src/data/collections.ts:7–61 wires record transactions. packages/backend/convex/records.ts:5–12 caps list results. |
| "Markdown storage and summaries-only reads" | feature | verified | apps/docs/core.md:34. packages/backend/convex/schema.ts:35–46 supports inline Markdown and overflow storageId. packages/backend/convex/documents.ts:9–54 exposes summaries and details. |
| "Three-step asset upload and deletion removes the file" | feature | verified | apps/docs/core.md:35. apps/web/src/data/uploadAsset.ts:18–43 generates URL, posts and finalizes. packages/backend/convex/assets.ts:68–83 deletes storage. |
| "Live updates show in every open tab" | feature | unverifiable | apps/docs/core.md:36. apps/web/src/data/collections.ts wires live collections. A multi-tab run against a disposable Convex deployment is needed for the end-to-end claim. |
| "Keyword indexes and RAG with background Workpool indexing" | feature | verified | apps/docs/core.md:42–43. packages/backend/convex/schema.ts:30,50, packages/backend/convex/convex.config.ts:13–14 and packages/backend/convex/searchActions.ts:25–65 show wiring. |
| "BlockNote plus raw mode and semantic themes" | feature | verified | apps/docs/core.md:49–50. packages/ui/src/primitives/MarkdownWorkspace.tsx:23–26,77–105 and packages/ui/src/styles/index.css. |
| "Better Auth is the default provider" | status | stale | apps/docs/core.md:56. docs/restructure/decisions.md:43–53 leaves D-01 open. apps/docs/potential.md:32 calls Better Auth proposed. |
| "Identity is checked once in the Convex wrappers" | feature | aspirational | apps/docs/core.md:56. packages/backend/convex/lib/functions.ts:4–22 passes requests through. The catalog row mixes current v1 behavior with a future P7 requirement. |
| "RAG, Workpool and convex-helpers are integrated" | integration | verified | apps/docs/core.md:64–66. packages/backend/convex/convex.config.ts:13–14 and packages/backend/convex/lib/functions.ts:1–22. |

## Doc: apps/docs/potential.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Generated from catalog YAML" | structure | verified | apps/docs/potential.md:3. apps/docs/scripts/generate-catalog.mjs:11–21 reads and validates the YAML and contains the notice used on the generated page. |
| "R2, auth, collaboration, agent and aggregate are options rather than installed integrations" | status | verified | apps/docs/potential.md:26–53. packages/backend/package.json:12–18 and packages/backend/convex/convex.config.ts:1–16 contain RAG and Workpool only. docs/restructure/decisions.md leaves related decisions open or deferred. |
| "Better Auth is a proposal" | status | verified | apps/docs/potential.md:32. docs/restructure/decisions.md:43–53 names recommendation without approval. apps/docs/core.md:56 calls it default, which is the contradictory side. |

## Doc: apps/web/src/features/search/AGENTS.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Links to root instructions and restructure decisions" | structure | verified | apps/web/src/features/search/AGENTS.md:3,9. The relative links resolve to the tracked AGENTS.md and docs/restructure/decisions.md.5,8 "Two modes share a UI hit shape and use SemanticSearchBar" |
| "TanStack Query owns search results" | feature | stale | apps/web/src/features/search/AGENTS.md:7. apps/web/src/features/search/useWorkspaceSearch.ts:13–19,30–46 uses Query for keyword and local state for semantic hits. |
| "Direct Convex access remains open in D-04" | status | verified | apps/web/src/features/search/AGENTS.md:9. docs/restructure/decisions.md:79–89 lists D-04 without acceptance. |

## Doc: docs/STATUS.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Status moved to restructure/README.md and this file awaits cleanup approval" | status | verified | docs/STATUS.md:3. docs/restructure/README.md:3–14 owns current status. docs/restructure/cleanup.md:1,12 lists the stub. |

## Doc: docs/adr/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "No ADRs yet" | status | verified | docs/adr/README.md:16. git ls-files -- docs/adr lists only docs/adr/README.md. |

## Doc: docs/ecc/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "The project uses the ECC skills named by the restructure workflow" | integration | unverifiable | docs/ecc/README.md:11–20. docs/restructure/workflow.md:3 labels the workflow proposed, and :23–33 lists the same ECC commands. Actual user-scope ECC installation/use would need host evidence. |
| "Old plan and five phase specs are superseded and on the cleanup list" | status | verified | docs/ecc/README.md:30. docs/restructure/cleanup.md:9–11 and docs/restructure/phases.md:5 explicitly reference those files. |

## Doc: docs/ecc/work/04-plan.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "pnpm 12.21.0 and Vite+ 1.7.0" | config | verified | docs/ecc/work/04-plan.md:3. package.json:28–35 and pnpm-workspace.yaml:15. |
| "Target monorepo layout includes four runtime packages and .vite-hooks/pre-commit" | structure | stale | docs/ecc/work/04-plan.md:7–67. The workspace package manifests are present, but git ls-files -- '*pre-commit*' returns no files. vite.config.ts:19–22 provides staged rules. |
| "Phase 0 (_refs/) is complete" | status | unverifiable | docs/ecc/work/04-plan.md:3. .gitignore excludes _refs and git history at the audited revision has no tracked reference tree. Completing the harvest requires preserved run or source records. |

## Doc: docs/ecc/work/04-plan/phase-1-monorepo-toolchain.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| ".vite-hooks/pre-commit (vp staged)" | structure | aspirational | docs/ecc/work/04-plan/phase-1-monorepo-toolchain.md:10. git ls-files -- '*pre-commit*' shows no checked-in hook. vite.config.ts:19–22 configures hooks through staged rules. |
| "Workspace catalog and root Vite+ tasks" | config | verified | docs/ecc/work/04-plan/phase-1-monorepo-toolchain.md:18–42. pnpm-workspace.yaml:1–26, package.json:5–26 and vite.config.ts:26–62. |
| "Stylelint, Fallow, shared TSConfig and Varlock" | config | verified | docs/ecc/work/04-plan/phase-1-monorepo-toolchain.md:84–132. .stylelintrc.json:28–42, vite.config.ts:33–49, tools/tsconfig/base.json and apps/web/.env.schema:1–7. |

## Doc: docs/ecc/work/04-plan/phase-2-ui-and-domain.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Domain schemas, Markdown helpers and ID factory" | feature | verified | docs/ecc/work/04-plan/phase-2-ui-and-domain.md:9–25. packages/domain/src/index.ts, packages/domain/src/schemas/index.ts, packages/domain/src/markdown/index.ts and packages/domain/src/ids.ts. |
| "Theme tokens, standalone UI primitives and render tests" | feature | verified | docs/ecc/work/04-plan/phase-2-ui-and-domain.md:45–73. packages/ui/src/styles/index.css, packages/ui/src/theme/theme.ts, packages/ui/src/index.ts and packages/ui/src/primitives/primitives.test.tsx. |

## Doc: docs/ecc/work/04-plan/phase-3-convex-backend.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Typed env, RAG and Workpool, schema and backend tests" | integration | verified | docs/ecc/work/04-plan/phase-3-convex-backend.md:37–95. packages/backend/convex/convex.config.ts:1–16, packages/backend/convex/schema.ts:18–70, packages/backend/convex/backend.test.ts and vite.config.ts:156–190. |
| "Install and read generated AI guidelines and Workpool guidance" | command | stale | docs/ecc/work/04-plan/phase-3-convex-backend.md:13,25–33. Root convex.json:3–5 disables AI files. Neither the generated guidelines nor the named Workpool llms.txt is present in the clean sidecar. |
| "Overflow storage is used at 500 KB" | feature | aspirational | docs/ecc/work/04-plan/phase-3-convex-backend.md:58. packages/backend/convex/schema.ts:35–46 supports storageId and documents.ts:115–174 accepts it. The documented threshold requires an upload/selection policy in the web editor. |

## Doc: docs/ecc/work/04-plan/phase-4-web-app.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Pure SPA, reactive collections, providers and a Zustand store" | integration | verified | docs/ecc/work/04-plan/phase-4-web-app.md:16–84. apps/web/vite.config.ts, apps/web/src/data/collections.ts, apps/web/src/app/Providers.tsx and apps/web/src/stores/useWorkspaceUiStore.ts. |
| "Feature pages and routes" | structure | verified | docs/ecc/work/04-plan/phase-4-web-app.md:85–98. git ls-files -- apps/web/src/features apps/web/src/routes lists assets, documents, records and workspace search plus the root route. |

## Doc: docs/ecc/work/04-plan/phase-5-verification-cleanup.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Full gate and immediate cache hits" | command | unverifiable | docs/ecc/work/04-plan/phase-5-verification-cleanup.md:17–28. vite.config.ts:26–50 defines all commands but no repeat-run receipt was present. Requires same-input reruns to verify cache hits. |
| "vpr dev starts both backend and frontend" | command | verified | docs/ecc/work/04-plan/phase-5-verification-cleanup.md:34. vite.config.ts:51–58 configures recursive dev and both package.json files declare dev scripts. |
| "Two-tab record sync, RAG indexing and asset smoke checks" | feature | unverifiable | docs/ecc/work/04-plan/phase-5-verification-cleanup.md:37–44. Source hooks and actions exist. Runtime outcomes require a disposable deployment, embedding credentials and a recorded two-tab run. |
| "gitignore covers the cleanup targets" | config | verified | docs/ecc/work/04-plan/phase-5-verification-cleanup.md:62. .gitignore contains _refs, .env files, generated env declarations, dist, .vitest, .tanstack and .fallow entries. |

## Doc: docs/restructure/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "P2B-3 is current; P2B-5 blocked; finish P2B-3 before P2B-4" | status | unverifiable | docs/restructure/README.md:9–13. docs/restructure/phases.md:44–50 agrees about workflow status. Tracked UI files and web consumers already exist. Approval and step receipts are required to distinguish review status from implementation progress. |
| "P6 and P7 are decision-gated" | status | verified | docs/restructure/README.md:12. docs/restructure/phases.md:21–22 and docs/restructure/decisions.md:43–95 document the gates. |

## Doc: docs/restructure/cleanup.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Cleanup candidates, replacements and retained files" | structure | verified | docs/restructure/cleanup.md:9–19. The frozen inventory includes the old ECC plan/specs, status stub, archive brainstorm and architecture audit. docs/restructure/phases.md:5 and README.md:3–14 are replacement owners. |

## Doc: docs/restructure/decisions.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "A-1 through A-6 are recorded requirements without ADRs" | status | verified | docs/restructure/decisions.md:28–39. docs/adr/README.md:16 lists no accepted ADR. The six A-rows are explicitly identified as requirements. |
| "Auth, workflow weight, data boundaries, coverage and upgrades remain distinct decisions" | status | verified | docs/restructure/decisions.md:43–122. docs/restructure/phases.md:15–29 maps D-01–D-09 to gates and deferrals. docs/adr/README.md:16 has no acceptance entries. |

## Doc: docs/restructure/phases.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "P1 done, including hooks and a repeated vpr check cache hit" | status | unverifiable | docs/restructure/phases.md:15. vite.config.ts:19–30 shows staged/check config. git ls-files -- '*pre-commit*' shows no tracked hook and no repeat-run evidence is supplied. |
| "P3 backend and P4 SPA: not started" | status | stale | docs/restructure/phases.md:18–19. packages/backend/convex/schema.ts:18–70 and apps/web/src/routes/__root.tsx:18–69 show existing implementation at the audited HEAD. docs/restructure/research/current-state.md:29 acknowledges the mismatch. |
| "AssetDropzone/AssetGallery not started and MarkdownWorkspace blocked" | status | stale | docs/restructure/phases.md:49–50. packages/ui/src/primitives/AssetDropzone.tsx, AssetGallery.tsx and MarkdownWorkspace.tsx are tracked and used in apps/web. The status may refer to review rather than initial implementation. |
| "Auth and collaborative editing have not started" | status | verified | docs/restructure/phases.md:22–23. packages/backend/convex/convex.config.ts:1–16 mounts only RAG and Workpool and packages/backend/convex/lib/functions.ts:4–22 shows pass-through middleware. |

## Doc: docs/restructure/research/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Five topic snapshots and current-state register are indexed" | structure | verified | docs/restructure/research/README.md:17,23–28. The frozen inventory contains all six linked page paths. |

## Doc: docs/restructure/research/convex-others.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "v1 mounts RAG and Workpool, with wrappers, native storage and full-text search" | integration | verified | docs/restructure/research/convex-others.md:5. packages/backend/convex/convex.config.ts:1–16, packages/backend/convex/lib/functions.ts:1–22, assets.ts:5–8 and schema.ts:30,50. |

## Doc: docs/restructure/research/current-state.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Workspace package names, pins, domain files and UI files" | structure | verified | docs/restructure/research/current-state.md:11–15. pnpm-workspace.yaml:1–4,45,60,63,65,67,78,86–87 and git ls-files -- packages/domain/src packages/ui/src. |
| "Each table has a search index" | structure | stale | docs/restructure/research/current-state.md:15. packages/backend/convex/schema.ts:30,50 defines search indexes on records and documents. Assets has ordinary indexes at :67–69. |
| "User-facing lists and keyword search are bounded" | feature | verified | docs/restructure/research/current-state.md:16. packages/backend/convex/records.ts:11, documents.ts:19, assets.ts:57 and search.ts:26,30 use .take. |
| "Every Convex function uses app wrappers" | feature | stale | docs/restructure/research/current-state.md:17. packages/backend/convex/documents.ts:58,67,93 and searchActions.ts:25 have internal registrations. The wrappers themselves pass through at lib/functions.ts:9–22. |
| "Routes and four flat feature directories with one feature hook and CSS each" | structure | stale | docs/restructure/research/current-state.md:18–19. git ls-files -- apps/web/src/features apps/web/src/routes shows flat features, but documents has two hooks and search has no module CSS. |
| "Four Vitest projects, six unit test files, seven tier-one E2E files, no package import restriction and ignored _refs" | config | verified | docs/restructure/research/current-state.md:20–23. vite.config.ts:100–130,156–190, git ls-files -- '*.test.*', tests/e2e/run.ts:1–30 and .gitignore. |
| "Direct web Convex access, pass-through auth, no E2E task and generator dependencies missing" | feature | verified | docs/restructure/research/current-state.md:30–35. apps/web/src/features/records/RecordDetailPage.tsx:14, apps/web/src/features/documents/useDocumentsFeature.ts:43, packages/backend/convex/lib/functions.ts:9–22, vite.config.ts:26–62 and package.json:5–26. |

## Doc: docs/restructure/research/markdown-editor-options.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Single MarkdownWorkspace boundary accepts Markdown and editor callbacks" | structure | verified | docs/restructure/research/markdown-editor-options.md:5. packages/ui/src/primitives/MarkdownWorkspace.tsx:12–21 exposes the documented props plus documentKey and debounceMs. |
| "Switching editors never affects routes, collections or RAG" | feature | unverifiable | docs/restructure/research/markdown-editor-options.md:5. The current boundary is visible at apps/web/src/features/documents/DocumentEditorPage.tsx:40. A concrete alternative adapter and its integration tests are needed to guarantee unchanged behavior. |
| "Current BlockNote/raw modes, style import, upload callback and debounced block conversion" | feature | verified | docs/restructure/research/markdown-editor-options.md:9–21. pnpm-workspace.yaml:57–60, packages/ui/src/primitives/MarkdownWorkspace.tsx:1–7,23–42,48–74,92–105 and apps/web/src/features/documents/useDocumentEditor.ts:10–48. |

## Doc: docs/restructure/research/packages-and-versions.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Verified pnpm workspace catalog" | config | verified | docs/restructure/research/packages-and-versions.md:9–104. git diff 898e983 HEAD -- pnpm-workspace.yaml returns no changes and pnpm-workspace.yaml:13–87 contains the exact catalog pins. |
| "Compatibility constraints" | integration | unverifiable | docs/restructure/research/packages-and-versions.md:106. Catalog pins establish selected versions. Independently checking compatibility requires clean installation or version-specific upstream manifests and runtime tests. |

## Doc: docs/restructure/research/storage-and-auth-options.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Backend typed env and native storage with Varlock on web" | integration | verified | docs/restructure/research/storage-and-auth-options.md:5–12. packages/backend/convex/convex.config.ts:6–10, packages/backend/convex/lib/rag.ts:1–20, apps/web/.env.schema:1–7 and packages/backend/convex/assets.ts:5–45. |
| "Assets metadata includes optional storageProvider: convex" | structure | aspirational | docs/restructure/research/storage-and-auth-options.md:14. packages/backend/convex/schema.ts:55–69 defines storageId without storageProvider. |
| "Single user and all functions use auth-ready middleware" | feature | stale | docs/restructure/research/storage-and-auth-options.md:39–42. packages/backend/convex/lib/functions.ts:4–22 confirms pass-through public middleware. documents.ts:58,67,93 and searchActions.ts:25 use internal functions directly. |

## Doc: docs/restructure/specs/P2B-3-appframe-recordtable.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Status: approved" | status | verified | docs/restructure/specs/P2B-3-appframe-recordtable.md:3. docs/restructure/specs/README.md:9 records approved for this file. |
| "AppFrame, RecordTable, RecordDetailCard and render tests exist" | structure | verified | docs/restructure/specs/P2B-3-appframe-recordtable.md:10–14. packages/ui/src/primitives/AppFrame.tsx, RecordTable.tsx, RecordDetailCard.tsx, primitives.test.tsx and packages/ui/src/index.ts are tracked. |
| "The package is new and nothing consumes it yet" | structure | stale | docs/restructure/specs/P2B-3-appframe-recordtable.md:40. apps/web/src/routes/__root.tsx:2,29 and apps/web/src/features/records/RecordsPage.tsx:3,108 already consume the implicated primitives. |
| "Check, stylelint, and two UI tests pass the expected gate" | command | unverifiable | docs/restructure/specs/P2B-3-appframe-recordtable.md:32–35. vite.config.ts:30–35 declares the commands and packages/ui/src/primitives/primitives.test.tsx contains tests. The approved spec provides expected results only. An isolated run is needed to record actual results. |

## Doc: docs/restructure/specs/README.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "P2B-3 spec is approved" | status | verified | docs/restructure/specs/README.md:9. docs/restructure/specs/P2B-3-appframe-recordtable.md:3 explicitly says approved. |

## Doc: docs/restructure/workflow.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Workflow weight is proposed and decision D-02 is open" | status | verified | docs/restructure/workflow.md:3. docs/restructure/decisions.md:55–66 records D-02 without ADR acceptance. |
| "Baseline and sign-off commands are vpr tasks" | command | verified | docs/restructure/workflow.md:31. vite.config.ts:26–50 declares each task named by the workflow. Checked task wiring. |
| "Nested package instructions are a future workflow option" | status | verified | docs/restructure/workflow.md:75–78. git ls-files -- 'packages/**/AGENTS.md' returns no tracked package instruction files. A web feature instruction file is separately present. |

## Doc: docs/review/architecture-audit.md

| Claim | Type | Verdict | Evidence |
|-------|------|---------|----------|
| "Web data loading reaches Convex from a component and from feature hooks" | feature | verified | docs/review/architecture-audit.md:6,13–14. apps/web/src/features/records/RecordDetailPage.tsx:14, apps/web/src/features/documents/useDocumentsFeature.ts:43,66 and apps/web/src/features/search/useWorkspaceSearch.ts:33. |
| "Document creation skips optimistic DB insert" | feature | verified | docs/review/architecture-audit.md:15. apps/web/src/features/documents/useDocumentsFeature.ts:34–53 calls direct mutation. apps/web/src/data/collections.ts:64–104 has no insert handler. |
| "No package import boundary lint and no E2E task" | config | verified | docs/review/architecture-audit.md:16,18. vite.config.ts:100–130 contains plugin and rule definitions without layer restrictions. Its task list at :26–62 and package.json:5–13 omit the E2E runner. |
| "Wrappers pass requests through; deployment exposes all data" | feature | unverifiable | docs/review/architecture-audit.md:17. packages/backend/convex/lib/functions.ts:9–22 proves no wrapper identity check and exported list functions are public. The exact deployment exposure requires deployment scope and access evidence. |

## Descriptive docs

The local Convex skill bundle gives generic or conditional procedures. Its statements about upstream components do not describe this application's implementation. WORKFLOW.md describes the installed GSD Path dependency. The archived brainstorm and external reference index give design ideas and upstream pointers.

- .agents/skills/convex-add/SKILL.md
- .agents/skills/convex-advisor/SKILL.md
- .agents/skills/convex-agent/SKILL.md
- .agents/skills/convex-auth/SKILL.md
- .agents/skills/convex-authz/SKILL.md
- .agents/skills/convex-backup/SKILL.md
- .agents/skills/convex-billing/SKILL.md
- .agents/skills/convex-cost/SKILL.md
- .agents/skills/convex-create-component/SKILL.md
- .agents/skills/convex-create-component/references/advanced-patterns.md
- .agents/skills/convex-create-component/references/hybrid-components.md
- .agents/skills/convex-create-component/references/local-components.md
- .agents/skills/convex-create-component/references/packaged-components.md
- .agents/skills/convex-crons/SKILL.md
- .agents/skills/convex-deploy-guard/SKILL.md
- .agents/skills/convex-design/SKILL.md
- .agents/skills/convex-dev-rag/SKILL.md
- .agents/skills/convex-docs/SKILL.md
- .agents/skills/convex-domains/SKILL.md
- .agents/skills/convex-env/SKILL.md
- .agents/skills/convex-expert/SKILL.md
- .agents/skills/convex-explain-app/SKILL.md
- .agents/skills/convex-improve-convex-plugin/SKILL.md
- .agents/skills/convex-insights/SKILL.md
- .agents/skills/convex-launch-readiness/SKILL.md
- .agents/skills/convex-migrate-rehearse/SKILL.md
- .agents/skills/convex-migrate/SKILL.md
- .agents/skills/convex-monitor/SKILL.md
- .agents/skills/convex-optimize/SKILL.md
- .agents/skills/convex-quickstart/SKILL.md
- .agents/skills/convex-reviewer/SKILL.md
- .agents/skills/convex-seed/SKILL.md
- .agents/skills/convex-self-heal/SKILL.md
- .agents/skills/convex-sentinel/SKILL.md
- .agents/skills/convex-suggest/SKILL.md
- .agents/skills/convex-test/SKILL.md
- .agents/skills/convex-verify/SKILL.md
- .agents/skills/convex/SKILL.md
- WORKFLOW.md
- docs/archive/20261120-gemini-initial-brainstorm.md
- docs/restructure/research/other-refs.md

## User rulings

| Queue # | Ruling | User's words | Planned |
|---------|--------|--------------|---------|
| 21 | accept-drift | 1. **Keep the source docs as written (`accept-drift`, recommended).** Use their phase labels as the simulation timeline. Cite the inspection whenever the roadmap describes actual code or verification. This preserves the trial’s starting point. | n/a (accept-drift) |
| 22 | accept-drift | 1. **Keep the source docs as written (`accept-drift`, recommended).** Use their phase labels as the simulation timeline. Cite the inspection whenever the roadmap describes actual code or verification. This preserves the trial’s starting point. | n/a (accept-drift) |
| 23 | accept-drift | 1. **Keep the source docs as written (`accept-drift`, recommended).** Use their phase labels as the simulation timeline. Cite the inspection whenever the roadmap describes actual code or verification. This preserves the trial’s starting point. | n/a (accept-drift) |
| 24 | accept-drift | 1. **Keep the source docs as written (`accept-drift`, recommended).** Use their phase labels as the simulation timeline. Cite the inspection whenever the roadmap describes actual code or verification. This preserves the trial’s starting point. | n/a (accept-drift) |
| 2 | accept-drift | Accept drift for rows 2, 3, 8, 9, 10, 12 and 17. | n/a (accept-drift) |
| 3 | accept-drift | Accept drift for rows 2, 3, 8, 9, 10, 12 and 17. | n/a (accept-drift) |
| 8 | accept-drift | Accept drift for rows 2, 3, 8, 9, 10, 12 and 17. | n/a (accept-drift) |
| 9 | accept-drift | Accept drift for rows 2, 3, 8, 9, 10, 12 and 17. | n/a (accept-drift) |
| 10 | accept-drift | Accept drift for rows 2, 3, 8, 9, 10, 12 and 17. | n/a (accept-drift) |
| 12 | accept-drift | Accept drift for rows 2, 3, 8, 9, 10, 12 and 17. | n/a (accept-drift) |
| 17 | accept-drift | Accept drift for rows 2, 3, 8, 9, 10, 12 and 17. | n/a (accept-drift) |

## Remediation queue

| # | Doc | Claim | Verdict | Class | Suggested action |
|---|-----|-------|---------|-------|------------------|
| 1 | .agents/workflow.md | "Oxfmt and Stylelint run automatically via .vite-hooks/pre-commit" | stale | fix-doc | Describe Vite+ staged configuration and verify hook provisioning independently. |
| 2 | AGENTS.md | "TanStack Query owns RAG semantic search actions" | stale | NEEDS-USER | Resolve the semantic results contract alongside D-04 before changing implementation or guidelines. |
| 3 | AGENTS.md | "Read generated Convex AI guidelines before backend changes" | stale | NEEDS-USER | Confirm the maintained guidance source and update the required preflight. |
| 4 | CLAUDE.md | "Project skills and agents. None yet" | stale | fix-doc | Clarify that the claim refers to custom restructure skills if that is the intended scope. |
| 5 | apps/docs/README.md | "Run generator from the repo root" | unverifiable | fix-doc | Provide a reproducible generator dependency setup. |
| 6 | apps/docs/README.md | "Static docs site and app features page come later" | aspirational | fix-doc | Keep both explicitly labeled as proposed. |
| 7 | apps/docs/core.md | "Every function goes through the app wrappers" | stale | fix-doc | State that the public endpoints use the app wrappers and document internal registrations. |
| 8 | apps/docs/core.md | "TanStack Query for search" | stale | NEEDS-USER | Align the generated catalog with the semantic search ownership ruling. |
| 9 | apps/docs/core.md | "Live updates show in every open tab" | unverifiable | NEEDS-USER | Require a recorded two-tab smoke test for the built status. |
| 10 | apps/docs/core.md | "Better Auth is the default provider" | stale | NEEDS-USER | Resolve D-01 before giving a sign-in provider default status. |
| 11 | apps/docs/core.md | "Identity is checked once in the Convex wrappers" | aspirational | fix-doc | Label identity checks as the future P7 criterion. |
| 12 | apps/web/src/features/search/AGENTS.md | "TanStack Query owns search results" | stale | NEEDS-USER | Resolve and record Query ownership for semantic results. |
| 13 | docs/ecc/README.md | "The project uses the ECC skills named by the restructure workflow" | unverifiable | fix-doc | Distinguish proposed workflow wiring from actual installation or use. |
| 14 | docs/ecc/work/04-plan.md | "Target monorepo layout includes four runtime packages and .vite-hooks/pre-commit" | stale | fix-doc | Use active phase documents for current layout and distinguish legacy planned paths. |
| 15 | docs/ecc/work/04-plan.md | "Phase 0 (_refs/) is complete" | unverifiable | fix-doc | Label as historical status with its verification record if available. |
| 16 | docs/ecc/work/04-plan/phase-1-monorepo-toolchain.md | ".vite-hooks/pre-commit (vp staged)" | aspirational | fix-doc | Document actual provisioning in the current toolchain contract. |
| 17 | docs/ecc/work/04-plan/phase-3-convex-backend.md | "Install and read generated AI guidelines and Workpool guidance" | stale | NEEDS-USER | Confirm the current backend guidance source before using the old scaffold steps. |
| 18 | docs/ecc/work/04-plan/phase-3-convex-backend.md | "Overflow storage is used at 500 KB" | aspirational | fix-doc | Separate the storage representation from automatic overflow behavior. |
| 19 | docs/ecc/work/04-plan/phase-5-verification-cleanup.md | "Full gate and immediate cache hits" | unverifiable | fix-doc | Include run evidence if reporting a passed gate. |
| 20 | docs/ecc/work/04-plan/phase-5-verification-cleanup.md | "Two-tab record sync, RAG indexing and asset smoke checks" | unverifiable | fix-doc | Keep smoke expectations distinct from observed results. |
| 21 | docs/restructure/README.md | "P2B-3 is current; P2B-5 blocked; finish P2B-3 before P2B-4" | unverifiable | NEEDS-USER | Clarify that status refers to restructure review or reconcile the phase baseline. |
| 22 | docs/restructure/phases.md | "P1 done, including hooks and a repeated vpr check cache hit" | unverifiable | NEEDS-USER | Separate pre-existing implementation, local setup and recorded gate completion. |
| 23 | docs/restructure/phases.md | "P3 backend and P4 SPA: not started" | stale | NEEDS-USER | Report review status separately from code already present. |
| 24 | docs/restructure/phases.md | "AssetDropzone/AssetGallery not started and MarkdownWorkspace blocked" | stale | NEEDS-USER | Record implementation and unresolved review gates separately. |
| 25 | docs/restructure/research/current-state.md | "Each table has a search index" | stale | fix-doc | Describe the assets indexes separately. |
| 26 | docs/restructure/research/current-state.md | "Every Convex function uses app wrappers" | stale | fix-doc | Limit wrapper assertion to public functions. |
| 27 | docs/restructure/research/current-state.md | "Routes and four flat feature directories with one feature hook and CSS each" | stale | fix-doc | Update the directory summary with existing exceptions. |
| 28 | docs/restructure/research/markdown-editor-options.md | "Switching editors never affects routes, collections or RAG" | unverifiable | fix-doc | Describe the boundary as an intended migration constraint. |
| 29 | docs/restructure/research/packages-and-versions.md | "Compatibility constraints" | unverifiable | fix-doc | Attach version-specific install evidence to claims used as gates. |
| 30 | docs/restructure/research/storage-and-auth-options.md | "Assets metadata includes optional storageProvider: convex" | aspirational | fix-doc | Mark provider metadata as a migration option. |
| 31 | docs/restructure/research/storage-and-auth-options.md | "Single user and all functions use auth-ready middleware" | stale | fix-doc | Distinguish public endpoints from internal registrations. |
| 32 | docs/restructure/specs/P2B-3-appframe-recordtable.md | "The package is new and nothing consumes it yet" | stale | fix-doc | Update rollback impact to include current consumers. |
| 33 | docs/restructure/specs/P2B-3-appframe-recordtable.md | "Check, stylelint, and two UI tests pass the expected gate" | unverifiable | fix-doc | Record execution evidence at step close. |
| 34 | docs/review/architecture-audit.md | "Wrappers pass requests through; deployment exposes all data" | unverifiable | fix-doc | State code-level public access and qualify claims about deployment. |
