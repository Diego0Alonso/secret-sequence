---
"secret-sequence-react": minor
---

Expose the `target` option in `useSecretSequence` and `<SecretSequence />`, so
listeners can be attached to a scoped `EventTarget` (e.g. a container element)
instead of `window`. Defaults to `window`, matching the core engine. Changing
`target` re-binds the listeners to the new element.
