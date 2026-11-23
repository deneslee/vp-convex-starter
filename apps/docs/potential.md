# Capability catalog: potential

<!-- Generated from catalog/catalog.yaml by scripts/generate-catalog.mjs. Edit the YAML, not this file. -->

Capabilities, plugins and patterns under consideration: nothing here is planned until it moves to [core.md](core.md).

**Status words:** fixed (built on, never swapped), built, decided, default (the pick unless a decision changes it), option, proposed, later, open (needs a decision), reference (to learn from). Steps P1–P8 are the phases in docs/restructure/phases.md.

## Capabilities that could be added

| Capability | What it adds | Candidates | Status |
| --- | --- | --- | --- |
| **Collaborative editing** | Two people edit one document at the same time | prosemirror-sync with BlockNote<br>prosemirror-sync with Tiptap | Proposed |
| **Presence** | Who else has a document open | The Convex presence component | Later |
| **Assistant** | Chat threads over the user's documents | The Convex agent component with RAG | Later |
| **Counts and pagination at scale** | Counts, sums and offset pages without full scans | The Convex aggregate component | Later |

## Plugins and integrations under consideration

What each could provide (core or potential capabilities it can fill) and what it adds on top.

### Storage

| Plugin | Provides | Adds | Status | Notes |
| --- | --- | --- | --- | --- |
| **@convex-dev/r2** | Assets | Zero-egress CDN URLs | Option | Deferred (D-08) |

### Auth

| Plugin | Provides | Adds | Status | Notes |
| --- | --- | --- | --- | --- |
| **@convex-dev/better-auth** | Sign-in | – | Proposed | D-01, recommended by research |
| **@convex-dev/auth** | Sign-in | – | Option | D-01 |
| **Clerk** | Sign-in | – | Option | D-01; managed, free up to 10k monthly users |

### Collaboration

| Plugin | Provides | Adds | Status | Notes |
| --- | --- | --- | --- | --- |
| **@convex-dev/prosemirror-sync** | Collaborative editing | – | Proposed | D-07 |
| **@convex-dev/presence** | Presence | – | Later | – |

### AI

| Plugin | Provides | Adds | Status | Notes |
| --- | --- | --- | --- | --- |
| **@convex-dev/agent** | Assistant | – | Later | – |

### Data

| Plugin | Provides | Adds | Status | Notes |
| --- | --- | --- | --- | --- |
| **@convex-dev/aggregate** | Counts and pagination at scale | – | Later | – |

## Patterns and references

Ideas to borrow from other products, not dependencies.

| Pattern | From | For | Status |
| --- | --- | --- | --- |
| Vite+ monorepo layout | [cove-monorepo](https://github.com/mugnavo/cove-monorepo) | Workspace layout, shared tsconfig, hooks, fallow and varlock | Reference |
| Mantine Vite+ set-up | [mantinedev/vite-template](https://github.com/mantinedev/vite-template) | PostCSS, Stylelint and test utilities for Mantine | Reference |
| Convex with TanStack Query | [TanStack Router examples](https://github.com/TanStack/router/tree/main/examples/react/start-convex-trellaux) | convexQuery, suspense queries and route-loader warming | Reference |
| Collaborative editor | [Convex examples](https://www.convex.dev/examples/collaborative-editor) | Wiring prosemirror-sync with BlockNote | Reference |
