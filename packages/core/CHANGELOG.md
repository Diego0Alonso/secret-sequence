# secret-sequence-core

## 2.1.0

### Minor Changes

- fb07f89: Add an optional `target` option to attach listeners to a specific
  `EventTarget` (e.g. a scoped container or iframe) instead of `window`.
  Defaults to `window`, so existing behaviour is unchanged.

### Patch Changes

- 311c0b2: The engine now throws a clear error if a sequence is configured with no
  steps, instead of failing later at the first keypress.

## 2.0.2

### Patch Changes

- 05ed9d3: Touch gestures now respect the `enabled` option. Previously a swipe could
  still trigger a sequence while `enabled: false`, even though keyboard input
  was already correctly ignored.

## 2.0.1

### Patch Changes

- Fix onProgress being invoked before progressMap was fully updated.

  Progress notifications are now batched to ensure callbacks
  receive the finalized state.
