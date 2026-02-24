# secret-sequence-core

## 2.0.1

### Patch Changes

- Fix onProgress being invoked before progressMap was fully updated.

  Progress notifications are now batched to ensure callbacks
  receive the finalized state.
