# Packages & Verified Versions (Single Source of Truth)

Last verified: not re-verified. Moved as-is from `plans/packages-and-versions.md` at commit `898e983`, 2026-11-21. External claims were not re-fetched; check versions before you use them.

All versions below were verified against npm (`latest` as of 2026-11-20). Use `catalog:` in workspace `package.json` files and keep exact versions centralized in `pnpm-workspace.yaml`.

---

## Verified `pnpm-workspace.yaml` Catalog

```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "tools/*"

allowBuilds:
  esbuild: true

# Keep exact versions in catalog/package.json; do not enable minimumReleaseAge so latest installs immediately
savePrefix: ""
catalogMode: prefer

catalog:
  # Toolchain & Quality
  vite-plus: 1.7.0
  vite: npm:@voidzero-dev/vite-plus-core@8.3.8000
  typescript: 7.0.2
  oxc-config-mantine: 1.0.3
  stylelint: 18.1.0
  stylelint-config-standard: 41.1.0
  varlock: 1.25.0
  "@varlock/vite-integration": 1.5.6
  fallow: 3.45.0
  taze: 21.3.0
  cross-env: 10.1.0

  # React & Build Plugins
  react: 19.3.1
  react-dom: 19.3.1
  "@types/react": 19.3.0
  "@types/react-dom": 19.3.0
  "@types/node": 26.6.6
  "@vitejs/plugin-react": 6.3.0

  # Testing
  jsdom: 31.0.1
  "@testing-library/react": 16.3.3
  "@testing-library/dom": 10.4.2
  "@testing-library/jest-dom": 8.0.0
  "@testing-library/user-event": 14.6.13
  convex-test: 0.0.73
  "@edge-runtime/vm": 5.0.0

  # Mantine v9 (exact-matched patch) + Icons + PostCSS
  "@mantine/core": 9.8.2
  "@mantine/hooks": 9.8.2
  "@mantine/notifications": 9.8.2
  "@mantine/dropzone": 9.8.2
  "@mantine/lightbox": 9.8.2
  embla-carousel: 8.6.0
  embla-carousel-react: 8.6.0
  postcss: 8.5.33
  postcss-preset-mantine: 1.18.0
  postcss-simple-vars: 7.0.1
  lucide-react: 1.77.0

  # BlockNote (Mantine v9 + React 19 compatible)
  "@blocknote/core": 0.57.0
  "@blocknote/react": 0.57.0
  "@blocknote/mantine": 0.57.0

  # TanStack (Pure SPA + Query + DB)
  "@tanstack/react-router": 1.170.46
  "@tanstack/router-plugin": 1.169.0
  "@tanstack/react-query": 5.108.2
  "@tanstack/db": 1.0.0-rc.1.5
  "@tanstack/react-db": 1.0.0-rc.1.5
  "@tanstack/convex-db-collection": 1.0.0-rc.1.5
  "@tanstack/intent": 0.5.6
  "@tanstack/eslint-plugin-router": 1.162.0
  "@tanstack/eslint-plugin-query": 5.108.2
  "@tanstack/devtools-vite": 0.8.7
  "@tanstack/react-devtools": 0.10.15
  "@tanstack/react-router-devtools": 1.167.4
  "@tanstack/react-query-devtools": 5.108.2

  # Convex + RAG + Workpool + AI + Domain/Client State
  convex: 1.51.0
  convex-helpers: 0.1.136
  "@convex-dev/react-query": 0.1.0
  "@convex-dev/rag": 0.7.9
  "@convex-dev/workpool": 0.5.0
  "@convex-dev/eslint-plugin": 5.0.1
  ai: 7.0.178
  "@ai-sdk/openai": 4.0.122
  zod: 4.6.7
  zustand: 5.1.0

overrides:
  vite@*: "catalog:"
```

---

## Compatibility Constraints & Traps to Avoid

1. **Vite override only — no Vitest override:** Keep `overrides: { "vite@*": "catalog:" }` only. `vite-plus@1.7.0` bundles `vitest@5.1.0` directly; overriding `vitest` with an older wrapper breaks Vitest v5 support (`@testing-library/jest-dom@8.0.0` peers `vitest: >=5 <6`).
2. **Pure TypeScript `7.0.2`:** Supported natively by `vite-plus@1.7.0`, `convex@1.51.0`, `convex-helpers@0.1.136`, and `@tanstack/eslint-plugin-query@5.108.2`. Never alias `typescript` to TS6 compatibility packages, which hides the `tsc` binary from Convex CLI.
3. **TanStack DB `@latest` (not `rc` dist-tag):** `@tanstack/convex-db-collection`, `@tanstack/db`, and `@tanstack/react-db` all publish `1.0.0-rc.1.5` under `@latest` (`@tanstack/convex-db-collection` has no `rc` tag, and `rc` on the others points to older `1.0.0-rc.1`). `@tanstack/convex-db-collection@1.0.0-rc.1.5` also bundles `@tanstack/offline-transactions@1.2.1` and exposes `./offline`.
4. **Mantine exact patch + Lightbox peers:** Pin all `@mantine/*` packages to exact `9.8.2` (add-ons pin exact `@mantine/core` patch in `peerDependencies`). Include `embla-carousel` and `embla-carousel-react` (`>=8.0.0`) required by `@mantine/lightbox@9.8.2`.
5. **BlockNote stylesheet clash prevention:** `@blocknote/mantine@0.57.0` officially supports `@mantine/core@^9.0.2` and React 19. Import `@blocknote/mantine/blocknoteStyles.css` (and `@blocknote/core/fonts/inter.css` if needed) rather than `@blocknote/mantine/style.css` so BlockNote does not duplicate or clash with native `@mantine/core/styles.css`.
6. **Node engine range:** Set `"engines": { "node": "^24.11.0 || >=26.0.0" }` (compatible with local shell `v24.22.1`, Vite+ bundled `v26.13.1`, and `vite-plus@1.7.0`'s requirement) and `"devEngines": { "packageManager": { "name": "pnpm", "version": "12.21.0" } }`.
7. **Skip React Compiler in v1:** `@vitejs/plugin-react@6.3.0` peers `oxc-transform-react >=0.152.0 <0.157.0`. Omit `viteReact({ compiler: true })` in v1 unless pinning `oxc-transform-react@0.156.x`.
8. **No `minimumReleaseAge`:** Omit `cove-monorepo`'s `minimumReleaseAge: 1440` so newly published packages install immediately.
9. **Omit `cove-monorepo`'s logging package:** It is an `evlog` + Nitro SSR wrapper unsuitable for a pure Vite SPA + Convex backend.
