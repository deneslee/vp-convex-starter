# Capability catalog: core

<!-- Generated from catalog/catalog.yaml by scripts/generate-catalog.mjs. Edit the YAML, not this file. -->

What the starter is made of: the fixed foundations, the core capabilities with what each must do and which providers can fill it, and the plugins (Convex components and libraries) that are built or decided. Proposals and ideas are in [potential.md](potential.md).

**Status words:** fixed (built on, never swapped), built, decided, default (the pick unless a decision changes it), option, proposed, later, open (needs a decision), reference (to learn from). Steps P1–P8 are the phases in docs/restructure/phases.md.

## Fixed foundations

Built on and never swapped. Everything else is a capability with a default provider.

| Area | Choice | Notes |
| --- | --- | --- |
| Frontend | React 19 with TypeScript 7, strict | – |
| Build and tooling | Vite+ (Vite, Vitest, Oxlint, Oxfmt, Vite Task); pnpm workspaces | Stylelint bans raw colours and units in module CSS; fallow finds dead code; varlock checks env |
| App shape | A pure SPA; no SSR, no server routes | – |
| Backend | Convex | The only backend; every function goes through the app wrappers |
| Routing | TanStack Router, file-based | – |
| Server state | TanStack DB for lists, TanStack Query for details and search | – |
| Client state | Zustand, UI state only | – |
| Validation | Zod 4 | Domain schemas live in packages/domain |
| UI system | Mantine 9, CSS Modules, semantic design tokens | Mantine components first, checked through the Mantine MCP |

## Core capabilities

Each always exists in the app. "Must" is what any provider has to keep working; the default is what gets built first.

### Data

| Capability | Must | Default | Can be swapped or extended with | Status | Step |
| --- | --- | --- | --- | --- | --- |
| **Records.** Structured rows with title, category, status, tags and attributes | Optimistic create and edit<br>Lists bounded with .take(n) | A Convex table synced into a TanStack DB collection | – | Decided | P3, P4 |
| **Markdown documents** | Markdown is the stored format<br>Lists load summaries only, never the body | A Convex table; large bodies in Convex storage | Import from .md files with frontmatter | Decided | P3, P4 |
| **Assets** | Three-step upload<br>Delete removes the stored file | Native Convex storage | Cloudflare R2<br>Files Control<br>ConvexFS | Decided | P3, P4 |
| **Live updates** | A change in one tab shows in every open tab | Convex subscriptions | – | Built | P3 |

### Search

| Capability | Must | Default | Can be swapped or extended with | Status | Step |
| --- | --- | --- | --- | --- | --- |
| **Keyword search** | – | Convex search indexes on records and documents | – | Decided | P3 |
| **Semantic search** | Indexing runs in the background and reports its status | The Convex RAG component, fed by a Workpool | – | Decided | P3 |

### Editing

| Capability | Must | Default | Can be swapped or extended with | Status | Step |
| --- | --- | --- | --- | --- | --- |
| **Markdown editor** | A raw Markdown mode | BlockNote 0.57 with Mantine | Mantine Tiptap | Decided | P2B |
| **Theme and tokens** | – | One Mantine theme; primitive and semantic CSS variables | – | Built | P2B |

### Platform

| Capability | Must | Default | Can be swapped or extended with | Status | Step |
| --- | --- | --- | --- | --- | --- |
| **Sign-in.** v1 has one user and no sign-in | Identity is checked once, in the Convex wrappers | Better Auth | Convex Auth v2<br>Clerk | Default | P7 |

## Plugins built or decided

What each plugin provides (the core capabilities it can fill) and what it adds on top.

| Plugin | Provides | Adds | Runs | Status | Step |
| --- | --- | --- | --- | --- | --- |
| **@convex-dev/rag** | Semantic search | – | Convex | Decided | P3 |
| **@convex-dev/workpool** | Semantic search | A queue for indexing jobs | Convex | Decided | P3 |
| **convex-helpers** | Sign-in | The app wrappers for queries, mutations and actions | Convex | Built | P3 |
