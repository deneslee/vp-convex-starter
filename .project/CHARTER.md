# Charter — GSD Path planning showcase

Review panel: off

## Vision

Demonstrate GSD Path’s planning artifacts and approval gates from the simulated P2B-3 starting point. A reader should be able to follow how the existing inspection and the owner’s rulings shape the milestone sequence and its rationale.

## Full scope: in

- Use the starter’s phase sequence as the planning scenario. The handoff places toolchain and domain work before P2B-3, with backend, web and verification work ahead.
- Produce each native GSD Path artifact through program roadmap approval. Stop at that gate, before detailed task planning.

## Full scope: out (vetoes)

- Application implementation and changes to starter configuration are outside this planning showcase.

## Constraints

- Use [the phase table](../docs/restructure/phases.md) and [Handoff 4](<G:/My Drive/handoff/handoff_4.md>) as scenario inputs.
- Ground claims about the checkout in the [inspection](research/evidence-codebase.md) and [docs audit](research/DOCS-AUDIT.md). Preserve the distinction between scenario progress, inspected source and executed checks.
- Keep proposed restructure, authentication and collaborative editing decisions open pending owner rulings.

## Program success criteria

1. The planning artifacts identify P2B-3 as the simulated starting point and trace claims about the existing implementation to inspection evidence.
2. The owner can review the native outputs in sequence and see which gates actually received approval.
3. The owner reviews the milestone sequence and its rationale and explicitly approves the program roadmap.

## Open questions

No outstanding audit rulings. See the [recorded decisions](research/DOCS-AUDIT.md#user-rulings).

## Corrections

- 2026-11-23: “1. **Approved program roadmap.** Review the milestone sequence and its rationale, then finish the showcase before detailed task planning.”
- 2026-11-23 (audit rows 21–24): 1. **Keep the source docs as written (`accept-drift`, recommended).** Use their phase labels as the simulation timeline. Cite the inspection whenever the roadmap describes actual code or verification. This preserves the trial’s starting point.
- 2026-11-23: Accept drift for rows 2, 3, 8, 9, 10, 12 and 17.
