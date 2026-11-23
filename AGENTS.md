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

## Agent skills

### Issue tracker

Use GitHub Issues in `deneslee/vp-convex-starter` for skill specs, tickets, and wayfinder maps. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the five default labels when a skill requests triage. See `docs/agents/triage-labels.md`.

### Domain docs

This repo uses a multi-context layout with a root glossary map and shared ADRs. See `docs/agents/domain.md`.

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
