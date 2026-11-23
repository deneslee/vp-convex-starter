# ECC in this repo

Notes on how Everything Claude Code (ECC) is set up for this project. These are machine-level notes, not project docs; they are on the [cleanup list](../restructure/cleanup.md).

## Intended set-up (not checked on any machine)

- The ECC plugin (`ecc@ecc`) for Claude Code, user scope. It is not committed to this repo.
- Rule packs: `common` and `typescript` only. The other packs load too much context.
- Hooks: off. They run on every tool call and change files without asking.

## What the project uses

Only the skills and commands named in [../restructure/workflow.md](../restructure/workflow.md). In short:

- `/ecc:orch-refine-code`, `/ecc:orch-fix-defect`, `/ecc:orch-change-feature` to do a step;
- `ecc:verification-loop` and `/ecc:orch-review` to check it;
- `ecc:council` once per contested question;
- `ecc:architecture-decision-records` for ADRs, only after you accept a decision.

Not used: `/ecc:plan` and `blueprint` (they write their own plan files), the 80 % coverage default (see D-06), `/astra-review` (it sends the diff to OpenAI).

## How to undo

1. `/plugin uninstall ecc@ecc`.
2. Remove the rule packs from `~/.claude/rules/`.
3. Check `~/.claude/settings.json` for ECC hook entries and remove them.

## Old plan

`work/04-plan.md` and `work/04-plan/` hold the plan written before this docs set (the old root `PLAN.md` and `plans/phase-*.md`). They are replaced by [../restructure/phases.md](../restructure/phases.md) and are on the cleanup list.
