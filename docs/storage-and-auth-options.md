# Storage & Auth Options (v1 Defaults vs. Upgrade Paths)

v1 starts with the **fastest zero-external-account options** while isolating both behind thin adapters in `packages/backend/convex/` so upgrades require minimal refactoring. Configure backend secrets via Convex's typed `defineApp({ env: { ... } })` in `packages/backend/convex/convex.config.ts` (reading `env` from `./_generated/server`), and client build vars in `apps/web/.env.schema` via `varlock`.

---

## 1. File & Image Storage

### Current v1 Default: Native Convex File Storage
- **Why v1:** Zero extra cloud accounts, zero CORS/bucket setup, built-in `ctx.storage.generateUploadUrl()`, `getUrl()`, and `delete()`. Read file metadata cleanly via `ctx.db.system.get("_storage", storageId)` (never deprecated `ctx.storage.getMetadata`).
- **Free-tier ceiling to watch:** 1 GB storage + 1 GB/month file bandwidth (and storage URL lookups count toward function calls).
- **Isolation boundary:** All upload URL generation, URL resolution, and deletion go through `packages/backend/convex/assets.ts` and the `assets` metadata table (`storageId`, optional `storageProvider: "convex"`).

### Upgrade Path A: Cloudflare R2 (`@convex-dev/r2@0.10.4`) — Recommended for Image-Heavy Apps
- **When to switch:** As soon as image bandwidth approaches 1 GB/month or you want zero-egress CDN caching via a custom domain.
- **Setup:**
  1. Add `@convex-dev/r2` to `pnpm-workspace.yaml` catalog (`0.10.4`) and `@repo/backend` `package.json`.
  2. Register in `packages/backend/convex/convex.config.ts`:
     ```ts
     import r2 from "@convex-dev/r2/convex.config.js";
     app.use(r2);
     ```
  3. Declare R2 env vars (`R2_TOKEN`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`, `R2_BUCKET`) in `defineApp({ env })` and set values in the Convex dashboard.
  4. Swap `assets.ts` to use `r2.clientApi()` + `useUploadFile` on the client; add `r2Key` alongside `storageId` in `assets` schema.
- **Tip:** Attach a Cloudflare custom domain to the R2 bucket for permanent CDN-cached image URLs instead of short-lived presigned URLs.

### Upgrade Path B: Hybrid + Access Control + Orphan Cleanup (`@gilhrpenner/convex-files-control`)
- **When to switch:** You want **both** Convex Storage and R2 behind one unified API, expiring download grants, access-key gating, and automatic scheduled cleanup of abandoned uploads.

### Upgrade Path C: Path-Based Virtual Filesystem (`convex-fs`)
- **When to switch:** You want hierarchical folders/paths, atomic moves/renames, content-hash blob deduplication, soft deletes, and optional Bunny CDN on-the-fly image resizing.

---

## 2. Authentication

### Current v1 Default: Single-User / No Auth (Middleware-Ready)
- **Why v1:** Fastest iteration on Records, Markdown, Images, and RAG without login walls.
- **Isolation boundary:** Every Convex function in `packages/backend/convex/` MUST use `appQuery` / `appMutation` / `appAction` from `convex/lib/functions.ts` (`convex-helpers` `customQuery`/`customMutation`/`customAction`).
- **Migration rule:** When enabling auth later, enforce `ctx.auth.getUserIdentity()` inside `convex/lib/functions.ts` once (prefer `identity.tokenIdentifier` for canonical ownership lookups) and pass `userId` via `ctx` — zero boilerplate duplication across functions. Also pass `namespace: userId` into `@convex-dev/rag`.

### Upgrade Path A: `@convex-dev/better-auth@0.13.1` (Recommended for Multi-User)
- **Best fit:** Strong alignment with TanStack Router/Query and modern TypeScript apps; supports email/password, OAuth, organizations, and sessions inside Convex (`better-auth >=1.7.25 <1.8.0`).
- **Migration:** Add `@convex-dev/better-auth` + `better-auth`, register in `convex.config.ts`, add `convex/auth.config.ts`, swap `<ConvexProvider>` for Better Auth's Convex provider in `apps/web/src/app/Providers.tsx`, and populate `ctx.user` in `convex/lib/functions.ts`.

### Upgrade Path B: `@convex-dev/auth@2.1.0` (Modular Native Convex Auth)
- **Best fit:** Built directly on Convex tables with modular subcomponents (`@convex-dev/auth/convex.config.js`, `components/password/convex.config.js`, `components/username/convex.config.js` as seen in `_refs/convex-ref/convex/convex.config.ts`), supporting OAuth, magic links, and passwords without a separate auth server. *(Note: check `peerDependencies` if using `@convex-dev/auth@2.1.0` without Next.js.)*

### Upgrade Path C: Clerk (`@clerk/react` / `@clerk/clerk-react` + `ConvexProviderWithClerk`)
- **Best fit:** Managed enterprise auth UI, organizations, and zero auth maintenance (free tier up to 10k MAU).
