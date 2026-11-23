# V2 Roadmap

V1’s [execution plan](../PLAN.md) covers the starter workspace. V2 extends it in three areas. The order and implementation choices are open.

## Feature slice structure

Organize web feature slices around `ui/`, `hooks/`, and `data/`. Keep rendering in UI components, feature behavior in hooks, and data access in the data layer. Choose a representative slice and preserve its route and user behavior while establishing the pattern. Use the [repo boundaries](../AGENTS.md) and [state ownership decision](../docs/adr/0002-state-ownership.md).

## Authentication

Add sign-in and enforce access to workspace data. Settle supported sign-in methods and the ownership model before choosing between Convex Auth v2, Better Auth, and Clerk. See the [storage and auth notes](../docs/storage-and-auth-options.md).

## Live collaborative editing

Enable multiple users to edit the same document concurrently. Decide how to persist concurrent edits, what users see during a conflict or reconnect, and how to retain Markdown import and export. See the [editor options](../docs/markdown-editor-options.md).
