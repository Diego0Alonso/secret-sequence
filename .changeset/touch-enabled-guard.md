---
"secret-sequence-core": patch
---

Touch gestures now respect the `enabled` option. Previously a swipe could
still trigger a sequence while `enabled: false`, even though keyboard input
was already correctly ignored.
