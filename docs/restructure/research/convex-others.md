# Optional Convex Components Roadmap (Beyond v1)

Last verified: not re-verified. Moved as-is from `docs/convex-others.md` at commit `898e983`, 2026-11-21. External claims were not re-fetched; check versions before you use them.

In v1, `packages/backend` mounts **`@convex-dev/rag`** (semantic search) and **`@convex-dev/workpool`** (`ragIndexPool` background indexing), alongside `convex-helpers` (`customQuery`/`customMutation`/`customAction`) and native Convex Storage / full-text `searchIndex`.

When adding new capabilities later, mount self-contained Convex Components in `packages/backend/convex/convex.config.ts` rather than hand-rolling infrastructure tables:

---

## AI & Conversational Assistants
- **`@convex-dev/agent`**: Durable multi-assistant chat threads, WebSocket streaming, automatic file attachment persistence, and built-in integration with `@convex-dev/rag`. (Recommended by Convex `guidelines.md` over hand-rolled `messages` tables.)
- **`@convex-dev/persistent-text-streaming`**: Lightweight streaming text responses into the browser while persisting final output to Convex.

## Durable Workflows & Async Reliability
- **`@convex-dev/workflow`**: Long-running, multi-step durable pipelines (survive restarts, step retries, cancel/resume) when multi-stage document/asset processing outgrows a single Workpool queue.
- **`@convex-dev/crons`**: Runtime-registered dynamic cron schedules (use static `convex/crons.ts` first for simple fixed jobs).
- **`@convex-dev/action-retrier`** / **`@convex-dev/rate-limiter`** / **`@convex-dev/action-cache`**: Idempotent external API retries, transactional per-user quotas/throttling (preferred over hand-rolled counters), and cached expensive AI/embedding calls.

## Real-Time Collaboration & Editor Sync
- **`@convex-dev/prosemirror-sync`**: Operational-transform real-time document sync for BlockNote (`useBlockNoteSync`) or Tiptap (`useTiptapSync`) — see [markdown-editor-options.md](markdown-editor-options.md).
- **`@convex-dev/presence`**: Ephemeral room heartbeats, multi-tab session deduplication, and timeout-to-offline presence (preferred over hand-rolled `lastSeen` tables).

## Scale, Counts, Migrations & Storage
- **`@convex-dev/aggregate`**: O(log n) counts, sums, ranks, and offset pagination without scanning full tables (required by Convex `guidelines.md` instead of `.collect().length` at scale).
- **`@convex-dev/sharded-counter`**: High-throughput contention-free counters.
- **`@convex-dev/migrations`**: Resumable live schema backfills as `records` / `documents` shapes evolve.
- **`@convex-dev/r2`** / **`@convex-dev/better-auth`** / **`@convex-dev/auth`**: See [storage-and-auth-options.md](storage-and-auth-options.md).

---

## Mounting Pattern

```ts
// packages/backend/convex/convex.config.ts
import { defineApp } from "convex/server";
import rag from "@convex-dev/rag/convex.config.js";
import workpool from "@convex-dev/workpool/convex.config.js";
import aggregate from "@convex-dev/aggregate/convex.config.js";

const app = defineApp({
  env: {
    // Declare typed backend env vars here and import `env` from "./_generated/server"
  },
});

app.use(rag);
app.use(workpool, { name: "ragIndexPool" });
app.use(aggregate);

export default app;
```

Update `convex-test` setups and check `https://www.convex.dev/components/<name>/SKILL.md` (or `llms.txt`) whenever adding a new component.
