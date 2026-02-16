<div align="center">

# Secret Sequence Core

[![en](https://img.shields.io/badge/lang-en-red.svg)](./README.md)
[![es](https://img.shields.io/badge/lang-es-yellow.svg)](./README_ES.md)

![GitHub stars](https://img.shields.io/github/stars/Diego0Alonso/secret-sequence-core)
![GitHub Forks](https://img.shields.io/github/forks/Diego0Alonso/secret-sequence-core)
![GitHub issues](https://img.shields.io/github/issues/Diego0Alonso/secret-sequence-core)
![npm version](https://img.shields.io/npm/v/secret-sequence-core)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/secret-sequence-core)

![React](https://img.shields.io/badge/React-%3E%3D18-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)

Un motor de input headless estilo stratagem para React.

Inspirado en los sistemas de input de juegos como **Helldivers 2**, este hook permite detectar secuencias direccionales y combinaciones de teclas con manejo de timeout, seguimiento de progreso y soporte multi-secuencia.

</div>

---

## ¿Por qué?

Perfecto para:

- 🎮 Easter eggs y experiencias web tipo videojuego
- 🔐 Paneles de administración ocultos
- 🛠 Atajos para desarrolladores
- 🧩 Sistemas UI interactivos
- ⚡ Patrones de input estilo stratagem

---

## Instalación

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

## Inicio Rápido

### Input Estilo Stratagem

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

### Código Konami

```tsx
useSecretSequence({
  sequences: [
    {
      id: "konami",
      sequence: ["up", "up", "down", "down", "left", "right", "left", "right"],
      onSuccess: () => alert("🎉 ¡Código Konami activado!"),
    },
  ],
  timeout: 3000,
})
```

---

### Atajo con Combinación de Teclas

```tsx
useSecretSequence({
  sequences: [
    {
      sequence: [{ key: "k", ctrl: true }],
      onSuccess: () => console.log("¡Atajo activado!"),
    },
  ],
})
```

---

### Soporte de Gestos Táctiles

Los swipes en dispositivos táctiles se mapean automáticamente a pasos direccionales:

```tsx
useSecretSequence({
  sequences: [
    {
      id: "konami",
      sequence: ["up", "up", "down", "down", "left", "right", "left", "right"],
      onSuccess: () => alert("🎉 ¡Código Konami activado!"),
    },
  ],
  enableTouch: true, // habilitado por defecto
  touchOptions: {
    minDistance: 30,  // distancia mínima del swipe en px
    maxTime: 300,     // duración máxima del swipe en ms
    threshold: 1.5,   // ratio para rechazar swipes diagonales
  },
})
```

---

### Múltiples Secuencias

```tsx
const { progressMap } = useSecretSequence({
  sequences: [
    {
      id: "konami",
      sequence: ["up", "up", "down", "down", "left", "right", "left", "right"],
      onSuccess: () => console.log("¡Konami!"),
    },
    {
      id: "desbloquear",
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
```

---

## API

### `useSecretSequence(options)`

#### Opciones

| Opción          | Tipo                                                  | Por defecto | Descripción                                                                                            |
| --------------- | ----------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------ |
| `sequences`     | `SecretSequenceConfig[]`                              | —           | Array de configuraciones de secuencias a detectar simultáneamente                                      |
| `timeout`       | `number`                                              | `2000`      | Milisegundos de inactividad antes de reiniciar todo el progreso                                        |
| `enabled`       | `boolean`                                             | `true`      | Activa o desactiva toda la detección                                                                   |
| `enableTouch`   | `boolean`                                             | `true`      | Activa detección de gestos táctiles (swipes mapeados a direcciones)                                    |
| `ignoreInputs`  | `boolean`                                             | `true`      | Ignora eventos de teclado cuando el foco está en `<input>`, `<textarea>` o elementos `contentEditable` |
| `touchOptions`  | `TouchConfig`                                         | —           | Configuración avanzada de sensibilidad táctil (ver abajo)                                              |
| `onProgress`    | `(id: string \| undefined, progress: number) => void` | —           | Callback que se ejecuta en cada paso correcto                                                          |

---

### `SecretSequenceConfig`

| Propiedad   | Tipo                  | Descripción                                                                  |
| ----------- | --------------------- | ---------------------------------------------------------------------------- |
| `id`        | `string` *(opcional)* | Identificador único de la secuencia (por defecto usa el índice del array)    |
| `sequence`  | `SequenceStep[]`      | Pasos a detectar                                                             |
| `onSuccess` | `() => void`          | Callback que se ejecuta al completar la secuencia                            |

---

### Tipos

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

* Una cadena `Direction` (mapeada a las teclas de flecha)
* Un objeto `KeyCombo` para cualquier tecla con modificadores opcionales

---

### `TouchConfig`

| Propiedad     | Tipo     | Por defecto | Descripción                                                                   |
| ------------- | -------- | ----------- | ----------------------------------------------------------------------------- |
| `minDistance`  | `number` | `30`        | Distancia mínima del swipe en píxeles                                         |
| `maxTime`      | `number` | `300`       | Duración máxima del swipe en milisegundos                                     |
| `threshold`    | `number` | `1.5`       | Ratio mínimo entre eje dominante y secundario para rechazar swipes diagonales |

---

### Valor de Retorno

| Propiedad     | Tipo                     | Descripción                                          |
| ------------- | ------------------------ | ---------------------------------------------------- |
| `progressMap` | `Record<string, number>` | Progreso actual de cada secuencia, indexado por `id` |
| `reset`       | `() => void`             | Reinicia manualmente todas las secuencias            |

---

## Compatibilidad con SSR

Este hook es seguro para entornos SSR como Next.js y Remix.

Protege el acceso a `window` durante el renderizado en servidor y solo registra listeners en el cliente.

---

## Características

* ✅ Detección multi-secuencia
* ✅ Soporte direccional + combinaciones de teclas
* ✅ Soporte de gestos táctiles (detección de swipes)
* ✅ Reset basado en timeout
* ✅ Seguimiento de progreso independiente
* ✅ Headless (trae tu propia UI)
* ✅ Compatible con SSR
* ✅ Tipado completo con TypeScript
* ✅ Tree-shakeable
* ✅ Sin dependencias más allá de React

---

## Hoja de Ruta

* [ ] Coincidencia parcial inteligente (algoritmo KMP)
* [x] Soporte avanzado de gestos táctiles
* [ ] Targets de eventos personalizados
* [ ] Modo de depuración con devtools
* [ ] Paquete complementario con UI opcional

---

## Inspiración

> Inspirado en el sistema de input de stratagems de **Helldivers 2** — donde los jugadores introducen secuencias direccionales bajo presión para solicitar soporte táctico.

Este hook lleva ese mismo patrón a la web: detección de input secuencial, rápida y multi-patrón.

---

## Contribuir

Contribuciones, issues y solicitudes de funcionalidades son bienvenidas.

No dudes en abrir un issue o enviar un pull request.

---

## Licencia

MIT © Diego0Alonso
