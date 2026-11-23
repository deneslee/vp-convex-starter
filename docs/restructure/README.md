# Restructure: start here

This page is the entry point for you and for any agent session. It owns the current phase, what is blocked, and the next action.

## Now

|                 |                                                                                                                                                                         |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Phase**       | P2B, `packages/ui` ([phases.md](phases.md))                                                                                                                             |
| **Step**        | P2B-3 AppFrame and RecordTable, in progress ([spec](specs/P2B-3-appframe-recordtable.md))                                                                               |
| **Waiting on**  | Your review of the [cleanup list](cleanup.md); your BlockNote API check for P2B-5                                                                                       |
| **Blocked**     | P2B-5 (MarkdownWorkspace) until the BlockNote check is done. P6 until D-03, D-04 and D-05 are decided. P7 until D-01 is decided                                         |
| **Next action** | Finish P2B-3, then P2B-4. Decide D-02 (workflow weight) before P3 starts                                                                                                |
| **Updated**     | 2026-11-23, commit `898e983`                                                                                                                                            |

## Reading order

Read only what the task needs.

1. **This page.**
2. **[decisions.md](decisions.md):** your answers so far (A-1…A-6) and the open decisions. Only `accepted` entries are decisions.
3. **[phases.md](phases.md):** the phase order, the step status, and which gaps each phase covers.
4. **[workflow.md](workflow.md):** how one step is run, which ECC skills to use, and where output goes.
5. **[research/](research/README.md):** evidence, only for the topic at hand.
6. **[../adr/](../adr/README.md):** accepted decisions.

## Rules for this folder

- **One owner per fact.**

  | Fact                 | Owner                           |
  | -------------------- | ------------------------------- |
  | Status               | this page                       |
  | Phase and step state | [phases.md](phases.md)          |
  | Decision state       | [decisions.md](decisions.md)    |
  | Decision reasoning   | an ADR                          |
  | Evidence             | [research/](research/README.md) |
  | Step scope           | its spec in [specs/](specs/README.md) |

  Other files link to the owner instead of copying it.

- **Research and specs are snapshots.** Re-check a row against the code before acting on it.
- **Nothing becomes accepted without the user's explicit approval.** This covers proposals from Claude, ChatGPT, Gemini, ECC or research.
- **Superseded docs are deleted, not archived.** Git history keeps them.

## Not in scope here

`apps/docs/` (the capability catalog) has not been verified, and it differs from the code in several places (see [cleanup.md](cleanup.md)). Don't use it as evidence.
