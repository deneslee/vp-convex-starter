# External Reference Repos & Official Docs

Last verified: not re-verified. Moved as-is from `docs/other-refs.md` at commit `898e983`, 2026-11-21. External claims were not re-fetched; check versions before you use them.

| Resource | Link | What to Borrow From It |
| :--- | :--- | :--- |
| **Cove Monorepo (Vite+ Base)** | [github.com/mugnavo/cove-monorepo](https://github.com/mugnavo/cove-monorepo) | `pnpm` workspace + Vite+ `1.7` layout, `catalog:`, `tools/tsconfig/`, `.vite-hooks/`, `fallow`, `varlock`, and `.agents/` structure. |
| **Mantine Vite+ Template** | [github.com/mantinedev/vite-template](https://github.com/mantinedev/vite-template) | Mantine v9 Vite+ integration, `oxc-config-mantine`, `.stylelintrc.json`, `postcss.config.mjs`, and `test-utils/`. |
| **Vite + Convex + TanStack + Mantine Starter** | [github.com/aurewill/vite-convex-starter-app](https://github.com/aurewill/vite-convex-starter-app) | Closest stack match (Vite, Convex, TanStack Router, Mantine, `.agents` setup). |
| **Convex TanStack SaaS Starter** | [convex.dev/examples/convex-saas](https://www.convex.dev/examples/convex-saas) | Official Vite + TanStack Router + Convex SPA reference with auth, file uploads, and layout structure. |
| **TanStack + Convex Trellaux Example** | [github.com/TanStack/router/.../start-convex-trellaux](https://github.com/TanStack/router/tree/main/examples/react/start-convex-trellaux) | Canonical `@convex-dev/react-query` patterns (`convexQuery`, `useSuspenseQuery`, route loader warming). |
| **Collaborative Editor Example** | [convex.dev/examples/collaborative-editor](https://www.convex.dev/examples/collaborative-editor) | Reference wiring for `@convex-dev/prosemirror-sync` with BlockNote / Tiptap. |
| **Convex Components Directory Repo** | [github.com/convex/components-submissions-directory](https://github.com/convex/components-submissions-directory) | Up-to-date Vite + Convex app showing `.agents/skills`, `AGENTS.md`, `convex-helpers`, and real-time search/filtering. |
| **Official Docs & Agent Skills** | [docs.convex.dev/client/tanstack/tanstack-query/](https://docs.convex.dev/client/tanstack/tanstack-query/)<br>[tanstack.com/db/latest/docs/collections/convex-collection.md](https://tanstack.com/db/latest/docs/collections/convex-collection.md)<br>[github.com/convex/agent-skills](https://github.com/convex/agent-skills)<br>[convex.dev/agent-setup.md](https://www.convex.dev/agent-setup.md)<br>[mantine.dev/llms.txt](https://mantine.dev/llms.txt) | Official adapter docs, Convex DB collection guide, official agent skills, and Mantine LLM docs (`mantine-mcp` is preferred in this repo). |
