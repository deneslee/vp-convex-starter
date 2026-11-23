# Workflow

How a step is run, which ECC skills and tools to use, and where their output goes. **Status: proposal.** How much of this applies to each step is decision D-02.

## Roles

- **Coordinator: the main session (Claude, Codex or Antigravity).** It reads the [start page](README.md), runs the step, and asks you at each gate. There is no separate orchestrator agent.
- **Specialists:** ECC agents and skills, named per job below; the Convex skills in `.agents/skills/` for backend work.
- **Tools:**
  - Context7 (`ecc:documentation-lookup`) for current library docs;
  - the Mantine MCP before any UI component or hook (AGENTS.md §2);
  - `vpx @tanstack/intent@latest` before TanStack Router, Query or DB changes;
  - `vpr` tasks for verification.

## One step

1. **Spec.** Write `specs/<phase>-<step>.md` from the template below. Do only the research this step needs.
2. **Gate 1.** You approve the spec.
3. **Branch.** One branch per step (`ecc:git-workflow`).
4. **Impact.** For high-risk steps only (data, auth, public interfaces, mass moves), run `ecc:change-impact` and put its result in the spec. A missing rollback blocks the step.
5. **Do the work** with the command for the kind of change:

   | Kind of change                 | Command                                     |
   | ------------------------------ | ------------------------------------------- |
   | Move or rename, same behaviour | `/ecc:orch-refine-code`                     |
   | Bug                            | `/ecc:orch-fix-defect`                      |
   | Behaviour change               | `/ecc:orch-change-feature`                  |
   | Dead code                      | `/ecc:refactor-clean`, one deletion per run |
   | Config or docs only            | plain edits                                 |

6. **Verify.** Run `ecc:verification-loop` with the baseline loop: `vpr check`, `vpr stylelint`, `vpr convex:typecheck`, `vpr test`. At the end of a phase add `vpr build`, `vpr fallow` and `vpr env:audit` (AGENTS.md §7).
7. **Review.** Run `/ecc:orch-review`. CRITICAL and HIGH findings block the step. Add `ecc:security-review` and agent `convex:convex-reviewer` for auth or storage.
8. **Gate 2.** You confirm the commit. `ecc:conventional-commit-review` drafts the message.
9. **Close.** Tick the step in [phases.md](phases.md), mark the G-rows it closes, and update the start page. Record a decision in the queue and an ADR only if one was made.

## Spec template (`specs/<phase>-<step>.md`)

```md
# <phase>-<step>: <title>

Status: draft | approved | done
Decisions used: D-xx (accepted only)

## Scope — in / out (owned paths)

## Evidence — links to research rows, plus anything newly checked (file:line)

## Change — what moves or changes

## Verify — commands and the expected result

## Rollback — how to undo; irreversible effects (data, persisted keys, URLs)
```

## Where ECC output goes

ECC skills each have their own default paths. Tell every skill which of these to use:

| Output                                      | Goes to                                                                                            | ECC default it replaces                               |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Plans                                       | [phases.md](phases.md) and `specs/`                                                                | `plans/` (`blueprint`), `.claude/plans/` (`/plan`)    |
| Decisions                                   | the [decisions.md](decisions.md) queue; an ADR in [../adr/](../adr/README.md) only once you accept | —                                                     |
| Impact reports                              | the step's spec, under Evidence or Rollback                                                        | the response only (`change-impact`)                   |
| Research                                    | `research/<topic>.md`, tagged by how each claim was checked                                        | —                                                     |
| Glossary                                    | per D-09                                                                                           | `CONTEXT.md`                                          |
| Task status                                 | [phases.md](phases.md)                                                                             | an issue tracker                                      |
| Doc roles (map, status, history, ADR index) | not set up; `.governance/docs-map.json` is a candidate if ECC's `audit-docs.py` is used            | defaults such as `CLAUDE_MAP.md`, `PROJECT_STATUS.md` |

## Other defaults

- **Coverage.** Don't enforce ECC's 80 % default until D-06 is decided.
- **Parallel work.** P2A, P2B and P3 may run in parallel sessions. Never let two writers touch the same files: each spec lists its owned paths.
- **Size of reviews.** Run `ecc:council` once per contested question, with short context. It writes no files.

## Candidates for later (not created)

- **Nested instruction files.** One `AGENTS.md` per package, after P6. The root file must stay enough on its own.
- **A project skill for "run one step".** Revisit if agents keep drifting from the routine above.
