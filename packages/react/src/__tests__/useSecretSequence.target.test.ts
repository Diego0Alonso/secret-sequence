import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useSecretSequence } from "../useSecretSequence"
import type { Direction } from "secret-sequence-core"

describe("useSecretSequence — target option", () => {
    beforeEach(() => vi.useFakeTimers())
    afterEach(() => vi.useRealTimers())

    it("escucha en el target provisto en vez de window", () => {
        const onSuccess = vi.fn()
        const el = document.createElement("div")

        renderHook(() =>
            useSecretSequence({
                sequences: [{ id: "t", sequence: ["up"] as Direction[], onSuccess }],
                target: el,
            })
        )

        act(() => {
            el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }))
        })

        expect(onSuccess).toHaveBeenCalledOnce()
    })

    it("no responde a eventos de window cuando hay un target custom", () => {
        const onSuccess = vi.fn()
        const el = document.createElement("div")

        renderHook(() =>
            useSecretSequence({
                sequences: [{ id: "t", sequence: ["up"] as Direction[], onSuccess }],
                target: el,
            })
        )

        act(() => {
            window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }))
        })

        expect(onSuccess).not.toHaveBeenCalled()
    })

    it("re-engancha los listeners cuando cambia el target", () => {
        const onSuccess = vi.fn()
        const elA = document.createElement("div")
        const elB = document.createElement("div")

        const { rerender } = renderHook(
            ({ target }) =>
                useSecretSequence({
                    sequences: [{ id: "t", sequence: ["up"] as Direction[], onSuccess }],
                    target,
                }),
            { initialProps: { target: elA as EventTarget } }
        )

        rerender({ target: elB })

        // El target viejo ya no dispara
        act(() => {
            elA.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }))
        })
        expect(onSuccess).not.toHaveBeenCalled()

        // El nuevo target sí
        act(() => {
            elB.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }))
        })
        expect(onSuccess).toHaveBeenCalledOnce()
    })
})
