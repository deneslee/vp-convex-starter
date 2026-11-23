# Phase 5 — Full Verification, Cache Proof, Browser Smoke Tests & Cleanup

**Status:** Later

> **Owned Paths:** Workspace-wide audit + `_refs/` removal.
> **Depends On:** Phase 4.

---

## 1. Static & Rule Compliance Audit

1. **JSX Prop & Boundary Check:**
   - Scan `apps/web/src/**/*.{ts,tsx}` to confirm zero banned Mantine visual/layout/box-model props (`p`, `px`, `py`, `m`, `mx`, `my`, `c`, `bg`, `fz`, `fw`, `w`, `h`, `radius`, `shadow`, `style`, `styles`, etc.) on Mantine primitives.
   - Confirm `packages/ui` has zero imports from `convex`, `@tanstack/*`, or `zustand`, and `packages/domain` has zero React/Mantine/BlockNote/Convex-server imports.
   - Confirm zero direct `import.meta.env` or `process.env` reads outside `apps/web/.env.schema` / `convex.config.ts` (`env`).
   - Confirm `@blocknote/mantine/blocknoteStyles.css` is used (and `@blocknote/mantine/style.css` is absent).
2. **Full Verification Pipeline & Vite+ Rust Cache Proof:**
   ```bash
   vpr env:audit
   vpr convex:typecheck
   vpr check
   vpr stylelint
   vpr fallow
   vpr test
   vpr build

   # Immediate re-run must report Vite Task cache HITs:
   vpr check
   vpr build
   ```

---

## 2. Two-Tab Browser Smoke Test

Start local dev stack via `vpr dev` (runs `@repo/backend` `convex dev` and `@repo/web` `vp dev` concurrently) and verify in 2 side-by-side browser tabs:

1. **Records (TanStack DB + Optimistic Sync):**
   - Create and edit a record in Tab A → instant optimistic UI update + live WebSocket sync into Tab B.
   - Filter/sort locally and open detail route `/records/$id`.
2. **Documents (BlockNote 0.57 + Workpool + RAG):**
   - Create or drag-drop import a `.md` file with YAML frontmatter → verify frontmatter tags/title parse via `@repo/domain`.
   - Edit blocks in BlockNote (`MarkdownWorkspace`), switch between `"blocks"` and `"raw"` modes, and drop/paste an inline image into BlockNote → confirm 3-step upload runs via `assets.ts` and image renders inline.
   - Observe `ragStatus` transition `pending → indexed` via `ragIndexPool` (when `OPENAI_API_KEY` is configured in Convex env), and verify both keyword and semantic RAG search return the edited section.
3. **Assets (Native Storage + Lightbox + Cascade Cleanup):**
   - Upload an image on `/assets` → observe Zustand queue progress → open fullscreen `@mantine/lightbox` preview → copy Markdown link → delete image and verify both the `assets` row and Convex storage blob are removed.

---

## 3. Cleanup (`_refs/` Removal)

Once all automated gates and browser smoke checks pass:

```powershell
# Windows (PowerShell)
Remove-Item -Recurse -Force _refs
```

```bash
# macOS / Linux
rm -rf _refs
```

Verify `.gitignore` covers `_refs/`, `.env.local`, `apps/web/env.d.ts`, `dist/`, `.vitest/`, `.tanstack/`, and `.fallow/`, then run one final `vpr check` + `vpr test` + `vpr build`.
