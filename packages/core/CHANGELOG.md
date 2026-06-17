# secret-sequence-core

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
