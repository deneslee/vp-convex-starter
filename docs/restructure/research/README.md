# Research

Short evidence summaries, one per topic. Each has a "Last verified" commit and date. Research for a later phase or step goes into that step's spec, unless it serves several steps.

## How claims are tagged

| Tag                      | Meaning                                                                          |
| ------------------------ | -------------------------------------------------------------------------------- |
| **Repo fact (verified)** | Checked against code, config or tests at the stated commit, with `file:line`     |
| **External evidence**    | From a primary source (URL). It says whether it was re-fetched                   |
| **Measured, not re-run** | A number from an earlier run                                                     |
| **Hypothesis**           | No source, or inference only                                                     |
| **Proposal**             | A recommendation. It is never a decision; see [../decisions.md](../decisions.md) |

All of these are snapshots. Before you act on a row, re-check it against the code. If the code differs, fix the row and its date.

The five files moved from `docs/` and `plans/` are not yet tagged row by row. Treat every claim in them as **External evidence, not re-fetched** until a step re-checks it.

## Topics

| File                                                       | Answers                                                                            |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [current-state.md](current-state.md)                       | What exists today: facts, the gap register G-001…G-010, the original requirements  |
| [packages-and-versions.md](packages-and-versions.md)       | Exact npm versions and peer rules for the `pnpm-workspace.yaml` catalog            |
| [storage-and-auth-options.md](storage-and-auth-options.md) | Native Convex storage vs R2 and others; single-user v1 vs Better Auth, Convex Auth, Clerk |
| [markdown-editor-options.md](markdown-editor-options.md)   | BlockNote setup, raw fallback, `prosemirror-sync` upgrade, Tiptap alternative      |
| [convex-others.md](convex-others.md)                       | Optional Convex components beyond `rag` and `workpool`                             |
| [other-refs.md](other-refs.md)                             | Reference repos and official docs                                                  |
