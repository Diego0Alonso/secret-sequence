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

> Hook y componente de React para detectar secuencias direccionales, combinaciones de teclas y gestos táctiles — potenciado por [secret-sequence-core](../core/README_ES.md).

Este paquete provee las **bindings de React** para el monorepo [Secret Sequence](../../README_ES.md).  
Envuelve el motor core en un hook y un componente declarativo con gestión completa del ciclo de vida.

</div>

---

## Instalación

```bash
npm install secret-sequence-react secret-sequence-core
````

> `secret-sequence-core` es una peer dependency.

---

## Inicio Rápido

### Hook — `useSecretSequence`

```tsx
import { useSecretSequence } from "secret-sequence-react"

function App() {
  const { progress } = useSecretSequence({
    sequences: [
      {
        id: "konami",
        sequence: ["up", "up", "down", "down", "left", "right", "left", "right"],
        onSuccess: () => alert("🎉 ¡Código Konami activado!"),
      },
    ],
    enableTouch: true,
    touchOptions: { minDistance: 50, maxTime: 400 },
  })

  return <pre>{JSON.stringify(progress, null, 2)}</pre>
}
```

---

### Componente — `<SecretSequence />`

#### Modo Invisible (solo efecto)

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

#### Con render prop

```tsx
<SecretSequence
  sequences={[{ id: "code", sequence: ["up", "down"], onSuccess: fn }]}
>
  {({ progress, reset }) => (
    <div>
      <p>Progreso: {JSON.stringify(progress)}</p>
      <button onClick={reset}>Reset</button>
    </div>
  )}
</SecretSequence>
```

---

### Input Estilo Stratagem

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

### Atajo con Combinación de Teclas

```tsx
const { progress } = useSecretSequence({
  sequences: [
    {
      id: "shortcut",
      sequence: [{ key: "k", ctrl: true }],
      onSuccess: () => console.log("Atajo activado"),
    },
  ],
})
```

---

### Soporte de Gestos Táctiles

Los gestos de swipe en dispositivos táctiles se mapean automáticamente a pasos direccionales.

```tsx
const { progress } = useSecretSequence({
  sequences: [
    {
      id: "swipe-pattern",
      sequence: ["up", "down", "left", "right"],
      onSuccess: () => alert("¡Patrón de swipe detectado!"),
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

Hook de React que gestiona el ciclo de vida del engine automáticamente.

**Retorna:** `{ progress, reset }`

| Retorno    | Tipo                       | Descripción                             |
| ---------- | -------------------------- | --------------------------------------- |
| `progress` | `Record<string, number>`   | Progreso actual por secuencia           |
| `reset`    | `() => void`               | Reiniciar el progreso de las secuencias |

---

### Componente `<SecretSequence />`

Wrapper JSX declarativo sobre el hook `useSecretSequence`.

| Prop               | Tipo                                                                    | Descripción                                     |
| ------------------ | ----------------------------------------------------------------------- | ----------------------------------------------- |
| `onProgressChange` | `(progress: Record<string, number>) => void`                            | Callback invocado cuando cambia el progreso      |
| `children`         | `(state: { progress: Record<string, number>; reset: () => void }) => …` | Render prop opcional para progreso/reset         |
| *...hookOptions*   | `UseSecretSequenceOptions`                                              | Todas las opciones del hook (ver abajo)          |

---

### Opciones (compartidas por hook y componente)

| Opción         | Tipo                     | Default | Descripción                                                    |
| -------------- | ------------------------ | ------- | -------------------------------------------------------------- |
| `sequences`    | `SecretSequenceConfig[]` | —       | Array de secuencias a detectar simultáneamente                 |
| `timeout`      | `number`                 | `2000`  | Milisegundos de inactividad antes de reiniciar el progreso     |
| `enabled`      | `boolean`                | `true`  | Habilitar o deshabilitar la detección globalmente              |
| `enableTouch`  | `boolean`                | `true`  | Habilitar detección de gestos de swipe                         |
| `ignoreInputs` | `boolean`                | `true`  | Ignorar eventos de tecla en elementos tipo input               |
| `touchOptions` | `TouchConfig`            | —       | Configuración avanzada de touch                                |

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

---

### `TouchConfig`

| Propiedad     | Tipo     | Default | Descripción                                               |
| ------------- | -------- | ------- | --------------------------------------------------------- |
| `minDistance`  | `number` | `30`    | Distancia mínima del swipe (px)                           |
| `maxTime`     | `number` | `300`   | Duración máxima del swipe (ms)                            |
| `threshold`   | `number` | `1.5`   | Ratio de dominancia de eje para rechazar swipes diagonales |

---

## Compatibilidad SSR

Este paquete es seguro para usar en entornos SSR como Next.js o Remix.

El motor subyacente protege contra el acceso a `window` durante el renderizado del servidor y solo registra event listeners en el navegador.

---

## Licencia

MIT © Diego Alonso
