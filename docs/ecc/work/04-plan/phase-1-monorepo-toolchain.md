# Phase 1 — Monorepo Base, Vite+ 1.7 Caching, Stylelint, Fallow & Varlock

> **Owned Paths:** Root config files (`package.json`, `pnpm-workspace.yaml`, `vite.config.ts`, `.gitignore`, `.editorconfig`, `.gitattributes`, `.stylelintrc.json`, `.stylelintignore`, `.fallowrc.jsonc`), `.vite-hooks/`, `.vscode/`, `.agents/workflow.md`, `tools/tsconfig/`, `apps/web/.env.schema`, `apps/web/.env.example`.
> **Depends On:** Phase 0 (`_refs/`), [packages-and-versions.md](../../../restructure/research/packages-and-versions.md).

---

## 1. Harvest Reference Skeleton (`_refs/` → Repo Root)

- **Keep from `_refs/cove-monorepo`:** `.gitignore` (add `_refs/`), `.editorconfig`, `.gitattributes`, `.vite-hooks/pre-commit` (`vp staged`), `.vscode/` (remove Tailwind recommendation, add Stylelint if desired), `.agents/workflow.md` (adapt commands to `vpr`), `tools/tsconfig/`.
- **Do NOT copy from `_refs/cove-monorepo`:** `packages/auth`, `packages/db`, `packages/ui` (shadcn/Tailwind), its logging package (SSR/Nitro `evlog` wrapper), `nitro.config.ts`, Drizzle configs, Tailwind deps, or TanStack Start deps.
- **Harvest from `_refs/vite-template`:** `.stylelintrc.json` base rules (`selector-pseudo-class-no-unknown` with `:global`, etc.) and `oxc-config-mantine` Oxlint/Oxfmt pattern. Ignore Yarn files and old `resolutions`.
- **Harvest from `_refs/paper-upper`:** Canonical Vite+ `1.7.0` `pnpm-workspace.yaml` catalog/overrides, `devEngines.packageManager`, and TS `7.0.2` compiler flags (`erasableSyntaxOnly`, `verbatimModuleSyntax`).
- **Do NOT copy from `_refs/tanstack-spa`:** Its `vite.config.ts` and `__root.tsx` use TanStack Start (`routerOnly: false`).

---

## 2. Workspace Catalog (`pnpm-workspace.yaml`) & Root `package.json`

1. Write `pnpm-workspace.yaml` using the exact verified `catalog:` and `overrides: { "vite@*": "catalog:" }` from [packages-and-versions.md](../../../restructure/research/packages-and-versions.md). Do **not** add any `vitest` override or `minimumReleaseAge`.
2. Create root `package.json`:
   - `"packageManager": "pnpm@12.21.0"`
   - `"engines": { "node": "^24.11.0 || >=26.0.0" }`
   - `"devEngines": { "packageManager": { "name": "pnpm", "version": "12.21.0", "onFail": "download" } }`
   - **`devDependencies` (all `"catalog:"`):** `vite-plus`, `oxc-config-mantine`, `stylelint`, `stylelint-config-standard`, `varlock`, `fallow`, `taze`, `@tanstack/eslint-plugin-router`, `@tanstack/eslint-plugin-query`, `@convex-dev/eslint-plugin`, `typescript`.
   - **Zero task-name collisions with `vite.config.ts` `run.tasks`:** Vite+ `1.7` forbids defining the same task name in both `package.json` `scripts` and root `vite.config.ts` `run.tasks`. Keep only non-overlapping mutating/utility scripts in root `package.json`:
     ```json
     "scripts": {
       "format": "vp fmt",
       "check:fix": "vp check --fix",
       "env:load": "varlock load --path apps/web",
       "env:codegen": "varlock codegen --path apps/web",
       "prepare": "vp config && vpr env:codegen",
       "deps": "vpx taze@latest -Ilwr",
       "intent": "vpx @tanstack/intent@latest",
       "skills": "vpx skills@latest"
     }
     ```

---

## 3. Root `vite.config.ts` (Oxlint, Oxfmt, Vitest Projects & Rust Task Caching)

Configure root `vite.config.ts` via `defineConfig` from `"vite-plus"`:

1. **`staged` (Git pre-commit hooks):**
   ```ts
   staged: {
     "*": "vp fmt --no-error-on-unmatched-pattern",
     "**/*.module.css": "vp exec stylelint --fix",
   }
   ```
2. **`run` (Vite Task caching):**
   - Set `run.cache: { tasks: true }` only (keep `scripts: false` so package `dev` scripts are never cached).
   - Define `run.tasks`:
     - `check`: `"vp check"`
     - `lint`: `"vp lint"`
     - `"fmt:check"`: `"vp fmt --check"`
     - `stylelint`: `"vp exec stylelint \"apps/**/*.css\" \"packages/**/*.css\" --cache"`
     - `test`: `"vp test run"`
     - `"convex:typecheck"`: `{ command: "pnpm --filter @repo/backend exec convex typecheck", cache: { input: [{ auto: true }, "!packages/backend/convex/_generated/**"] } }`
     - `fallow`: `"vpx fallow --skip health"`
     - `"env:audit"`: `"vp exec varlock audit apps/web"`
     - `build`: `"vp run -r build"`
     - Uncached long-running tasks (`cache: false`): `dev` (`"vp run -r --parallel dev"`), `"convex:dev"` (`"pnpm --filter @repo/backend exec convex dev"`), `"test:watch"` (`"vp test watch"`).
3. **`fmt` (Oxfmt):**
   - Merge `oxfmt` from `"oxc-config-mantine"` (`...oxfmt`), set `proseWrap: "preserve"`, `sortPackageJson: true`, `sortImports: {}`, and **no** `sortTailwindcss`.
   - `ignorePatterns`: include `oxfmt.ignorePatterns` + `pnpm-lock.yaml`, `**/routeTree.gen.ts`, `packages/backend/convex/_generated/`, `apps/web/env.d.ts`, `dist/`, `_refs/`, `.agents/skills/`.
4. **`lint` (Oxlint):**
   - Merge `oxlint` from `"oxc-config-mantine"`, enable `options: { typeAware: true, typeCheck: true }`, and configure `jsPlugins`:
     - `{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }`
     - `{ name: "eslint-tanstack-router", specifier: "@tanstack/eslint-plugin-router" }`
     - `{ name: "eslint-tanstack-query", specifier: "@tanstack/eslint-plugin-query" }`
     - `{ name: "convex", specifier: "@convex-dev/eslint-plugin" }` (scoped in `lint.overrides` to `files: ["packages/backend/convex/**"]` so Convex rules check backend functions without touching React code).
   - `ignorePatterns`: `dist/`, `**/routeTree.gen.ts`, `packages/backend/convex/_generated/**`, `apps/web/env.d.ts`, `_refs/`, `.agents/skills/`.
5. **`test` (Vitest 5.1 multi-project):**
   - Configure projects once packages exist (or glob-match with `passWithNoTests: true` in Phase 1):
     - `domain`: `packages/domain/**/*.test.ts` (`environment: "node"`)
     - `backend`: `packages/backend/convex/**/*.test.ts` (`environment: "edge-runtime"`)
     - `ui` & `web`: `{apps/web,packages/ui}/**/*.test.{ts,tsx}` (`environment: "jsdom"`, `setupFiles` pointing to `packages/ui/test-utils/vitest.setup.mjs`)

---

## 4. Stylelint, Fallow, TSConfig & Varlock Env Schema

1. **`.stylelintrc.json` + `.stylelintignore`:**
   - `.stylelintignore`: `dist`, `_refs`, `node_modules`, `packages/backend/convex/_generated`.
   - `.stylelintrc.json`: extend `"stylelint-config-standard"`, copy the Mantine `:global` / custom-property relaxations from `_refs/vite-template/.stylelintrc.json`, and add an `overrides` block:
     ```json
     "overrides": [
       {
         "files": ["**/*.module.css"],
         "rules": {
           "color-no-hex": true,
           "function-disallowed-list": ["rgb", "rgba", "hsl", "hsla", "oklch", "oklab"],
           "unit-disallowed-list": ["px", "rem", "em", "pt"]
         }
       },
       {
         "files": ["packages/ui/src/styles/tokens.css", "packages/ui/src/styles/semantic.css"],
         "rules": {
           "color-no-hex": null,
           "function-disallowed-list": null,
           "unit-disallowed-list": null
         }
       }
     ]
     ```
2. **`.fallowrc.jsonc`:**
   - Adapt from `_refs/cove-monorepo/.fallowrc.jsonc`:
     - `entry`: `["apps/web/src/main.tsx", "apps/web/src/routes/**/*.{ts,tsx}", "packages/backend/convex/**/*.ts"]`
     - `workspaces.packages`: `["apps/*", "packages/*", "tools/*"]`
     - `ignorePatterns`: `["**/routeTree.gen.ts", "**/_generated/**", "**/env.d.ts", "_refs/**"]`
     - `ignoreDependencies`: `["@types/node", "vite-plus", "oxc-config-mantine", "@tanstack/eslint-plugin-router", "@tanstack/eslint-plugin-query", "@convex-dev/eslint-plugin", "stylelint", "stylelint-config-standard", "postcss", "postcss-preset-mantine", "postcss-simple-vars", "fallow", "taze", "cross-env"]`
3. **`tools/tsconfig/` (`@repo/tsconfig`):**
   - `package.json` + `base.json`, `react.json`, `node.json` targeting pure TS `7.0.2` (`strict: true`, `moduleResolution: "Bundler"`, `erasableSyntaxOnly: true`, `verbatimModuleSyntax: true`, `resolvePackageJsonImports: true`, `noEmit: true`, `skipLibCheck: true`).
4. **`apps/web/.env.schema` & `apps/web/.env.example`:**
   - Minimal skeleton (before Phase 4 fills `apps/web/package.json`):
     ```ini
     # @defaultRequired=false @defaultSensitive=false
     # @generateTsTypes(path=env.d.ts)
     # ----------

     # Convex deployment URL for Vite SPA client
     # @required @type=url
     VITE_CONVEX_URL=
     ```
   - `.env.example` documents `VITE_CONVEX_URL=https://your-deployment.convex.cloud`.

---

## Gate 1 (Stop & Verify Before Wave 2)

```bash
vp install
vpr env:codegen
vpr check
vpr check     # Immediate re-run must hit Rust cache
vpr stylelint
vpr fallow
```
