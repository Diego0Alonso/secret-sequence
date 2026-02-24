import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useSecretSequence } from "../useSecretSequence"
import type { Direction } from "secret-sequence-core"

// --- Helpers ---

const keyMap: Record<Direction, string> = {
    up: "ArrowUp",
    down: "ArrowDown",
    left: "ArrowLeft",
    right: "ArrowRight",
}

function pressKey(key: string) {
    window.dispatchEvent(
        new KeyboardEvent("keydown", { key, bubbles: true })
    )
}

function pressDirections(directions: Direction[]) {
    for (const dir of directions) {
        pressKey(keyMap[dir])
    }
}

// --- Tests ---

describe("useSecretSequence", () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it("retorna progress y reset", () => {
        const { result } = renderHook(() =>
            useSecretSequence({
                sequences: [
                    { id: "test", sequence: ["up", "down"], onSuccess: vi.fn() },
                ],
            })
        )

        expect(result.current.progress).toEqual({ test: 0 })
        expect(typeof result.current.reset).toBe("function")
    })

    it("actualiza progress al presionar teclas", () => {
        const { result } = renderHook(() =>
            useSecretSequence({
                sequences: [
                    { id: "test", sequence: ["up", "down", "left"] as Direction[], onSuccess: vi.fn() },
                ],
            })
        )

        act(() => {
            pressDirections(["up"])
        })

        expect(result.current.progress).toEqual({ test: 1 })

        act(() => {
            pressDirections(["down"])
        })

        expect(result.current.progress).toEqual({ test: 2 })
    })

    it("llama onSuccess al completar la secuencia", () => {
        const onSuccess = vi.fn()
        const { result } = renderHook(() =>
            useSecretSequence({
                sequences: [
                    { id: "test", sequence: ["up", "down"] as Direction[], onSuccess },
                ],
            })
        )

        act(() => {
            pressDirections(["up", "down"])
        })

        expect(onSuccess).toHaveBeenCalledOnce()
        // Progreso se resetea tras completar
        expect(result.current.progress).toEqual({ test: 0 })
    })

    it("reset() vuelve el progreso a 0", () => {
        const { result } = renderHook(() =>
            useSecretSequence({
                sequences: [
                    { id: "test", sequence: ["up", "down", "left"] as Direction[], onSuccess: vi.fn() },
                ],
            })
        )

        act(() => {
            pressDirections(["up", "down"])
        })

        expect(result.current.progress).toEqual({ test: 2 })

        act(() => {
            result.current.reset()
        })

        expect(result.current.progress).toEqual({ test: 0 })
    })

    it("no procesa eventos si enabled es false", () => {
        const onSuccess = vi.fn()
        const { result } = renderHook(() =>
            useSecretSequence({
                sequences: [
                    { id: "test", sequence: ["up", "down"] as Direction[], onSuccess },
                ],
                enabled: false,
            })
        )

        act(() => {
            pressDirections(["up", "down"])
        })

        expect(onSuccess).not.toHaveBeenCalled()
        expect(result.current.progress).toEqual({ test: 0 })
    })

    it("limpia listeners al desmontar", () => {
        const onSuccess = vi.fn()
        const { unmount } = renderHook(() =>
            useSecretSequence({
                sequences: [
                    { id: "test", sequence: ["up", "down"] as Direction[], onSuccess },
                ],
            })
        )

        unmount()

        act(() => {
            pressDirections(["up", "down"])
        })

        expect(onSuccess).not.toHaveBeenCalled()
    })

    it("re-crea el engine cuando cambia enabled", () => {
        const onSuccess = vi.fn()
        let enabled = false

        const { result, rerender } = renderHook(() =>
            useSecretSequence({
                sequences: [
                    { id: "test", sequence: ["up", "down"] as Direction[], onSuccess },
                ],
                enabled,
            })
        )

        // Con enabled=false, no detecta
        act(() => {
            pressDirections(["up", "down"])
        })
        expect(onSuccess).not.toHaveBeenCalled()

        // Activar
        enabled = true
        rerender()

        act(() => {
            pressDirections(["up", "down"])
        })
        expect(onSuccess).toHaveBeenCalledOnce()
    })

    it("trackea múltiples secuencias independientemente", () => {
        const onSuccessA = vi.fn()
        const onSuccessB = vi.fn()

        const { result } = renderHook(() =>
            useSecretSequence({
                sequences: [
                    { id: "a", sequence: ["up", "up"] as Direction[], onSuccess: onSuccessA },
                    { id: "b", sequence: ["up", "down"] as Direction[], onSuccess: onSuccessB },
                ],
            })
        )

        act(() => {
            pressDirections(["up"])
        })

        expect(result.current.progress).toEqual({ a: 1, b: 1 })

        act(() => {
            pressDirections(["down"])
        })

        // "a" se resetea (esperaba "up"), "b" completa
        expect(onSuccessA).not.toHaveBeenCalled()
        expect(onSuccessB).toHaveBeenCalledOnce()
    })

    it("resetea progreso tras timeout", () => {
        const { result } = renderHook(() =>
            useSecretSequence({
                sequences: [
                    { id: "test", sequence: ["up", "down", "left"] as Direction[], onSuccess: vi.fn() },
                ],
                timeout: 1000,
            })
        )

        act(() => {
            pressDirections(["up"])
        })

        expect(result.current.progress).toEqual({ test: 1 })

        // Avanzar el tiempo más allá del timeout
        act(() => {
            vi.advanceTimersByTime(1100)
        })

        // Tras el timeout, si presionamos "up" de nuevo, el progreso
        // debería ser 1 (re-inició) en vez de seguir avanzando desde donde estaba
        act(() => {
            pressDirections(["up"])
        })

        expect(result.current.progress).toEqual({ test: 1 })
    })
})
