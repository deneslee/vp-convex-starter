# Assign client state to the layer that owns it

TanStack DB owns reactive lists and optimistic collection writes, TanStack Query owns detail reads, loader warming, and semantic search actions, and TanStack Router owns addressable route and filter state. Zustand owns transient UI state. Keeping these boundaries lets Convex subscriptions reconcile persisted data while the URL and local UI controls serve their own lifecycles.
