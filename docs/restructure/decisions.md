# Decisions

This file is the queue of decisions for the project. It owns the _status_ of every decision; the reasoning of an accepted decision lives in its ADR.

**Statuses**

| Status                | Meaning                                                                         |
| --------------------- | ------------------------------------------------------------------------------- |
| `open`                | Not yet discussed                                                               |
| `proposed`            | It has a recommendation, but **not** your approval                              |
| `accepted → ADR-NNNN` | You approved it, and the ADR in [../adr/](../adr/README.md) holds the reasoning |
| `rejected`            | Turned down, with a one-line reason                                             |
| `deferred`            | Postponed, with a one-line reason                                               |

A recommendation comes from research or from an agent (Claude, ChatGPT, Gemini, ECC). It is never a decision. Only you move an entry to `accepted`.

**Entry format.** Each entry gives:

- the question;
- the evidence, as links;
- the options;
- the recommendation, with who made it;
- the status;
- what it blocks.

D-01 to D-04 are complete. The others are thin on purpose: their options and recommendations are filled in, with focused research, when their phase starts.

## Your answers so far (requirements, not yet ADRs)

These are written in `AGENTS.md` and the old plan ([../ecc/work/04-plan.md](../ecc/work/04-plan.md)), 2026-11-20 and 2026-11-21. Each is a requirement. An ADR is written only when you ask for one.

| #   | Topic           | Your answer                                                                                                        | Where it is written                                                                                   |
| --- | --------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| A-1 | App shape       | A pure Vite+ SPA. No TanStack Start, no SSR, no Nitro. Convex is the only backend                                  | `AGENTS.md` §5; old plan, target layout                                                               |
| A-2 | State owners    | TanStack DB for lists, TanStack Query for details and search, the Router for URL state, Zustand for UI state only  | `AGENTS.md` §6                                                                                        |
| A-3 | File storage v1 | Native Convex storage; switch only when the free tier is too small                                                 | [research/storage-and-auth-options.md](research/storage-and-auth-options.md) §1                       |
| A-4 | Editor          | BlockNote 0.57 with Mantine, plus a raw Markdown mode                                                              | [research/markdown-editor-options.md](research/markdown-editor-options.md) §1                         |
| A-5 | Auth v1         | One user, no login; every Convex function goes through the `app*` wrappers so auth can be added in one place      | [research/storage-and-auth-options.md](research/storage-and-auth-options.md) §2                       |
| A-6 | Code split      | UI only does UI; business logic goes in hooks; data handling is separate                                           | `AGENTS.md` §0                                                                                        |

## Queue

### D-01 Auth provider

- **Question:** which provider adds sign-in when the app gets several users (P7)?
- **Evidence:** [research/storage-and-auth-options.md](research/storage-and-auth-options.md) §2; G-004 in [research/current-state.md](research/current-state.md).
- **Options:**
  - (a) Better Auth through `@convex-dev/better-auth`;
  - (b) Convex Auth v2 (`@convex-dev/auth`);
  - (c) Clerk with `ConvexProviderWithClerk`.
- **Recommendation (research):** (a), for several users. The research file calls it the best fit with TanStack Router and Query.
- **Status:** `proposed`
- **Blocks:** P7.

### D-02 How heavy is the per-step workflow?

- **Question:** what does each step need before it starts and before it is committed?
- **Evidence:** [workflow.md](workflow.md) is the proposed routine; the old plan used one "verification gate" per phase ([../ecc/work/04-plan.md](../ecc/work/04-plan.md)).
- **Options:**
  - (a) a spec, an impact check, a council run and a review for every step;
  - (b) scale with risk: a spec, a verification and a rollback note always; impact and council only for high-risk steps;
  - (c) minimal: the old phase gate only.
- **Recommendation (Claude):** (b).
- **Status:** `proposed`
- **Blocks:** the next step that starts (P2B-4 or P3).

### D-03 Where does feature data access live?

- **Question:** in P6, does each slice own a `data/` folder, or does one provider in `src/app/` or `src/data/` serve all slices?
- **Evidence:** G-003 in [research/current-state.md](research/current-state.md); `apps/web/src/data/` already holds `clients.ts`, `collections.ts` and `uploadAsset.ts`.
- **Options:**
  - (a) one `data/` folder per slice; `src/data/` keeps only the shared clients;
  - (b) one shared data layer in `src/data/`; slices hold only `ui/` and `hooks/`;
  - (c) a provider (React context) in `src/app/` that slices read through hooks.
- **Recommendation:** none yet. Research when P6 starts.
- **Status:** `open`
- **Blocks:** P6.

### D-04 Can hooks import Convex directly?

- **Question:** may a feature hook call `convexClient` or `api.*`, or must it go through the data layer from D-03?
- **Evidence:** G-003: `useDocumentsFeature.ts:43` and `useWorkspaceSearch.ts:33` call Convex directly today.
- **Options:**
  - (a) yes, hooks may call Convex;
  - (b) no, only the data layer calls Convex; hooks call the data layer.
- **Recommendation (Claude):** (b), because it is what A-6 asks for. Depends on D-03.
- **Status:** `open`
- **Blocks:** P6.

### D-05 How is the layer split enforced?

- **Question:** oxlint `no-restricted-imports`, fallow boundaries, or both? Today nothing enforces AGENTS.md §5 (G-005).
- **Status:** `open`
- **Blocks:** P6.

### D-06 Coverage target

- **Question:** a coverage number, or "every changed behaviour has a test"?
- **Status:** `open`
- **Blocks:** P5.

### D-07 Collaborative editing engine

- **Question:** `@convex-dev/prosemirror-sync` with BlockNote, or a change of editor? See [research/markdown-editor-options.md](research/markdown-editor-options.md) §2–§3.
- **Status:** `open`
- **Blocks:** P8.

### D-08 External file storage

- **Question:** when and to what do we move off native Convex storage (R2, Files Control, ConvexFS)?
- **Status:** `deferred`: not needed until file bandwidth nears 1 GB a month (A-3).
- **Blocks:** nothing now.

### D-09 Shared vocabulary

- **Question:** one glossary for code, docs and issues. Write it once D-03 and D-04 settle (G-010).
- **Status:** `open`
- **Blocks:** P6 renames.
