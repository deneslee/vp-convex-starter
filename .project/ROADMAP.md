# Roadmap — GSD Path planning showcase

<!-- Written and owned by $gsd-path-roadmap. Rolling-wave: milestone scope
     persists here. Detailed planning belongs to the active milestone.
     Never edit a shipped entry except Status, Archive, and Integrated.
     Never edit an abandoned entry. -->

The showcase ends when the owner approves this roadmap. The entries below describe possible future review outcomes, with implementation and starter configuration changes outside the [charter](CHARTER.md). Roadmap approval settles the showcase sequence. The existing product decisions still require their own owner rulings. [Synthesis](SYNTHESIS.md) · [Decision queue](../docs/restructure/decisions.md#queue)

The simulation starts at P2B-3. It treats the toolchain, domain, UI tokens and theme as complete and uses the phase labels to order the remaining work. The inspected checkout already contains UI primitives and consumers, Convex functions and SPA routes. Inspection was static. Build, tests, browser behavior, cache hits and hosted behavior remain unverified. [Scenario sources](CHARTER.md#constraints) · [Phase table](../docs/restructure/phases.md) · [Inspection](research/evidence-codebase.md) · [Audit rulings](research/DOCS-AUDIT.md#user-rulings)

## Milestones

### M001 — app-frame-and-record-table

Goal: Close the simulated P2B-3 review with evidence that the shared shell and record views work with representative records within the UI package boundary.
Depends on: []
Surfaces: UI component review
Status: active
Archive: null
Integrated: null

Scope: in
- AppFrame navigation and content, RecordTable rendering and selection, and record detail presentation within the existing theme. This is the smallest reviewable slice at the simulated starting point and can be exercised with sample records. [P2B-3 scope](../docs/restructure/specs/P2B-3-appframe-recordtable.md#scope--in--out-owned-paths)

Scope: out
- Asset and editor primitives belong to M002. Backend data loading, routing and stores belong to SPA integration at M004.

Success criteria
1. UI component review shows the shell rendering navigation and supplied content, the table rendering and selecting sample records, and the detail view presenting a selected record.
2. The review records UI boundary, styling and render evidence for the selected acceptance checks and distinguishes the existing spec approval from executed checks.

Risks
- The spec is marked approved and the components, render tests and web consumers exist in the checkout. The expected check, Stylelint and UI test outcomes still need execution evidence. [P2B-3 docs audit](research/DOCS-AUDIT.md#doc-docsrestructurespecsp2b-3-appframe-recordtablemd)

Open questions
- None

### M002 — asset-and-editor-primitives

Goal: Close P2B by reviewing the shared asset controls and Markdown workspace against their consumer contracts.
Depends on: [M001]
Surfaces: UI component review
Status: pending
Archive: null
Integrated: null

Scope: in
- P2B-4 asset dropzone and gallery, followed by the P2B-5 MarkdownWorkspace review under the same theme and UI package boundary. The P2B sequence closes the shared UI review before SPA integration. [Phase steps](../docs/restructure/phases.md#steps)

Scope: out
- Live asset storage and persistence belong to backend and SPA review. Collaborative editing is a separate proposal at M008.

Success criteria
1. UI component review demonstrates file selection and gallery rendering for representative asset states, with consumer-supplied data and callbacks.
2. UI component review demonstrates that the editor accepts and returns Markdown in the approved rich and raw modes, with the BlockNote API check recorded.

Risks
- The checked-out source already includes assets and Markdown UI code. The scenario's P2B-5 blocker is the pending BlockNote API check. [UI status audit](research/DOCS-AUDIT.md#user-rulings) · [Phase steps](../docs/restructure/phases.md#steps)

Open questions
- Which per-step workflow applies to the next step under [D-02](../docs/restructure/decisions.md#d-02-how-heavy-is-the-per-step-workflow)? This ruling also applies to M003.
- Which installed BlockNote APIs satisfy the required MarkdownWorkspace modes and callbacks for P2B-5?

### M003 — backend-contracts

Goal: Establish P3 backend readiness through evidence for the Convex contracts the SPA depends on.
Depends on: []
Surfaces: Convex API verification
Status: pending
Archive: null
Integrated: null

Scope: in
- Review the record, document and asset contracts, native storage, bounded reads, keyword search and readiness of background semantic indexing with RAG and Workpool. In the phase model, P3 can be reviewed after the simulated baseline while P2B continues. [Phase order and P3 checks](../docs/restructure/phases.md) · [Inspection](research/evidence-codebase.md#map)

Scope: out
- Web composition belongs to M004. Multi-user identity and ownership belong to the proposed M007 review. External file storage remains deferred under [D-08](../docs/restructure/decisions.md#d-08-external-file-storage).

Success criteria
1. Convex API verification records the outcomes for record operations, bounded reads, document summaries and detail loading, asset storage and removal, and keyword search.
2. Convex API verification records the result and environment prerequisites for the approved RAG and Workpool checks.

Risks
- The source includes Convex functions and component wiring. A fresh checkout needs generated Convex inputs, and the embedding-backed path needs deployment configuration. Edge-runtime component test coverage and the future per-user namespace question remain unverified. [Inspection](research/evidence-codebase.md) · [P3 unverified items](../docs/restructure/phases.md#p3-unverified-items)

Open questions
- Is the D-02 workflow ruling recorded before P3 starts if this review starts ahead of P2B-4? Which maintained Convex and Workpool guidance applies? [D-02](../docs/restructure/decisions.md#d-02-how-heavy-is-the-per-step-workflow) · [Audit rulings](research/DOCS-AUDIT.md#user-rulings)

### M004 — spa-integration

Goal: Establish P4 review readiness for a browser session that connects the shared UI and Convex contracts.
Depends on: [M002, M003]
Surfaces: web app
Status: pending
Archive: null
Integrated: null

Scope: in
- Review routes, providers and the records, documents, assets and search flows. Once the shared UI and backend contracts have review evidence, the SPA can establish that they work together. [Phase order](../docs/restructure/phases.md) · [Inspected architecture](research/evidence-codebase.md#map)

Scope: out
- The repeated full verification gate and cross-tab smoke checks belong to M005. Feature-slice reorganization and the open semantic results ownership decision belong to the proposed M006 review.

Success criteria
1. A browser walkthrough demonstrates record list and detail operations, document list and Markdown detail editing, asset upload and removal, and keyword search through the web routes.
2. The integration review records whether list bounds hold on re-subscription, confirms that document detail loads independently of the summary list, and records the result of any approved semantic-search check.

Risks
- Routes and data connections exist in the checkout. Browser execution, re-subscription behavior and the embedding-backed path still require evidence. The clean checkout is missing generated route and environment inputs. [Inspection](research/evidence-codebase.md) · [P3 unverified items](../docs/restructure/phases.md#p3-unverified-items)

Open questions
- Which starter behaviors need explicit preservation evidence across the SPA flows? [Inspection questions](research/evidence-codebase.md#open-questions-for-define)

### M005 — release-verification

Goal: Close P5 with reproducible verification evidence for the integrated starter and an explicit cleanup disposition.
Depends on: [M004]
Surfaces: verification CLI, web app
Status: pending
Archive: null
Integrated: null

Scope: in
- Review the coverage gate, baseline and sign-off checks, repeat-run cache behavior, separate tier verification, two-tab smoke behavior and cleanup. P5 follows SPA integration because those checks depend on functioning web and backend contracts. [Phase table](../docs/restructure/phases.md) · [Verification audit](research/DOCS-AUDIT.md#doc-docseccwork04-planphase-5-verification-cleanupmd)

Scope: out
- Hosted release, multi-user authorization and simultaneous document editing are beyond this baseline verification scope.

Success criteria
1. Verification CLI records the approved checks, coverage and tier runs, the repeat-run cache outcome, and the fixture and cleanup disposition from a clean baseline.
2. Web app evidence records two-tab record synchronization and asset smoke results, plus the result of a semantic search check if included in the approved coverage.

Risks
- The root unit task omits the tier harness. The Tier 1 preservation suite relies on ignored reference fixtures, which need provisioning if that suite is in scope. Build and browser evidence require the generated inputs, and semantic search requires a deployment key. No inspected output proved cache hits or hosted functionality. [Inspection](research/evidence-codebase.md) · [Verification audit](research/DOCS-AUDIT.md#doc-docseccwork04-planphase-5-verification-cleanupmd)

Open questions
- What coverage target closes P5 under [D-06](../docs/restructure/decisions.md#d-06-coverage-target)? Are semantic search and the fixture-dependent preservation suite required? [Inspection questions](research/evidence-codebase.md#open-questions-for-define)

### M006 — feature-slice-restructure

Goal: If the owner approves P6, review a feature-slice layout with stable starter behavior and explicit UI, hook and data ownership.
Depends on: [M005]
Surfaces: web app, architecture review
Status: pending
Archive: null
Integrated: null

Scope: in
- Review boundaries, enforcement and vocabulary for P6 after the integrated starter has a verification baseline. [Phase table](../docs/restructure/phases.md) · [Decision queue](../docs/restructure/decisions.md#queue)

Scope: out
- New sign-in behavior and collaborative editing belong to M007 and M008 if the owner approves those proposals.

Success criteria
1. Architecture review confirms the approved layer split, data access and semantic results ownership, boundary enforcement, and vocabulary for feature code.
2. The web app still passes the agreed P5 behavior checks for the affected features.

Risks
- The checkout includes direct Convex access and a difference between documented and inspected semantic search state ownership. Current behavior needs preservation evidence while the ownership decisions remain open. [Architecture and search audit](research/DOCS-AUDIT.md#user-rulings)

Open questions
- What data placement, direct Convex access, boundary enforcement and shared vocabulary does the owner approve under [D-03 through D-05 and D-09](../docs/restructure/decisions.md#queue)? Resolve semantic results ownership alongside D-04.

### M007 — identity-and-access

Goal: If the owner approves P7, review sign-in and per-user access with an agreed provider and ownership model.
Depends on: [M006]
Surfaces: web app, Convex API verification
Status: pending
Archive: null
Integrated: null

Scope: in
- Review sign-in, identity checks and access rules after the behavior-preserving restructure. Verify user isolation against the approved multi-user model. [Phase table](../docs/restructure/phases.md) · [D-01](../docs/restructure/decisions.md#d-01-auth-provider)

Scope: out
- Collaborative editing belongs to M008. External storage stays deferred under D-08.

Success criteria
1. The web app demonstrates sign-in and expected access with two identities using the approved provider.
2. Convex API verification demonstrates the approved access rules, including refusal of cross-user reads and writes where isolation is required.

Risks
- The inspected shared public wrappers pass requests through without an identity check. Hosted exposure and per-user RAG namespace behavior remain unverified. [Wrapper inspection](research/evidence-codebase.md#finding-the-shared-convex-wrappers-leave-identity-enforcement-open) · [P3 unverified items](../docs/restructure/phases.md#p3-unverified-items)

Open questions
- Which provider and ownership model does the owner approve under [D-01](../docs/restructure/decisions.md#d-01-auth-provider) and the [inspection questions](research/evidence-codebase.md#open-questions-for-define)?

### M008 — collaborative-editing

Goal: If the owner approves P8, review simultaneous editing of one document through the approved editor and synchronization model.
Depends on: [M006]
Surfaces: web app
Status: pending
Archive: null
Integrated: null

Scope: in
- Review concurrent edits after P6, preserving the document behaviors defined for the starter. The phase table places P7 and P8 after the restructure. The access model may introduce a further dependency once the owner rules. [Phase table](../docs/restructure/phases.md) · [D-07](../docs/restructure/decisions.md#d-07-collaborative-editing-engine)

Scope: out
- Provider selection and ownership rules belong to M007. External file storage remains deferred under D-08.

Success criteria
1. A recorded web app walkthrough shows two tabs editing the same document at the same time and converging on a shared result.
2. The web app demonstrates that the agreed Markdown and document persistence behaviors still hold with the approved editor.

Risks
- The BlockNote boundary is visible in the checkout. Compatibility with a synchronization engine or replacement editor needs separate evidence. Earlier two-tab record synchronization cannot verify concurrent document edits. [Markdown editor audit](research/DOCS-AUDIT.md#doc-docsrestructureresearchmarkdown-editor-optionsmd)

Open questions
- Which editor and collaboration engine does the owner approve under [D-07](../docs/restructure/decisions.md#d-07-collaborative-editing-engine), and does the chosen collaboration model require P7 access controls?
