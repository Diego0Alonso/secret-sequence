---
---

chore: resolve the workspace dependency from source during type-checking so a
fresh clone can run `pnpm typecheck` / `pnpm test` without building core first.
Dev-only tsconfig `paths`; the published build and types are unchanged.
