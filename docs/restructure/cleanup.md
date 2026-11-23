# Cleanup list (awaiting your approval)

This lists what happens to the old planning and research material once you approve the new docs. Nothing has been deleted yet. Superseded files are deleted, not archived; git history (commit `898e983`) keeps them. Delete this file once the list is done.

## Delete: replaced by the new docs

| Path                                                     | Replaced by                                                                 | Note                                                                                                                                                 |
| -------------------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/ecc/work/04-plan.md` (the old root `PLAN.md`)      | [phases.md](phases.md), [decisions.md](decisions.md), [workflow.md](workflow.md) | The phase table and graph became P0–P5. The target folder layout and the "handoff prompt" were **not** carried over; decide if you want them back |
| `docs/ecc/work/04-plan/phase-*.md` (5 files)             | [phases.md](phases.md) and one spec per step in [specs/](specs/README.md)  | **Only P2B-3 has a spec yet.** The owned paths and verification gates of P3–P5 live only in these files until their steps get specs                  |
| `docs/ecc/README.md`                                     | —                                                                           | Machine-level ECC notes. **Keep a copy outside the repo if you want those notes**                                                                    |
| `docs/STATUS.md`                                         | [README.md](README.md)                                                      | Now a one-line pointer                                                                                                                               |

## Delete after you skim them (not fully extracted)

No re-verification pass read these in full. Skim them for anything worth keeping, then delete.

- `docs/review/architecture-audit.md`. Its findings are said to be in the gap register; only G-002, G-003 and G-005 were checked.
- `docs/archive/20261120-gemini-initial-brainstorm.md`. Its ideas are summarised in [research/current-state.md](research/current-state.md) §C.

## Keep, flagged

`apps/docs/` (the capability catalog) is kept but not verified. Do not use it as evidence. Its `potential.md` holds ideas only. Mismatches with the code (checked at `898e983`):

- It marks records, documents, assets and search as `decided` for P3 and P4; the code already has them (G-001).
- It lists Better Auth as the default sign-in provider; D-01 is only `proposed`.
- It lists live updates across tabs as `built`; nothing has run a two-tab test yet (the P5 gate).
- Its generator needs `yaml` and `zod` at the root (G-007), so the generated pages can't be rebuilt today.

## References to update when deleting

| Where                                       | Points to                                           | Action                                                     |
| ------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------- |
| [specs/P2B-3-appframe-recordtable.md](specs/P2B-3-appframe-recordtable.md) | `docs/ecc/work/04-plan/phase-2-ui-and-domain.md` | Copy the needed lines into the spec, then remove the link |
| [phases.md](phases.md), [decisions.md](decisions.md), [research/current-state.md](research/current-state.md) | `docs/ecc/work/04-plan.md` | Remove the links |
| `AGENTS.md`                                 | nothing (it never linked the old plan)              | None                                                       |
