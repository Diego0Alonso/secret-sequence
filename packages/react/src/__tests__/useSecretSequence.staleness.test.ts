import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useSecretSequence } from "../useSecretSequence"
import type { Direction } from "secret-sequence-core"

function pressKey(key: string) {
    window.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }))
}

describe("useSecretSequence — frescura de callbacks y re-renders", () => {
    beforeEach(() => vi.useFakeTimers())
    afterEach(() => vi.useRealTimers())

    // ① Regresión: cambiar solo onSuccess (mismas teclas) debe usar el callback ACTUAL.
    it("invoca el onSuccess actual tras cambiar solo el callback (misma secuencia)", () => {
        const oldCb = vi.fn()
        const newCb = vi.fn()

        const { rerender } = renderHook(
            ({ cb }) =>
                useSecretSequence({
                    sequences: [{ id: "shortcut", sequence: [{ key: "k" }], onSuccess: cb }],
                }),
            { initialProps: { cb: oldCb } }
        )

        rerender({ cb: newCb }) // cambia SOLO el callback, no las teclas

        act(() => pressKey("k"))

        expect(newCb).toHaveBeenCalledTimes(1)
        expect(oldCb).not.toHaveBeenCalled()
    })

    // ① bis: lo mismo en una secuencia direccional multistep.
    it("usa el onSuccess actual también en secuencias multistep", () => {
        const oldCb = vi.fn()
        const newCb = vi.fn()

        const { rerender } = renderHook(
            ({ cb }) =>
                useSecretSequence({
                    sequences: [
                        { id: "combo", sequence: ["up", "down"] as Direction[], onSuccess: cb },
                    ],
                }),
            { initialProps: { cb: oldCb } }
        )

        rerender({ cb: newCb })

        act(() => {
            pressKey("ArrowUp")
            pressKey("ArrowDown")
        })

        expect(newCb).toHaveBeenCalledTimes(1)
        expect(oldCb).not.toHaveBeenCalled()
    })

    // ② No re-render POR PULSACIÓN cuando el mapa de progreso no cambia de valor.
    // Nota: React puede emitir un único render en el primer setState de valor
    // idéntico (eager-bailout), así que medimos el churn DESPUÉS de un warmup:
    // las pulsaciones repetidas no deben añadir más renders.
    it("no acumula re-renders por pulsación (atajo de 1 tecla)", () => {
        let renders = 0
        renderHook(() => {
            renders++
            return useSecretSequence({
                sequences: [{ id: "s", sequence: [{ key: "k" }], onSuccess: vi.fn() }],
            })
        })

        act(() => pressKey("k")) // warmup: absorbe el render único de React
        const afterWarmup = renders

        act(() => pressKey("k"))
        act(() => pressKey("k"))
        act(() => pressKey("k"))

        // Tras el warmup, el mapa sigue en {s:0} → cero renders adicionales.
        expect(renders).toBe(afterWarmup)
    })

    // ② bis: el progreso real (secuencia parcial) SÍ debe seguir actualizándose.
    it("sigue actualizando progress en secuencias multistep", () => {
        const { result } = renderHook(() =>
            useSecretSequence({
                sequences: [
                    { id: "s", sequence: ["up", "down", "left"] as Direction[], onSuccess: vi.fn() },
                ],
            })
        )

        act(() => pressKey("ArrowUp"))
        expect(result.current.progress).toEqual({ s: 1 })

        act(() => pressKey("ArrowDown"))
        expect(result.current.progress).toEqual({ s: 2 })
    })
})
