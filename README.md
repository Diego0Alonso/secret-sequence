<div align="center">

# Secret Sequence Core

[![en](https://img.shields.io/badge/lang-en-red.svg)](./README.md)
[![es](https://img.shields.io/badge/lang-es-yellow.svg)](./README_ES.md)

![GitHub stars](https://img.shields.io/github/stars/Diego0Alonso/secret-sequence-core)
![GitHub Forks](https://img.shields.io/github/forks/Diego0Alonso/secret-sequence-core)
![GitHub issues](https://img.shields.io/github/issues/Diego0Alonso/secret-sequence-core)
![npm version](https://img.shields.io/npm/v/secret-sequence-core)
[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-GitHub-pink?logo=github)](https://github.com/sponsors/Diego0Alonso)

![React](https://img.shields.io/badge/React-%3E%3D18-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)

A headless stratagem-style input engine for React.

Inspired by the input systems seen in games like **Helldivers 2**, this hook allows you to detect directional sequences and key combinations with timeout handling, progress tracking, and multi-sequence support.

</div>

---

## Why?

Perfect for:

- 🎮 Easter eggs & game-like web experiences
- 🔐 Hidden admin panels
- 🛠 Developer shortcuts
- 🧩 Interactive UI systems
- ⚡ Stratagem-style input patterns

---

## Installation

### npm
```bash
npm install secret-sequence-core
```

### pnpm

```bash
pnpm add secret-sequence-core
```

### yarn

```bash
yarn add secret-sequence-core
```

### bun

```bash
bun add secret-sequence-core
```

---

## Quick Start

### Stratagem-Style Input

```tsx
import { useSecretSequence } from "secret-sequence-core"

function App() {
  const { progressMap } = useSecretSequence({
    sequences: [
      {
        id: "orbitalStrike",
        sequence: ["right", "right", "up"],
        onSuccess: () => deployStrike(),
      },
    ],
    timeout: 2000,
  })

  return <p>Input: {progressMap["orbitalStrike"]} / 3</p>
}
```

---

### Konami Code

```tsx
useSecretSequence({
  sequences: [
    {
      id: "konami",
      sequence: ["up", "up", "down", "down", "left", "right", "left", "right"],
      onSuccess: () => alert("🎉 Konami Code activated!"),
    },
  ],
  timeout: 3000,
})
```

---

### Key Combo Shortcut

```tsx
useSecretSequence({
  sequences: [
    {
      sequence: [{ key: "k", ctrl: true }],
      onSuccess: () => console.log("Shortcut triggered"),
    },
  ],
})
```

---

### Touch Gesture Support

Swipe gestures on touch devices are automatically mapped to directional steps:

```tsx
useSecretSequence({
  sequences: [
    {
      id: "konami",
      sequence: ["up", "up", "down", "down", "left", "right", "left", "right"],
      onSuccess: () => alert("🎉 Konami Code activated!"),
    },
  ],
  enableTouch: true, // enabled by default
  touchOptions: {
    minDistance: 30,  // minimum swipe distance in px
    maxTime: 300,     // max swipe duration in ms
    threshold: 1.5,   // ratio to reject diagonal swipes
  },
})
```

---

### Multiple Sequences

```tsx
const { progressMap } = useSecretSequence({
  sequences: [
    {
      id: "konami",
      sequence: ["up", "up", "down", "down", "left", "right", "left", "right"],
      onSuccess: () => console.log("Konami!"),
    },
    {
      id: "unlock",
      sequence: [
        { key: "k", ctrl: true },
        { key: "u", ctrl: true },
      ],
      onSuccess: () => console.log("Ctrl+K → Ctrl+U unlocked!"),
    },
  ],
  onProgress: (id, progress) => {
    console.log(`Sequence "${id}" progress: ${progress}`)
  },
})
```

---

## API

### `useSecretSequence(options)`

#### Options

| Option         | Type                                                  | Default | Description                                                                               |
| -------------- | ----------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------- |
| `sequences`    | `SecretSequenceConfig[]`                              | —       | Array of sequence configurations to detect simultaneously                                 |
| `timeout`      | `number`                                              | `2000`  | Milliseconds of inactivity before resetting all progress                                  |
| `enabled`      | `boolean`                                             | `true`  | Enable or disable all detection                                                           |
| `enableTouch`  | `boolean`                                             | `true`  | Enable touch gesture detection (swipes mapped to directions)                              |
| `ignoreInputs` | `boolean`                                             | `true`  | Ignore key events when focus is on `<input>`, `<textarea>`, or `contentEditable` elements |
| `touchOptions` | `TouchConfig`                                         | —       | Advanced touch sensitivity configuration (see below)                                      |
| `onProgress`   | `(id: string \| undefined, progress: number) => void` | —       | Callback fired on each correct step                                                       |

---

### `SecretSequenceConfig`

| Property    | Type                  | Description                                                  |
| ----------- | --------------------- | ------------------------------------------------------------ |
| `id`        | `string` *(optional)* | Unique identifier for the sequence (defaults to array index) |
| `sequence`  | `SequenceStep[]`      | Steps to detect                                              |
| `onSuccess` | `() => void`          | Callback fired when the full sequence is completed           |

---

### Types

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

A `SequenceStep` can be either:

* A `Direction` string (mapped to arrow keys)
* A `KeyCombo` object for any key with optional modifier keys

---

### `TouchConfig`

| Property      | Type     | Default | Description                                                          |
| ------------- | -------- | ------- | -------------------------------------------------------------------- |
| `minDistance`  | `number` | `30`    | Minimum swipe distance in pixels                                     |
| `maxTime`      | `number` | `300`   | Maximum swipe duration in milliseconds                               |
| `threshold`    | `number` | `1.5`   | Minimum ratio between dominant and secondary axis to reject diagonals |

---

### Return Value

| Property      | Type                     | Description                                       |
| ------------- | ------------------------ | ------------------------------------------------- |
| `progressMap` | `Record<string, number>` | Current progress for each sequence, keyed by `id` |
| `reset`       | `() => void`             | Manually reset all sequences                      |

---

## SSR Compatibility

This hook is safe to use in SSR environments like Next.js and Remix.

It guards against accessing `window` during server rendering and only attaches listeners on the client.

---

## Features

* ✅ Multi-sequence detection
* ✅ Directional + key combo support
* ✅ Touch gesture support (swipe detection)
* ✅ Timeout-based reset
* ✅ Independent progress tracking
* ✅ Headless (bring your own UI)
* ✅ SSR-safe
* ✅ Fully typed with TypeScript
* ✅ Tree-shakeable
* ✅ Zero dependencies beyond React

---

## Roadmap

* [ ] Smart partial matching (KMP algorithm)
* [x] Advanced touch gesture support
* [ ] Custom event targets
* [ ] Devtools debug mode
* [ ] Optional UI companion package

---

## Inspiration

> Inspired by the stratagem input system in **Helldivers 2** — where players input directional sequences under pressure to call in tactical support.

This hook brings that same pattern to the web: fast, sequential, multi-pattern input detection.

---

## Contributing

Contributions, issues and feature requests are welcome.

Feel free to open an issue or submit a pull request.

---

## License

MIT © Diego0Alonso