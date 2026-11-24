---
pipeline: gsd-path/v2
project: vp-convex-starter-gsd-showcase
milestone: null     # set by define; names the archive directory at ship
phase: roadmap
                    # inspect only for brownfield; greenfield starts at define
                    # roadmap only in program flow (CHARTER.md exists)
status: active
branch: gsd-path/M001
                    # the router rebinds before any next-milestone file change
                    # the bound branch is never main; ship integrates it there
archive: null       # persisted archive transaction path; never recomputed
integration_default: direct # direct | pull-request | external-landing; project setting
integration: direct # current milestone; may override the default before build
integration_source: default # default | milestone; preserves override provenance
default_branch: main # origin default branch; initialization records it once, nothing changes it
---

# Project State

One file, always current. The router reads this first; every phase updates
it on completion. If this file and the artifacts disagree, the artifacts win
— fix this file.

## Log

<!-- append one line per transition: date, phase, event -->
- 2026-11-23 — inspect — project initialized
- 2026-11-23 — inspect — router bound initial milestone
- 2026-11-23 — inspect — inspection artifacts passed
- 2026-11-23 — define — definition started
- 2026-11-23 — define — program charter approved
- 2026-11-23 — research — research started
- 2026-11-23 — research — .project/research/RESEARCH.md: dispatched none; skipped domain, stack, pitfalls, similar; 0 questions
- 2026-11-23 — decide — decision synthesis started
- 2026-11-24 — decide — validated .project/SYNTHESIS.md
- 2026-11-24 — roadmap — roadmap started
