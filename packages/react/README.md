<div align="center">

# Secret Sequence React

[![en](https://img.shields.io/badge/lang-en-red.svg)](./README.md)
[![es](https://img.shields.io/badge/lang-es-yellow.svg)](./README_ES.md)

![GitHub stars](https://img.shields.io/github/stars/Diego0Alonso/secret-sequence)
![GitHub forks](https://img.shields.io/github/forks/Diego0Alonso/secret-sequence)
![GitHub issues](https://img.shields.io/github/issues/Diego0Alonso/secret-sequence)
[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-GitHub-pink?logo=github)](https://github.com/sponsors/Diego0Alonso)

![React](https://img.shields.io/badge/React-≥17-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)

> React hook & component for detecting directional sequences, key combos, and touch gestures — powered by [secret-sequence-core](../core/README.md).

This package provides **React bindings** for the [Secret Sequence](../../README.md) monorepo.  
It wraps the core engine in a hook and a declarative component with full lifecycle management.

</div>

---

## Installation

```bash
npm install secret-sequence-react secret-sequence-core
````

> `secret-sequence-core` is a peer dependency.

---

## Quick Start

### Hook — `useSecretSequence`

```tsx
import { useSecretSequence } from "secret-sequence-react"

function App() {
  const { progress } = useSecretSequence({
    sequences: [
      {
        id: "konami",
        sequence: ["up", "up", "down", "down", "left", "right", "left", "right"],
        onSuccess: () => alert("🎉 Konami Code activated!"),
      },
    ],
    enableTouch: true,
    touchOptions: { minDistance: 50, maxTime: 400 },
  })

  return <pre>{JSON.stringify(progress, null, 2)}</pre>
}
```

---

### Component — `<SecretSequence />`

#### Invisible Mode (effect only)

```tsx
import { SecretSequence } from "secret-sequence-react"

function App() {
  return (
    <SecretSequence
      sequences={[
        {
          id: "konami",
          sequence: ["up", "up", "down", "down", "left", "right", "left", "right"],
          onSuccess: () => console.log("🎉"),
        },
      ]}
      enableTouch={true}
      touchOptions={{ minDistance: 40 }}
    />
  )
}
```

#### With render prop

```tsx
<SecretSequence
  sequences={[{ id: "code", sequence: ["up", "down"], onSuccess: fn }]}
>
  {({ progress, reset }) => (
    <div>
      <p>Progress: {JSON.stringify(progress)}</p>
      <button onClick={reset}>Reset</button>
    </div>
  )}
</SecretSequence>
```

---

### Stratagem-Style Input

```tsx
const { progress } = useSecretSequence({
  sequences: [
    {
      id: "orbitalStrike",
      sequence: ["right", "right", "up"],
      onSuccess: () => deployStrike(),
    },
  ],
  timeout: 2000,
})
```

---

### Key Combo Shortcut

```tsx
const { progress } = useSecretSequence({
  sequences: [
    {
      id: "shortcut",
      sequence: [{ key: "k", ctrl: true }],
      onSuccess: () => console.log("Shortcut triggered"),
    },
  ],
})
```

---

### Touch Gesture Support

Swipe gestures on touch devices are automatically mapped to directional steps.

```tsx
const { progress } = useSecretSequence({
  sequences: [
    {
      id: "swipe-pattern",
      sequence: ["up", "down", "left", "right"],
      onSuccess: () => alert("Swipe pattern detected!"),
    },
  ],
  enableTouch: true,
  touchOptions: {
    minDistance: 30,
    maxTime: 300,
    threshold: 1.5,
  },
})
```

---

## API

### `useSecretSequence(options)`

React hook that manages the engine lifecycle automatically.

**Returns:** `{ progress, reset }`

| Return     | Type                       | Description                   |
| ---------- | -------------------------- | ----------------------------- |
| `progress` | `Record<string, number>`   | Current progress per sequence |
| `reset`    | `() => void`               | Reset all sequence progress   |

---

### `<SecretSequence />` Component

Declarative JSX wrapper over the `useSecretSequence` hook.

| Prop               | Type                                                                    | Description                              |
| ------------------ | ----------------------------------------------------------------------- | ---------------------------------------- |
| `onProgressChange` | `(progress: Record<string, number>) => void`                            | Callback fired on progress changes       |
| `children`         | `(state: { progress: Record<string, number>; reset: () => void }) => …` | Optional render prop for progress/reset  |
| *...hookOptions*   | `UseSecretSequenceOptions`                                              | All hook options (see below)             |

---

### Options (shared by hook & component)

| Option         | Type                     | Default | Description                                            |
| -------------- | ------------------------ | ------- | ------------------------------------------------------ |
| `sequences`    | `SecretSequenceConfig[]` | —       | Array of sequences to detect simultaneously            |
| `timeout`      | `number`                 | `2000`  | Milliseconds of inactivity before resetting progress   |
| `enabled`      | `boolean`                | `true`  | Globally enable or disable detection                   |
| `enableTouch`  | `boolean`                | `true`  | Enable swipe gesture detection                         |
| `ignoreInputs` | `boolean`                | `true`  | Ignore key events when focus is on input-like elements |
| `touchOptions` | `TouchConfig`            | —       | Advanced touch configuration                           |

---

## Configuration Types

### `SecretSequenceConfig`

| Property    | Type                  | Description                                 |
| ----------- | --------------------- | ------------------------------------------- |
| `id`        | `string` *(optional)* | Unique identifier (defaults to array index) |
| `sequence`  | `SequenceStep[]`      | Ordered steps to detect                     |
| `onSuccess` | `() => void`          | Fired when the sequence completes           |

---

### Core Types

```ts
type Direction = "up" | "down" | "left" | "right"

type KeyCombo = {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
}

type SequenceStep = Direction | KeyCombo
```

---

### `TouchConfig`

| Property      | Type     | Default | Description                                    |
| ------------- | -------- | ------- | ---------------------------------------------- |
| `minDistance`  | `number` | `30`    | Minimum swipe distance (px)                    |
| `maxTime`     | `number` | `300`   | Maximum swipe duration (ms)                    |
| `threshold`   | `number` | `1.5`   | Axis dominance ratio to reject diagonal swipes |

---

## SSR Compatibility

This package is safe to use in SSR environments such as Next.js or Remix.

The underlying engine guards against accessing `window` during server rendering and only attaches event listeners in the browser.

---

## License

MIT © Diego Alonso
