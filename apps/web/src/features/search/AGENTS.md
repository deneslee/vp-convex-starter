# Search feature

Scope rules for `apps/web/src/features/search/`. The root [AGENTS.md](../../../../../AGENTS.md) still applies.

- **Two modes, one result list.** Keyword search is a Convex query (`api.search.keywordSearch`); semantic search is a Convex action (`api.searchActions.semanticSearch`). Both map to the same hit shape before the UI sees them.
- **Owner:** TanStack Query owns search results (AGENTS.md §6). Do not put hits in Zustand or in a TanStack DB collection.
- **UI:** `SemanticSearchBar` from `@repo/ui` draws the input, the mode toggle and the list. This folder only wires it.
- **Open:** whether this hook may call Convex directly is decision D-04 ([docs/restructure/decisions.md](../../../../../docs/restructure/decisions.md)).
