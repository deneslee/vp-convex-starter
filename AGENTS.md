<!-- gsd-path:begin -->
# AGENTS.md — Operating Rules for the GSD Path Pipeline

These rules govern the router, inspectors, definition facilitators, researchers,
deciders, roadmappers, planners, orchestrators, coders, reviewers, and the discussion
sidecar. Role briefs are bundled with the installed skills. These rules win over role instructions except where the user says
otherwise.

## Authority order

1. The user, in chat.
2. `.project/CHARTER.md` (program flow): program scope, vetoes, and
   corrections bind every milestone. Vetoes may not be researched, planned,
   or built.
3. `.project/intent/INTENT.md`: constraints, vetoes, corrections, and success
   criteria are hard limits. Vetoes may not be researched, planned, or built.
   Only `$gsd-path-define` changes a success criterion, by appending
   `## Corrections`; a task Log or review cannot waive one.
4. `.project/SYNTHESIS.md` (program flow, top level) or
   `.project/research/SYNTHESIS.md` (single milestone): gated decisions are
   settled. Report conflicts; do not override them.
5. The current phase brief or task file.

If two sources disagree, stop and surface the conflict. Never average.

The orchestrator's isolated rerun of a task Verify is that task's evidence.
Wave and ship reviewers read that recorded output plus the isolated diff;
they do not re-run the task command. PLAN.md's project Verify runs once, at
ship, in one sidecar through `workflow_run.py prepare-final`. That runtime owns
execution, output recording, collection, and retry reuse. A complete quick-lane
single full wave with explicit final scope and walkthrough evidence may also
supply final review when the runtime proves unchanged product and contracts.
In that case FINAL.md is a generated view, not a new model assignment.
The project gap is always a view of its recorded command result.
Do not repeat a proven claim or write another narrative of the same evidence.
Verification effort follows uncovered contract claims and actual integration
risk; code line counts and token ratios are observations, never scope targets.
A task Verify must not copy the project command unless an
owned success criterion names it. Any other task Verify must name a path
from that task's `files`. INTENT constraints about not running the
full-repo suite on a tiny edit outrank the phase brief.

## Files are the only memory

- Start from disk, not conversation. If an input is absent from `.project/`,
  report it instead of inventing it.
- A discussion answer with `Status: final` or `NEEDS-USER`, `Follow-up:
  required`, and no later `Disposition X###` receipt is pending. Before phase
  work and again before a phase gate, the router and current phase run the
  active skill's bundled `scripts/discussion_records.py pending --repo
  <absolute-root>` helper; when `.project/discuss/` is absent it returns an
  empty list, so continue. Do not parse IDs, pair records, recover writes, or
  route pending receipts through model reasoning. The named owner either
  updates the target artifact through a legal current-phase gate and uses the
  helper's `dispose` command to append an `applied` disposition, or appends
  `acknowledged-no-change` with evidence. If applying it would rewrite an
  approved earlier-phase contract or the owner cannot legally enter, block the
  current phase with links to ANSWERS.md and the target artifact and ask the
  user; never auto-advance or archive it. Only the user may authorize
  `rejected-by-user`.
- After a phase completes its gate and state update, run the bundled
  `pipeline_state.py status --repo <absolute-root>` with the routed
  `--project-dir`. Its `handoff` is the shared phase handoff for chat and the
  dashboard. Present **Outcome** from `handoff.outcome` plus the completed
  work; **Review** links the phase artifact, or `handoff.review` when absent.
  An active router uses `handoff.router_next` for **Next** and follows the
  returned route. A directly invoked phase uses `handoff.phase_next` and
  stops. A status or plain-prompt reply uses `handoff.next` and stays read-only.
  Convert the `$` invocation prefix to the host's slash form when needed.
  Phase owners still stop for required input and approval before completion;
  a route is not approval. Return to an active caller instead of invoking an
  explicit-only sibling skill. Derive the next phase from this result, not
  from another lane table in prose.
- Phase skills bundle the remaining rules in `references/operating-rules.md`;
  read it before phase work.

## Plain-prompt re-entry

<!-- gsd-path/plain-prompt-reentry/v1 -->

- On a turn that did not explicitly invoke a GSD Path skill, check for
  `.project/STATE.md`. When it exists, first select the compatible interpreter:
  probe `python3 -B -c "import sys; raise SystemExit(sys.version_info < (3, 9))"`,
  then probe `python -B -c "import sys; raise SystemExit(sys.version_info < (3, 9))"`
  only if the first command fails. Run the first successful interpreter
  with `-B .gsd-path/status_runtime.py --repo <absolute-root>`
  before any requested repository mutation. Treat its JSON as the only route
  authority.
  When `completion.status` is `verified` and `git.branch` is an ordinary
  branch (not `gsd-path/M###`), requested product work may proceed normally.
  Archives and pipeline control files remain protected. Otherwise,
  a plain change request does not authorize work outside the pipeline: make no
  changes and report **Outcome**, link the returned `path` under **Review**, and
  under **Next** use `handoff.next`. An explicit request to leave
  or bypass the pipeline is a user ruling;
  route it through the router's undo or abandon flow instead of editing directly.
- After any other plain-prompt turn with owned state, rerun the same read-only
  status command immediately before the final response and append the same
  **Outcome** / **Review** / **Next** handoff with the same shared handoff rule.
  Keep an informational turn read-only from start to finish: do not use repository
  mutation tools or run commands that can create or alter files. A GSD Path skill
  already supplies this handoff, so emit it once. With no STATE.md, respond
  normally and do not initialize the pipeline. A missing runtime or invalid
  status blocks mutation and routes to `$gsd-path-forensics`.

## Evidence and honesty

- Claims need checked sources, decisions need citations, and verdicts need
  reproduced evidence. Never report a command as passing unless it ran.
- Report partial or failed results plainly. Silent partial success is the
  worst outcome.
- Preserve uncertainty as `NEEDS-USER`, `RESEARCH`, or a confidence level.
  Questions never silently disappear between phases.
- Record user corrections and vetoes verbatim.

## Gates

- Same-wave dependencies execute in dependency order; a task dispatches as
  soon as its dependencies land, never idling behind unrelated
  in-flight tasks. Only ready tasks run.
- Parallel dispatch rounds use distinct linked worktrees, each created at the
  clean primary HEAD recorded as its task base at dispatch. A serial dispatch
  round (one ready task) works and lands on the bound branch in the primary
  worktree. Task and reviewer Verify run against that recorded base plus only
  the task patch; evidence from a shared worktree or combined branch tip does
  not count.
- A wave advances only after every task and the wave review pass.
- Final review blocks on any `not-met`, `unverifiable`, or blocked gap verdict.
- STATE.md becomes `shipped` only when every final verdict and the project
  verify pass; the router reports shipped only after the integration
  validator (`validate-integrated`) passes.
- Shipping archives the milestone: artifacts move to
  `.project/archive/<NNN>-<slug>/` with a manifest, and the ship phase
  records the ship commit (STATE.md, final reviews, archive) as its single
  commit on the bound branch. Archives are read-only —
  no agent may modify or delete them — and a new milestone may not begin
  while an un-archived shipped milestone's artifacts sit in the active paths.
- STATE.archive is the crash-recovery transaction id. It is persisted before
  moves and never recomputed. Keep review active until the prepared archive,
  canonical contents, carry-forward, and manifest pass the bundled precommit
  validator; report shipped only after the exact `.project/`-only ship commit
  passes the postcommit validator and `validate-integrated` proves the
  integration landing, its tag, and its ancestry on origin/main —
  while integration is pending the router routes back to ship instead of
  reporting shipped or starting the next milestone.

## Asking the user

- Ask through an interactive user-input tool when the runtime provides one;
  otherwise ask concise numbered questions in chat and stop for the reply.
- Before any approval, ruling, `NEEDS-USER` question, blocked escalation, or
  phase-completion handoff, present three things in order: **Outcome** — what
  was produced or learned; **Review** — a Markdown link to the primary
  canonical artifact using its resolved absolute path; **Next** — the one
  question or action now required. Any text the user is expected to send back
  verbatim — a ruling, an approval command, a reply — goes in its own fenced
  code block, never a blockquote or inline prose, so it pastes cleanly. If the
  host cannot render local links, print
  the resolved absolute path immediately after the link. On an output failure,
  link the malformed artifact when it exists; otherwise link STATE.md or the
  canonical log that proves the failure and say the expected artifact is
  missing. Never ask for approval before its reviewable artifact exists on
  disk, and never ask a bare "approve?" without its outcome and link.
- Every choice offered to the user names a recommended option — listed first
  and marked `(recommended)` — with a one-line reason grounded in evidence,
  intent, or the codebase, followed by the real alternatives. A pure values
  call with no evidence either way carries no recommendation; say so
  explicitly instead of inventing one.
- After a user decision, confirm what changed, link the updated artifact again,
  and state whether the active router continues automatically or which exact
  explicit skill the user should invoke next.

## Escalation

Stop and ask the user only when:

- proceeding would violate a hard constraint or veto;
- the review loop reaches its cycle cap;
- a `NEEDS-USER` item reaches a phase checkpoint; or
- sources of truth conflict and INTENT.md does not make the resolution clear.

Handle everything else autonomously and record it in the task log or
STATE.md.

## Style

- Write fixed-format data for the next agent, without pleasantries.
- Write short, plain-English outcomes for the user.
- Keep agent final messages to paths, statuses, verdicts, and evidence.

## Distribution layout

This section describes the GSD Path source checkout. These source paths and
the sync command do not apply to an application that only installs GSD Path.
In a consuming project, resolve roles, templates, and helpers from the active
installed skill's absolute paths; the application need not contain this layout.

| Path | Purpose |
|------|---------|
| `plugin.json` | Agent Plugins manifest (`agent-plugins.org` 1.0.0 schema) |
| `skills/` | Skills and aliases declared in `scripts/skill-resources.json` |
| `skills/gsd-path/templates/` | Required artifact formats |
| `skills/gsd-path/references/` | Agent role and dispatch contracts |
| `WORKFLOW.md` | Phase-by-phase SOP |

Edit canonical resources only: `skills/gsd-path/` templates and references,
each per-skill `SKILL.md`, `scripts/`, and
`platforms/shared-agents/dispatch.md`. Every per-skill `references/`,
`templates/`, and `scripts/` copy is generated — run `python3
scripts/sync_skill_resources.py` after editing a canonical source. Sync
overwrites divergent generated copies and warns when a divergent copy is
newer than its canonical source (the wrong-direction-edit signature); treat
that warning as a lost edit and re-apply it to the canonical path.
<!-- gsd-path:end -->

# AGENTS.md

Strict engineering rules for this monorepo. Follow without exception.

## Planning mode

This repository is in **restructure review mode**: its plan, docs and the `apps/web` folder layout are open for reconsideration.

**Start here:** [docs/restructure/README.md](docs/restructure/README.md). It holds the current phase, what is blocked, the next action and the reading order.

- **Docs are claims, not facts.**
  - This covers `docs/**`, `apps/docs/**`, earlier plans, and agent or AI recommendations (Claude, ChatGPT, Gemini, ECC).
  - Check claims against code, config, tests or primary sources before relying on them. Where they differ, the code wins: record the difference.
- **Keep four things apart** in everything you write: verified facts with evidence (`file:line` or a URL); the user's requirements; proposals; open questions.
- **Only the user accepts a decision.** Nothing moves to `accepted` in [docs/restructure/decisions.md](docs/restructure/decisions.md) or becomes an ADR without the user's explicit approval.
- **Ask first.** Do not change application code, move files or delete anything without the user's explicit approval for that change. Editing the planning docs under `docs/restructure/` and `docs/adr/` is allowed.
- **One owner per fact.** Link to the owning doc instead of copying it ([docs/restructure/README.md](docs/restructure/README.md) lists the owners).
- **Steps.** Run each step per [docs/restructure/workflow.md](docs/restructure/workflow.md): spec, approval, change, checks, review, approval to commit.

## 0. React and programming best practices
- Always apply best practices: seperation of concern(Ui only does UI, business logic -> hook, data handling (consider provider pattern?) are seperate)

## 1. Package Manager & CLI (`vp` / `vpr` / `vpx` + `pnpm`)
- Use `vp`, `vpr` (`vp run`), `vpx`, and `pnpm` (`pnpm@12.21.0`) exclusively.
- Run repo tasks via `vpr <task>` so Vite+ Rust Vite Task caches hit. Never run `tsc --noEmit` separately — `vpr check` runs Oxfmt + Oxlint (`typeAware: true`, `typeCheck: true`).
- Never hand-edit generated files: `**/routeTree.gen.ts`, `packages/backend/convex/_generated/**`, `apps/web/env.d.ts`.

## 2. Mantine MCP — Check Components & Hooks First (MANDATORY)
- Before building any UI component, layout pattern, form input, overlay, or custom React utility hook, **query `mantine-mcp` first** (`list_items`, `search_docs`, `get_item_doc`, `get_item_props`, `get_api`).
- **Components:** Never build from scratch what Mantine v9 already ships (`@mantine/core`, `@mantine/notifications`, `@mantine/dropzone`, `@mantine/lightbox`, etc.). Verify via `mantine-mcp`, then compose inside `packages/ui`.
- **Hooks:** Always check `@mantine/hooks` via `mantine-mcp` before writing a custom hook (e.g., `useDisclosure`, `useDebouncedValue`, `useDebouncedCallback`, `useClipboard`, `useHotkeys`, `useMediaQuery`, `useLocalStorage`, `useViewportSize`, `useElementSize`, `useIntersection`, `useMergedRef`). Write a custom hook only when no Mantine hook covers the behavior.

## Context7 mcp
- When working on other things like react, ts etc use context7 mcp to get advice first, then implement.

## 3. Mantine UI, Theming & Stylelint (STRICT)
- Theme lives ONLY in `packages/ui/src/theme/theme.ts` (`createTheme`) and `packages/ui/src/theme/cssVariablesResolver.ts`.
- Design tokens live ONLY in `packages/ui/src/styles/`: `tokens.css` (primitive scales) and `semantic.css` (light + `[data-mantine-color-scheme="dark"]` semantic vars: `--surface-*`, `--border-*`, `--text-*`, `--accent-*`, `--status-*`, `--space-*`, `--radius-*`, plus BlockNote `--bn-colors-*` mapped to those semantic vars). `cssVariablesResolver.ts` only bridges Mantine internal `--mantine-*` vars where needed — never duplicate token definitions across both files.
- Configure Mantine defaults in `theme.components.<Name>.defaultProps` and `classNames`.
- **Prop rules (`apps/web` JSX):**
  - **Banned on Mantine components:** visual, layout, and box-model props (`p`, `px`, `py`, `pt`, `pb`, `pl`, `pr`, `m`, `mx`, `my`, `mt`, `mb`, `ml`, `mr`, `c`, `bg`, `fz`, `fw`, `lh`, `ta`, `bd`, `bdrs`, `radius`, `shadow`, `w`, `h`, `miw`, `maw`, `mih`, `mah`, `pos`, `top`, `left`, `right`, `bottom`, `display`, `opacity`, `style`, `styles`).
  - **Allowed:** typed semantic domain props on `@repo/ui` primitives (`intent`, `status`, `density`, `viewMode`) and functional/a11y props (`aria-*`, `disabled`, `loading`, `type`, `fullWidth`, `opened`, `onClose`). Never pass ad-hoc visual `variant`, `color`, `size`, or `gap` overrides on raw Mantine primitives in `apps/web`; expose semantic variants via `@repo/ui` or `createTheme`.
- When `defaultProps` cannot express a layout or state style, use a colocated `*.module.css` using **only** semantic CSS vars from `packages/ui/src/styles/`.
- **Stylelint (`vpr stylelint`):** Mechanically bans raw hex colors (`color-no-hex`), raw color functions (`function-disallowed-list`: `rgb`, `rgba`, `hsl`, `hsla`, `oklch`, `oklab`), and raw sizing units (`unit-disallowed-list`: `px`, `rem`, `em`, `pt`) in `**/*.module.css` (allowed only in `packages/ui/src/styles/tokens.css`).

## 4. Environment Variables (`varlock` + Convex `defineApp({ env })`)
- `apps/web`: `apps/web/.env.schema` is the single source of truth. Import `ENV` from `varlock/env` instead of reading `import.meta.env` or `process.env`. Validate with `vpr env:audit` or `vp exec varlock load --agent --path apps/web`. Never commit or read `.env.local`.
- `packages/backend`: Declare typed backend env vars in `packages/backend/convex/convex.config.ts` via `defineApp({ env: { ... } })` and import `env` from `./_generated/server` (not `process.env`).

## 5. Monorepo Boundaries (Unidirectional DAG)
- `packages/domain` (`@repo/domain`): Pure TypeScript + Zod v4 schemas, domain types, Markdown frontmatter/chunk helpers, `createClientId()`. **Zero** React, Mantine, Router, or `convex/server` imports.
- `packages/backend` (`@repo/backend`): Convex schema, functions, `@convex-dev/rag`, `@convex-dev/workpool`, storage, `convex-test` suites. Exports only `_generated/api`, `_generated/dataModel`, and safe client constants. **Zero** React/UI imports.
- `packages/ui` (`@repo/ui`): Mantine v9 theme, semantic CSS variables, BlockNote (`@blocknote/mantine`), dumb presentational primitives. **Zero** Convex, TanStack Router/Query/DB, or Zustand imports.
- `apps/web` (`@repo/web`): Pure Vite+ SPA composition layer (TanStack Router SPA, TanStack DB, TanStack Query, Zustand UI stores, feature slices). Imports `@repo/ui`, `@repo/domain`, `@repo/backend`. *(Note: `cove-monorepo`'s logging package is intentionally omitted because it is an SSR/Nitro `evlog` wrapper.)*

## 6. State Ownership
- **TanStack DB (`@tanstack/convex-db-collection`)**: Reactive lists needing local filtering/sorting/joins or optimistic writes (tables require `clientId`, queries must be bounded with `.take(n)`, and `documents` DB collection subscribes to summaries only without inline `markdown`).
- **TanStack Query (`@convex-dev/react-query`)**: Single-item details (including full Markdown bodies), route-loader warming, and RAG semantic search actions.
- **TanStack Router**: URL search params and active route/view/filter state.
- **Zustand**: Ephemeral client UI state ONLY (sidebar/inspector state, selection IDs, editor mode, lightbox index, upload queue). Never mirror Convex records in Zustand.

## 7. Verification & Code Health
- **Baseline loop:** `vpr check`, `vpr stylelint`, `vpr convex:typecheck`, `vpr test`
- **Phase sign-off:** `vpr build`, `vpr fallow`, `vpr env:audit`

<!-- convex-ai-start -->
## Convex Guidelines
Before writing Convex code, read `packages/backend/convex/_generated/ai/guidelines.md` and `.agents/skills/*/SKILL.md` — their rules override training data.
<!-- convex-ai-end -->

<!-- intent-skills:start -->
## TanStack Intent Skills
Before substantial TanStack Router/Query/DB changes, run `vpx @tanstack/intent@latest list` and load matching skills via `vpx @tanstack/intent@latest load <package>#<skill>`.
<!-- intent-skills:end -->

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Running Scripts

Run TypeScript and JavaScript files with `vpx <file>`, for example `vpx ./scripts/seed.ts --dry-run`. It handles enums, decorators, JSX, and tsconfig `paths`, so do not add `tsx` or `ts-node` to run scripts. `vpx --watch <file>` reruns the file when a file it uses changes, in place of `tsx watch`. `vp node <file>` runs plain Node.js.

## Tool Versions

Run `vp toolchain` to show versions and relationships in the active Vite+
release. Add a tool name to select part of the graph. For example, run
`vp toolchain vite`. Use `--global` to ignore the local `vite-plus` package. Use
`vp why <package>` to show the package-manager dependency graph.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->
