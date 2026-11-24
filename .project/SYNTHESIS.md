# Synthesis

## Settled

- Showcase endpoint — Produce the native GSD Path planning artifacts through explicit owner approval of the program roadmap. The charter excludes detailed task planning, application implementation and starter configuration changes. ([Charter](CHARTER.md#full-scope-in), [corrections](CHARTER.md#corrections))
- Scenario — Start at P2B-3 AppFrame and RecordTable. P1 and P2A are complete in the simulation. P3 backend and P4 web follow in the scenario, with P5 verification after web integration. The phase table records the dependencies between them. ([Phase table](../docs/restructure/phases.md), [Handoff 4 via charter](CHARTER.md#constraints), [audit rulings](research/DOCS-AUDIT.md#user-rulings))
- Checkout evidence — Use the inspected source baseline for factual claims. The inventory includes UI primitives, web routes and Convex functions, while build, tests, browser behavior, cache hits and hosted behavior remain unverified. ([Codebase evidence, Map and Blocked areas](research/evidence-codebase.md), [Docs Audit, Summary](research/DOCS-AUDIT.md#summary))
- Existing architecture — Preserve the inspected shape as context for the roadmap: Vite+ SPA, Convex backend, shared domain and UI packages, reactive list collections and separate document detail loading. ([Codebase evidence, Map](research/evidence-codebase.md#map))

## Decisions

- None

## For the planner

- **Wave-1 blockers**: Waves are beyond the showcase endpoint. Record the outstanding P2B-5 BlockNote check and workflow decision D-02 as scenario dependencies. Any follow-on runtime verification needs dependencies and generated route, environment and Convex inputs. ([Phase table, Steps](../docs/restructure/phases.md#steps), [D-02](../docs/restructure/decisions.md#d-02-how-heavy-is-the-per-step-workflow), [Codebase evidence, generated entry dependencies](research/evidence-codebase.md#finding-a-fresh-checkout-leaves-generated-entry-dependencies-absent))
- **Walking skeleton**: Begin the roadmap with the P2B-3 continuation, the smallest reviewable outcome at the simulated starting point. Show why remaining UI and backend readiness precede SPA integration and why end-to-end verification follows integration. ([Charter, Vision](CHARTER.md#vision), [Phase table](../docs/restructure/phases.md))
- **Pitfalls → tasks**: For the roadmap, link phase statuses to the scenario and implementation claims to inspection. Carry the separate tier harness, untracked `_refs/` fixtures and the optional semantic search deployment key into the verification risks. Keep sign-in and ownership in the proposed auth scope since the inspected wrappers have no identity check. ([Docs Audit, User rulings](research/DOCS-AUDIT.md#user-rulings), [Codebase evidence, verification and identity findings](research/evidence-codebase.md#finding-the-default-unit-test-task-leaves-the-tier-harness-out))

## User rulings

- Showcase completion → “1. **Approved program roadmap.** Review the milestone sequence and its rationale, then finish the showcase before detailed task planning.” ([Charter, Corrections](CHARTER.md#corrections))
- Audit rows 21–24 → 1. **Keep the source docs as written (`accept-drift`, recommended).** Use their phase labels as the simulation timeline. Cite the inspection whenever the roadmap describes actual code or verification. This preserves the trial’s starting point. ([Docs Audit, User rulings](research/DOCS-AUDIT.md#user-rulings))
- Audit rows 2, 3, 8, 9, 10, 12 and 17 → Accept drift for rows 2, 3, 8, 9, 10, 12 and 17. ([Docs Audit, User rulings](research/DOCS-AUDIT.md#user-rulings))

## Still unknown

- Future product choices — Workflow weight, verification coverage, restructure boundaries and vocabulary, auth provider and access model, and live editing engine remain open in the existing decision queue. External storage retains its existing deferral. These questions belong to any later owner-approved product work. ([Decision queue](../docs/restructure/decisions.md#queue), [Charter, Constraints](CHARTER.md#constraints))
- Future acceptance — The starter behaviors to preserve, the requirement to run semantic search and fixture-dependent checks in a clean checkout, and the unresolved release evidence remain open for any later verification scope. ([Codebase evidence, Open questions for define](research/evidence-codebase.md#open-questions-for-define), [Blocked areas](research/evidence-codebase.md#blocked-areas))
