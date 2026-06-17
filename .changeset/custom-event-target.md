---
"secret-sequence-core": minor
---

Add an optional `target` option to attach listeners to a specific
`EventTarget` (e.g. a scoped container or iframe) instead of `window`.
Defaults to `window`, so existing behaviour is unchanged.
