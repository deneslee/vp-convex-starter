# Workflow

## Commands

- `vpr check`: Baseline check (Oxfmt + Oxlint with `typeAware: true` and `typeCheck: true`). Never run `tsc --noEmit` separately.
- `vpr stylelint`: Enforce Mantine CSS module design-token rules (`apps/**/*.css` and `packages/**/*.css`).
- `vpr convex:typecheck`: Run Convex backend typechecking (`pnpm --filter @repo/backend exec convex typecheck`).
- `vpr test`: Run all Vitest unit and integration tests once across `domain`, `backend`, `ui`, and `web` projects.
- `vpr build`: Build workspace packages for production verification.
- `vpr fallow`: Run Fallow dead-code and unused-export analysis (`vp exec fallow --skip health`).
- `vpr env:audit`: Validate Varlock env usage against `apps/web/.env.schema` (`vp exec varlock audit --path apps/web`).
- `vpr env:codegen`: Generate `apps/web/env.d.ts` from `apps/web/.env.schema`.

## Long-Running Dev & Watch Modes

- `vpr dev`: Run workspace dev servers in parallel.
- `vpr convex:dev`: Run Convex dev backend sync.
- `vpr test:watch`: Run Vitest in watch mode.

## Formatting & Pre-Commit Hooks

- Oxfmt and Stylelint run automatically on staged files via `.vite-hooks/pre-commit` (`vp staged`).
- Run `vpr format` (`vp fmt`) or `vpr check:fix` (`vp check --fix`) when manual formatting/fixes are needed.
