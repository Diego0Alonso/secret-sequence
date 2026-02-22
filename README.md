<div align="center">

# Secret Sequence

[![en](https://img.shields.io/badge/lang-en-red.svg)](./README.md)
[![es](https://img.shields.io/badge/lang-es-yellow.svg)](./README_ES.md)

![GitHub stars](https://img.shields.io/github/stars/Diego0Alonso/secret-sequence)
![GitHub forks](https://img.shields.io/github/forks/Diego0Alonso/secret-sequence)
![GitHub issues](https://img.shields.io/github/issues/Diego0Alonso/secret-sequence)
[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-GitHub-pink?logo=github)](https://github.com/sponsors/Diego0Alonso)

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)

A modular, framework-agnostic input engine ecosystem for the web.

A stratagem-style input pattern engine inspired by games like **Helldivers 2**, bringing directional sequences, key combinations, and touch gesture detection to modern web applications.

</div>

---

## Monorepo Structure

This repository is organized as a monorepo containing the following packages:

| Package | Version | Description |
|----------|----------|-------------|
| `secret-sequence-core` | [![npm](https://img.shields.io/npm/v/secret-sequence-core)](https://www.npmjs.com/package/secret-sequence-core) | Framework-agnostic input engine |
| `secret-sequence-react` | — | React hook wrapper |
| `secret-sequence-angular` *(planned)* | — | Angular directive wrapper |
| `secret-sequence-ui` *(future)* | — | Optional UI components |

---

## Why?

Secret Sequence is perfect for:

- 🎮 Easter eggs & game-like web experiences  
- 🔐 Hidden admin panels  
- 🛠 Developer shortcuts  
- 🧩 Interactive UI systems  
- ⚡ Stratagem-style input mechanics  

---

## Philosophy

Secret Sequence follows a layered architecture:

- **Core** → Pure logic, zero framework dependencies  
- **Wrappers** → Framework-specific integrations (React, Angular, Vue)  
- **UI (optional)** → Visual components built on top  

This separation ensures long-term scalability, portability, and framework independence.

---

## Ecosystem

The project is designed as a growing ecosystem:

- Core engine (headless)
- Framework wrappers
- Optional UI components
- Devtools (planned)

---

## Quick Start

### Install the core

```bash
npm install secret-sequence-core
````

### Basic Usage (Vanilla TypeScript)

```ts
import { SecretSequenceEngine } from "secret-sequence-core"

const engine = new SecretSequenceEngine({
  sequences: [
    {
      id: "konami",
      sequence: ["up", "up", "down", "down", "left", "right", "left", "right"],
      onSuccess: () => console.log("🎉 Konami Code activated!"),
    },
  ],
  timeout: 3000,
})

engine.start()

// When done:
// engine.destroy()
```

> For React projects, `secret-sequence-react` (coming soon) will provide a `useSecretSequence` hook built on top of the core engine.

---

## Features

* ✅ Multi-sequence detection
* ✅ Directional + key combination support
* ✅ Touch gesture detection (swipes)
* ✅ Timeout-based reset
* ✅ Independent progress tracking
* ✅ Headless (bring your own UI)
* ✅ SSR-safe
* ✅ Fully typed with TypeScript
* ✅ Tree-shakeable
* ✅ Zero runtime dependencies
* ✅ Framework-agnostic

---

## Roadmap

* [ ] Smart partial matching (KMP algorithm)
* [x] Advanced touch gesture support
* [ ] Custom event targets
* [ ] Devtools debug mode
* [ ] React wrapper package

---

## Inspiration

Inspired by the stratagem input system in **Helldivers 2**, where players input directional sequences under pressure to call tactical support.

Secret Sequence brings that same fast, sequential, multi-pattern input detection to the web.

---

## Keywords

* input sequence engine
* konami code detection
* directional input handler
* keyboard sequence detection
* touch gesture sequence

---

## Contributing

Contributions, issues, and feature requests are welcome.

Feel free to open an issue or submit a pull request.

---

## License

MIT © Diego Alonso