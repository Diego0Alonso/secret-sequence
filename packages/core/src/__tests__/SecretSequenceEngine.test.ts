import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
    SecretSequenceEngine,
    type SecretSequenceConfig,
    type SecretSequenceEngineOptions,
    type Direction,
} from "../SecretSequenceEngine"

// --- Helpers ---

/**
 * Envía una KeyboardEvent al window.
 */
function pressKey(key: string, modifiers: Partial<Pick<KeyboardEvent, "ctrlKey" | "shiftKey" | "altKey" | "metaKey">> = {}) {
    const event = new KeyboardEvent("keydown", {
        key,
        bubbles: true,
        ctrlKey: modifiers.ctrlKey ?? false,
        shiftKey: modifiers.shiftKey ?? false,
        altKey: modifiers.altKey ?? false,
        metaKey: modifiers.metaKey ?? false,
    })
    window.dispatchEvent(event)
}

/**
 * Envía una secuencia de teclas de dirección.
 */
function pressDirections(directions: Direction[]) {
    const keyMap: Record<Direction, string> = {
        up: "ArrowUp",
        down: "ArrowDown",
        left: "ArrowLeft",
        right: "ArrowRight",
    }
    for (const dir of directions) {
        pressKey(keyMap[dir])
    }
}

/**
 * Crea un engine con opciones simples para testing.
 */
function createEngine(overrides: Partial<SecretSequenceEngineOptions> = {}) {
    const onSuccess = vi.fn()
    const sequences: SecretSequenceConfig[] = overrides.sequences ?? [
        {
            id: "test",
            sequence: ["up", "down", "left", "right"] as Direction[],
            onSuccess,
        },
    ]

    const engine = new SecretSequenceEngine({
        sequences,
        timeout: 2000,
        ...overrides,
    })

    return { engine, onSuccess }
}

// --- Tests ---

describe("SecretSequenceEngine", () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    // --- Inicialización ---

    describe("inicialización", () => {
        it("crea el mapa de progreso correctamente", () => {
            const { engine } = createEngine()
            const progress = engine.getProgressMap()
            expect(progress).toEqual({ test: 0 })
            engine.destroy()
        })

        it("usa índice numérico si no se proporciona id", () => {
            const { engine } = createEngine({
                sequences: [
                    { sequence: ["up", "down"], onSuccess: vi.fn() },
                    { sequence: ["left", "right"], onSuccess: vi.fn() },
                ],
            })
            const progress = engine.getProgressMap()
            expect(progress).toEqual({ "0": 0, "1": 0 })
            engine.destroy()
        })
    })

    // --- Secuencia de direcciones ---

    describe("detección de secuencias de dirección", () => {
        it("completa secuencia y llama onSuccess", () => {
            const { engine, onSuccess } = createEngine()
            engine.start()

            pressDirections(["up", "down", "left", "right"])

            expect(onSuccess).toHaveBeenCalledOnce()
            engine.destroy()
        })

        it("resetea progreso después de completar la secuencia", () => {
            const { engine } = createEngine()
            engine.start()

            pressDirections(["up", "down", "left", "right"])

            expect(engine.getProgressMap()).toEqual({ test: 0 })
            engine.destroy()
        })

        it("avanza progreso parcialmente", () => {
            const { engine, onSuccess } = createEngine()
            engine.start()

            pressDirections(["up", "down"])

            expect(engine.getProgressMap()).toEqual({ test: 2 })
            expect(onSuccess).not.toHaveBeenCalled()
            engine.destroy()
        })

        it("resetea progreso con input incorrecto", () => {
            const { engine, onSuccess } = createEngine()
            engine.start()

            pressDirections(["up", "down"])
            pressKey("ArrowUp") // incorrecto, esperaba "left"

            expect(engine.getProgressMap()).toEqual({ test: 0 })
            expect(onSuccess).not.toHaveBeenCalled()
            engine.destroy()
        })

        it("ignora teclas no relacionadas", () => {
            const { engine } = createEngine()
            engine.start()

            pressDirections(["up"])
            pressKey("a")
            // Progreso se resetea porque "a" no coincide con "down"
            expect(engine.getProgressMap()).toEqual({ test: 0 })
            engine.destroy()
        })
    })

    // --- Key Combos ---

    describe("detección de key combos", () => {
        it("detecta Ctrl+K correctamente", () => {
            const onSuccess = vi.fn()
            const engine = new SecretSequenceEngine({
                sequences: [
                    {
                        id: "combo",
                        sequence: [{ key: "k", ctrl: true }],
                        onSuccess,
                    },
                ],
            })
            engine.start()

            pressKey("k", { ctrlKey: true })

            expect(onSuccess).toHaveBeenCalledOnce()
            engine.destroy()
        })

        it("no detecta combo si falta modifier", () => {
            const onSuccess = vi.fn()
            const engine = new SecretSequenceEngine({
                sequences: [
                    {
                        id: "combo",
                        sequence: [{ key: "k", ctrl: true }],
                        onSuccess,
                    },
                ],
            })
            engine.start()

            pressKey("k") // sin Ctrl

            expect(onSuccess).not.toHaveBeenCalled()
            engine.destroy()
        })

        it("detecta combo con múltiples modifiers", () => {
            const onSuccess = vi.fn()
            const engine = new SecretSequenceEngine({
                sequences: [
                    {
                        id: "combo",
                        sequence: [{ key: "s", ctrl: true, shift: true }],
                        onSuccess,
                    },
                ],
            })
            engine.start()

            pressKey("s", { ctrlKey: true, shiftKey: true })

            expect(onSuccess).toHaveBeenCalledOnce()
            engine.destroy()
        })

        it("mezcla direcciones y combos en una secuencia", () => {
            const onSuccess = vi.fn()
            const engine = new SecretSequenceEngine({
                sequences: [
                    {
                        id: "mixed",
                        sequence: ["up", "down", { key: "Enter" }],
                        onSuccess,
                    },
                ],
            })
            engine.start()

            pressDirections(["up", "down"])
            pressKey("Enter")

            expect(onSuccess).toHaveBeenCalledOnce()
            engine.destroy()
        })
    })

    // --- Múltiples secuencias ---

    describe("múltiples secuencias", () => {
        it("trackea progreso independiente", () => {
            const onSuccessA = vi.fn()
            const onSuccessB = vi.fn()
            const engine = new SecretSequenceEngine({
                sequences: [
                    { id: "a", sequence: ["up", "up"] as Direction[], onSuccess: onSuccessA },
                    { id: "b", sequence: ["up", "down"] as Direction[], onSuccess: onSuccessB },
                ],
            })
            engine.start()

            pressDirections(["up"])

            // Ambas avanzan en el primer paso (ambas esperan "up")
            expect(engine.getProgressMap()).toEqual({ a: 1, b: 1 })

            pressDirections(["down"])

            // "a" se resetea (esperaba "up"), "b" completa
            expect(onSuccessA).not.toHaveBeenCalled()
            expect(onSuccessB).toHaveBeenCalledOnce()
            engine.destroy()
        })
    })

    // --- Timeout ---

    describe("timeout", () => {
        it("resetea progreso después del timeout", () => {
            const { engine } = createEngine({ timeout: 1000 })
            engine.start()

            pressDirections(["up", "down"])
            expect(engine.getProgressMap()).toEqual({ test: 2 })

            vi.advanceTimersByTime(1100)
            expect(engine.getProgressMap()).toEqual({ test: 0 })
            engine.destroy()
        })

        it("no resetea si se sigue ingresando dentro del tiempo", () => {
            const { engine } = createEngine({ timeout: 1000 })
            engine.start()

            pressDirections(["up"])
            vi.advanceTimersByTime(500)
            pressDirections(["down"])
            vi.advanceTimersByTime(500)
            pressDirections(["left"])

            expect(engine.getProgressMap()).toEqual({ test: 3 })
            engine.destroy()
        })
    })

    // --- onProgress callback ---

    describe("onProgress", () => {
        it("se llama con el id y progreso correcto", () => {
            const onProgress = vi.fn()
            const { engine } = createEngine({ onProgress })
            engine.start()

            pressDirections(["up"])

            expect(onProgress).toHaveBeenCalledWith("test", 1)
            engine.destroy()
        })

        it("se llama en cada paso", () => {
            const onProgress = vi.fn()
            const { engine } = createEngine({ onProgress })
            engine.start()

            pressDirections(["up", "down", "left"])

            expect(onProgress).toHaveBeenCalledTimes(3)
            expect(onProgress).toHaveBeenNthCalledWith(1, "test", 1)
            expect(onProgress).toHaveBeenNthCalledWith(2, "test", 2)
            expect(onProgress).toHaveBeenNthCalledWith(3, "test", 3)
            engine.destroy()
        })
    })

    // --- ignoreInputs ---

    describe("ignoreInputs", () => {
        it("ignora eventos en elementos input por defecto", () => {
            const { engine, onSuccess } = createEngine()
            engine.start()

            const input = document.createElement("input")
            document.body.appendChild(input)

            const event = new KeyboardEvent("keydown", {
                key: "ArrowUp",
                bubbles: true,
            })
            Object.defineProperty(event, "target", { value: input })
            window.dispatchEvent(event)

            expect(engine.getProgressMap()).toEqual({ test: 0 })
            expect(onSuccess).not.toHaveBeenCalled()

            document.body.removeChild(input)
            engine.destroy()
        })

        it("procesa eventos en inputs si ignoreInputs es false", () => {
            const { engine } = createEngine({ ignoreInputs: false })
            engine.start()

            const input = document.createElement("input")
            document.body.appendChild(input)

            const event = new KeyboardEvent("keydown", {
                key: "ArrowUp",
                bubbles: true,
            })
            Object.defineProperty(event, "target", { value: input })
            window.dispatchEvent(event)

            expect(engine.getProgressMap()).toEqual({ test: 1 })

            document.body.removeChild(input)
            engine.destroy()
        })
    })

    // --- Lifecycle ---

    describe("lifecycle: start / stop / destroy", () => {
        it("no procesa eventos antes de start()", () => {
            const { engine, onSuccess } = createEngine()
            // No llamamos start()

            pressDirections(["up", "down", "left", "right"])

            expect(onSuccess).not.toHaveBeenCalled()
            engine.destroy()
        })

        it("no procesa eventos después de stop()", () => {
            const { engine, onSuccess } = createEngine()
            engine.start()
            engine.stop()

            pressDirections(["up", "down", "left", "right"])

            expect(onSuccess).not.toHaveBeenCalled()
            engine.destroy()
        })

        it("destroy detiene y resetea", () => {
            const { engine } = createEngine()
            engine.start()

            pressDirections(["up", "down"])
            expect(engine.getProgressMap()).toEqual({ test: 2 })

            engine.destroy()

            expect(engine.getProgressMap()).toEqual({ test: 0 })
        })

        it("puede reiniciarse después de stop", () => {
            const { engine, onSuccess } = createEngine()
            engine.start()
            engine.stop()
            engine.start()

            pressDirections(["up", "down", "left", "right"])

            expect(onSuccess).toHaveBeenCalledOnce()
            engine.destroy()
        })

        it("start() múltiple no duplica listeners", () => {
            const onProgress = vi.fn()
            const { engine } = createEngine({ onProgress })
            engine.start()
            engine.start() // segunda llamada no debería agregar otro listener

            pressDirections(["up"])

            // Solo 1 llamada a onProgress, no 2
            expect(onProgress).toHaveBeenCalledTimes(1)
            engine.destroy()
        })
    })

    // --- setOptions ---

    describe("setOptions", () => {
        it("actualiza secuencias en caliente", () => {
            const onSuccessA = vi.fn()
            const onSuccessB = vi.fn()

            const engine = new SecretSequenceEngine({
                sequences: [
                    { id: "a", sequence: ["up"] as Direction[], onSuccess: onSuccessA },
                ],
            })
            engine.start()

            engine.setOptions({
                sequences: [
                    { id: "b", sequence: ["down"] as Direction[], onSuccess: onSuccessB },
                ],
            })

            pressDirections(["down"])

            expect(onSuccessA).not.toHaveBeenCalled()
            expect(onSuccessB).toHaveBeenCalledOnce()
            engine.destroy()
        })

        it("actualiza enabled en caliente", () => {
            const { engine, onSuccess } = createEngine()
            engine.start()

            engine.setOptions({ enabled: false })
            pressDirections(["up", "down", "left", "right"])

            expect(onSuccess).not.toHaveBeenCalled()

            engine.setOptions({ enabled: true })
            pressDirections(["up", "down", "left", "right"])

            expect(onSuccess).toHaveBeenCalledOnce()
            engine.destroy()
        })
    })

    // --- enabled ---

    describe("enabled", () => {
        it("no procesa eventos si enabled es false", () => {
            const { engine, onSuccess } = createEngine({ enabled: false })
            engine.start()

            pressDirections(["up", "down", "left", "right"])

            expect(onSuccess).not.toHaveBeenCalled()
            engine.destroy()
        })
    })

    // --- reset ---

    describe("reset", () => {
        it("resetea todo el progreso", () => {
            const { engine } = createEngine()
            engine.start()

            pressDirections(["up", "down"])
            expect(engine.getProgressMap()).toEqual({ test: 2 })

            engine.reset()
            expect(engine.getProgressMap()).toEqual({ test: 0 })
            engine.destroy()
        })
    })
})
