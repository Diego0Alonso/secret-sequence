---
"secret-sequence-core": patch
---

Fix onProgress being invoked before progressMap was fully updated.

Progress notifications are now batched to ensure callbacks
receive the finalized state.