# secret-sequence-react

## 1.0.1

### Patch Changes

- effb9a5: Fix the hook reusing a stale `onSuccess` callback. Changing only the callback
  (without changing the keys) now invokes the current callback instead of the one
  captured on the first render. Also avoid a re-render on every matching keystroke
  when the progress map does not actually change in value.
