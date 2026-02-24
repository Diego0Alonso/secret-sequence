<div align="center">

# Secret Sequence

[![en](https://img.shields.io/badge/lang-en-red.svg)](./README.md)
[![es](https://img.shields.io/badge/lang-es-yellow.svg)](./README_ES.md)

![GitHub stars](https://img.shields.io/github/stars/Diego0Alonso/secret-sequence)
![GitHub forks](https://img.shields.io/github/forks/Diego0Alonso/secret-sequence)
![GitHub issues](https://img.shields.io/github/issues/Diego0Alonso/secret-sequence)
[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-GitHub-pink?logo=github)](https://github.com/sponsors/Diego0Alonso)

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)

Un ecosistema modular de motor de input agnóstico de framework para la web.

Un motor de patrones de input estilo stratagem inspirado en juegos como **Helldivers 2**, que trae secuencias direccionales, combinaciones de teclas y detección de gestos táctiles a aplicaciones web modernas.

</div>

---

## Estructura del Monorepo

Este repositorio está organizado como un monorepo que contiene los siguientes paquetes:

| Paquete | Versión | Descripción |
|----------|----------|-------------|
| `secret-sequence-core` | [![npm](https://img.shields.io/npm/v/secret-sequence-core)](https://www.npmjs.com/package/secret-sequence-core) | Motor de input agnóstico de framework |
| `secret-sequence-react` | [![npm](https://img.shields.io/npm/v/secret-sequence-react)](https://www.npmjs.com/package/secret-sequence-react) | Wrapper de React hook |
| `secret-sequence-angular` *(planificado)* | — | Wrapper de directiva Angular |
| `secret-sequence-ui` *(futuro)* | — | Componentes UI opcionales |

---

## ¿Por qué?

Secret Sequence es perfecto para:

- 🎮 Easter eggs y experiencias web tipo videojuego  
- 🔐 Paneles de administración ocultos  
- 🛠 Atajos para desarrolladores  
- 🧩 Sistemas UI interactivos  
- ⚡ Mecánicas de input estilo stratagem  

---

## Filosofía

Secret Sequence sigue una arquitectura por capas:

- **Core** → Lógica pura, cero dependencias de framework  
- **Wrappers** → Integraciones específicas de framework (React, Angular, Vue)  
- **UI (opcional)** → Componentes visuales construidos encima  

Esta separación asegura escalabilidad a largo plazo, portabilidad e independencia de framework.

---

## Ecosistema

El proyecto está diseñado como un ecosistema en crecimiento:

- Motor core (headless)
- Wrappers de framework
- Componentes UI opcionales
- Devtools (planificado)

---

## Inicio Rápido

### Instalar el core

```bash
npm install secret-sequence-core
````

### Uso Básico (TypeScript Vanilla)

```ts
import { SecretSequenceEngine } from "secret-sequence-core"

const engine = new SecretSequenceEngine({
  sequences: [
    {
      id: "konami",
      sequence: ["up", "up", "down", "down", "left", "right", "left", "right"],
      onSuccess: () => console.log("🎉 ¡Código Konami activado!"),
    },
  ],
  timeout: 3000,
})

engine.start()

// Cuando ya no se necesite:
// engine.destroy()
```

### Uso con React

```bash
npm install secret-sequence-core secret-sequence-react
```

```tsx
import { useSecretSequence } from "secret-sequence-react"

function App() {
  const { progress } = useSecretSequence({
    sequences: [
      {
        id: "konami",
        sequence: ["up", "up", "down", "down", "left", "right", "left", "right"],
        onSuccess: () => console.log("🎉 ¡Código Konami activado!"),
      },
    ],
    enableTouch: true,
  })

  return <pre>{JSON.stringify(progress, null, 2)}</pre>
}
```

> Consultá la documentación completa del paquete [secret-sequence-react](./packages/react/README_ES.md).

---

## Características

* ✅ Detección multi-secuencia
* ✅ Soporte direccional + combinaciones de teclas
* ✅ Detección de gestos táctiles (swipes)
* ✅ Reset basado en timeout
* ✅ Seguimiento de progreso independiente
* ✅ Headless (traé tu propia UI)
* ✅ Compatible con SSR
* ✅ Tipado completo con TypeScript
* ✅ Tree-shakeable
* ✅ Cero dependencias en runtime
* ✅ Agnóstico de framework

---

## Hoja de Ruta

* [ ] Coincidencia parcial inteligente (algoritmo KMP)
* [x] Soporte avanzado de gestos táctiles
* [ ] Targets de eventos personalizados
* [ ] Modo de depuración con devtools
* [x] Paquete wrapper para React (`secret-sequence-react`)

---

## Inspiración

Inspirado en el sistema de input de stratagems de **Helldivers 2**, donde los jugadores introducen secuencias direccionales bajo presión para solicitar soporte táctico.

Secret Sequence lleva esa misma detección de input secuencial, rápida y multi-patrón a la web.

---

## Palabras Clave

* motor de secuencias de input
* detección de código konami
* manejador de input direccional
* detección de secuencias de teclado
* secuencia de gestos táctiles

---

## Contribuir

Contribuciones, issues y solicitudes de funcionalidades son bienvenidas.

No dudes en abrir un issue o enviar un pull request.

---

## Licencia

MIT © Diego Alonso
