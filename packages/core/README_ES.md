<div align="center">

# Secret Sequence Core

[![en](https://img.shields.io/badge/lang-en-red.svg)](./README.md)
[![es](https://img.shields.io/badge/lang-es-yellow.svg)](./README_ES.md)

![GitHub stars](https://img.shields.io/github/stars/Diego0Alonso/secret-sequence)
![GitHub forks](https://img.shields.io/github/forks/Diego0Alonso/secret-sequence)
![GitHub issues](https://img.shields.io/github/issues/Diego0Alonso/secret-sequence)
[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-GitHub-pink?logo=github)](https://github.com/sponsors/Diego0Alonso)

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)

> Motor de input agnóstico de framework para detectar secuencias direccionales, combinaciones de teclas y gestos táctiles — escrito en TypeScript puro con cero dependencias en runtime.

Este paquete es el **motor core** del monorepo [Secret Sequence](../../README_ES.md).  
Contiene toda la lógica de detección de input y puede ejecutarse en cualquier entorno JavaScript o TypeScript.

</div>

---

## Instalación

```bash
npm install secret-sequence-core
````

---

## Inicio Rápido

### Input Estilo Stratagem

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
    console.log(`${id}: ${progress} pasos completados`)
  },
})

engine.start()
```

---

### Código Konami

```ts
const engine = new SecretSequenceEngine({
  sequences: [
    {
      id: "konami",
      sequence: ["up", "up", "down", "down", "left", "right", "left", "right"],
      onSuccess: () => alert("🎉 ¡Código Konami activado!"),
    },
  ],
  timeout: 3000,
})

engine.start()
```

---

### Atajo con Combinación de Teclas

```ts
const engine = new SecretSequenceEngine({
  sequences: [
    {
      id: "shortcut",
      sequence: [{ key: "k", ctrl: true }],
      onSuccess: () => console.log("Atajo activado"),
    },
  ],
})

engine.start()
```

---

### Soporte de Gestos Táctiles

Los gestos de swipe en dispositivos táctiles se mapean automáticamente a pasos direccionales.

```ts
const engine = new SecretSequenceEngine({
  sequences: [
    {
      id: "konami",
      sequence: ["up", "up", "down", "down", "left", "right", "left", "right"],
      onSuccess: () => alert("🎉 ¡Código Konami activado!"),
    },
  ],
  enableTouch: true, // habilitado por defecto
  touchOptions: {
    minDistance: 30,  // distancia mínima del swipe (px)
    maxTime: 300,     // duración máxima del swipe (ms)
    threshold: 1.5,   // ratio del eje dominante para rechazar diagonales
  },
})

engine.start()
```

---

### Múltiples Secuencias

```ts
const engine = new SecretSequenceEngine({
  sequences: [
    {
      id: "konami",
      sequence: ["up", "up", "down", "down", "left", "right", "left", "right"],
      onSuccess: () => console.log("¡Konami!"),
    },
    {
      id: "unlock",
      sequence: [
        { key: "k", ctrl: true },
        { key: "u", ctrl: true },
      ],
      onSuccess: () => console.log("¡Ctrl+K → Ctrl+U desbloqueado!"),
    },
  ],
  onProgress: (id, progress) => {
    console.log(`Secuencia "${id}" progreso: ${progress}`)
  },
})

engine.start()
```

---

## API

### `new SecretSequenceEngine(options)`

Crea una nueva instancia del motor.

---

### Opciones

| Opción         | Tipo                                                  | Default | Descripción                                                    |
| -------------- | ----------------------------------------------------- | ------- | -------------------------------------------------------------- |
| `sequences`    | `SecretSequenceConfig[]`                              | —       | Array de secuencias a detectar simultáneamente                 |
| `timeout`      | `number`                                              | `2000`  | Milisegundos de inactividad antes de reiniciar el progreso     |
| `enabled`      | `boolean`                                             | `true`  | Habilitar o deshabilitar la detección globalmente              |
| `enableTouch`  | `boolean`                                             | `true`  | Habilitar detección de gestos de swipe                         |
| `ignoreInputs` | `boolean`                                             | `true`  | Ignorar eventos de tecla en elementos tipo input               |
| `touchOptions` | `TouchConfig`                                         | —       | Configuración avanzada de touch                                |
| `onProgress`   | `(id: string \| undefined, progress: number) => void` | —       | Se dispara en cada paso exitoso                                |

---

### Métodos

| Método             | Retorna                  | Descripción                                                     |
| ------------------ | ------------------------ | --------------------------------------------------------------- |
| `start()`          | `void`                   | Registrar event listeners                                       |
| `stop()`           | `void`                   | Remover event listeners                                         |
| `destroy()`        | `void`                   | Detener la detección y reiniciar el progreso                    |
| `reset()`          | `void`                   | Reiniciar el progreso de todas las secuencias                   |
| `getProgressMap()` | `Record<string, number>` | Obtener el estado actual de progreso                            |
| `setOptions(opts)` | `void`                   | Actualizar configuración en runtime (reinicia si está activo)   |

---

## Tipos de Configuración

### `SecretSequenceConfig`

| Propiedad   | Tipo                  | Descripción                                             |
| ----------- | --------------------- | ------------------------------------------------------- |
| `id`        | `string` *(opcional)* | Identificador único (por defecto usa el índice del array) |
| `sequence`  | `SequenceStep[]`      | Pasos ordenados a detectar                              |
| `onSuccess` | `() => void`          | Se dispara cuando la secuencia se completa              |

---

### Tipos Core

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

Un `SequenceStep` puede ser:

* Un string `Direction` (mapeado a teclas de flecha)
* Un objeto `KeyCombo` con teclas modificadoras opcionales

---

### `TouchConfig`

| Propiedad     | Tipo     | Default | Descripción                                               |
| ------------- | -------- | ------- | --------------------------------------------------------- |
| `minDistance`  | `number` | `30`    | Distancia mínima del swipe (px)                           |
| `maxTime`     | `number` | `300`   | Duración máxima del swipe (ms)                            |
| `threshold`   | `number` | `1.5`   | Ratio de dominancia de eje para rechazar swipes diagonales |

---

## Compatibilidad SSR

Este motor es seguro para usar en entornos SSR como Next.js o Remix.

Protege contra el acceso a `window` durante el renderizado del servidor y solo registra event listeners en el navegador.

---

## Licencia

MIT © Diego Alonso
