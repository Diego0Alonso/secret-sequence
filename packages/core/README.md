<div align="center">

# Secret Sequence Core

[![en](https://img.shields.io/badge/lang-en-red.svg)](./README.md)
[![es](https://img.shields.io/badge/lang-es-yellow.svg)](./README_ES.md)

![GitHub stars](https://img.shields.io/github/stars/Diego0Alonso/secret-sequence)
![GitHub forks](https://img.shields.io/github/forks/Diego0Alonso/secret-sequence)
![GitHub issues](https://img.shields.io/github/issues/Diego0Alonso/secret-sequence)
[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-GitHub-pink?logo=github)](https://github.com/sponsors/Diego0Alonso)

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)

> Framework-agnostic input engine for detecting directional sequences, key combinations, and touch gestures — written in pure TypeScript with zero runtime dependencies.

This package is the **core engine** of the [Secret Sequence](../../README.md) monorepo.  
It contains all input detection logic and can run in any JavaScript or TypeScript environment.

</div>

---

## Installation

```bash
npm install secret-sequence-core
````

---

## Quick Start

### Stratagem-Style Input

```ts
import { SecretSequenceEngine } from "secret-sequence-core"

const engine = new SecretSequenceEngine({
  sequences: [
    {
      id: "orbitalStrike",
      sequence: ["right", "right", "up"],
      onSuccess: () => deployStrike(),
    },
  ],
  timeout: 2000,
  onProgress: (id, progress) => {
    console.log(`${id}: ${progress} steps completed`)
  },
})

engine.start()
```

---

### Konami Code

```ts
const engine = new SecretSequenceEngine({
  sequences: [
    {
      id: "konami",
      sequence: ["up", "up", "down", "down", "left", "right", "left", "right"],
      onSuccess: () => alert("🎉 Konami Code activated!"),
    },
  ],
  timeout: 3000,
})

engine.start()
```

---

### Key Combo Shortcut

```ts
const engine = new SecretSequenceEngine({
  sequences: [
    {
      id: "shortcut",
      sequence: [{ key: "k", ctrl: true }],
      onSuccess: () => console.log("Shortcut triggered"),
    },
  ],
})

engine.start()
```

---

### Touch Gesture Support

Swipe gestures on touch devices are automatically mapped to directional steps.

```ts
const engine = new SecretSequenceEngine({
  sequences: [
    {
      id: "konami",
      sequence: ["up", "up", "down", "down", "left", "right", "left", "right"],
      onSuccess: () => alert("🎉 Konami Code activated!"),
    },
  ],
  enableTouch: true, // enabled by default
  touchOptions: {
    minDistance: 30,  // minimum swipe distance (px)
    maxTime: 300,     // maximum swipe duration (ms)
    threshold: 1.5,   // dominant axis ratio to reject diagonals
  },
})

engine.start()
```

---

### Multiple Sequences

```ts
const engine = new SecretSequenceEngine({
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

engine.start()
```

---

## API

### `new SecretSequenceEngine(options)`

Creates a new engine instance.

---

### Options

| Option         | Type                                                  | Default | Description                                            |
| -------------- | ----------------------------------------------------- | ------- | ------------------------------------------------------ |
| `sequences`    | `SecretSequenceConfig[]`                              | —       | Array of sequences to detect simultaneously            |
| `timeout`      | `number`                                              | `2000`  | Milliseconds of inactivity before resetting progress   |
| `enabled`      | `boolean`                                             | `true`  | Globally enable or disable detection                   |
| `enableTouch`  | `boolean`                                             | `true`  | Enable swipe gesture detection                         |
| `ignoreInputs` | `boolean`                                             | `true`  | Ignore key events when focus is on input-like elements |
| `touchOptions` | `TouchConfig`                                         | —       | Advanced touch configuration                           |
| `onProgress`   | `(id: string \| undefined, progress: number) => void` | —       | Fired on each successful step                          |

---

### Methods

| Method             | Returns                  | Description                                          |
| ------------------ | ------------------------ | ---------------------------------------------------- |
| `start()`          | `void`                   | Attach event listeners                               |
| `stop()`           | `void`                   | Remove event listeners                               |
| `destroy()`        | `void`                   | Stop detection and reset progress                    |
| `reset()`          | `void`                   | Reset all sequence progress                          |
| `getProgressMap()` | `Record<string, number>` | Get current progress state                           |
| `setOptions(opts)` | `void`                   | Update configuration at runtime (restarts if active) |

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

A `SequenceStep` can be:

* A `Direction` string (mapped to arrow keys)
* A `KeyCombo` object with optional modifier keys

---

### `TouchConfig`

| Property      | Type     | Default | Description                                    |
| ------------- | -------- | ------- | ---------------------------------------------- |
| `minDistance` | `number` | `30`    | Minimum swipe distance (px)                    |
| `maxTime`     | `number` | `300`   | Maximum swipe duration (ms)                    |
| `threshold`   | `number` | `1.5`   | Axis dominance ratio to reject diagonal swipes |

---

## SSR Compatibility

This engine is safe to use in SSR environments such as Next.js or Remix.

It guards against accessing `window` during server rendering and only attaches event listeners in the browser.

---

## License

MIT © Diego Alonso