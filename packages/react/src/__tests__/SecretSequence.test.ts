import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, act } from "@testing-library/react"
import React from "react"
import { SecretSequence, type SecretSequenceProps } from "../SecretSequence"
import type { Direction } from "secret-sequence-core"

// --- Helpers ---

function pressDirections(directions: Direction[]) {
    const keyMap: Record<Direction, string> = {
        up: "ArrowUp",
        down: "ArrowDown",
        left: "ArrowLeft",
        right: "ArrowRight",
    }
    for (const dir of directions) {
        window.dispatchEvent(
            new KeyboardEvent("keydown", { key: keyMap[dir], bubbles: true })
        )
    }
}

// --- Tests ---

describe("SecretSequence", () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it("no renderiza nada sin children", () => {
        const { container } = render(
            React.createElement(SecretSequence, {
                sequences: [
                    { id: "test", sequence: ["up", "down"] as Direction[], onSuccess: vi.fn() },
                ],
            })
        )

        expect(container.innerHTML).toBe("")
    })

    it("render prop recibe progress y reset", () => {
        const renderProp = vi.fn().mockReturnValue(null)

        render(
            React.createElement(SecretSequence, {
                sequences: [
                    { id: "test", sequence: ["up", "down"] as Direction[], onSuccess: vi.fn() },
                ],
                children: renderProp,
            })
        )

        expect(renderProp).toHaveBeenCalledWith(
            expect.objectContaining({
                progress: { test: 0 },
                reset: expect.any(Function),
            })
        )
    })

    it("render prop se actualiza con el progreso", () => {
        const renderProp = vi.fn().mockReturnValue(null)

        render(
            React.createElement(SecretSequence, {
                sequences: [
                    { id: "test", sequence: ["up", "down", "left"] as Direction[], onSuccess: vi.fn() },
                ],
                children: renderProp,
            })
        )

        act(() => {
            pressDirections(["up"])
        })

        const lastCall = renderProp.mock.calls[renderProp.mock.calls.length - 1]
        expect(lastCall[0].progress).toEqual({ test: 1 })
    })

    it("onProgressChange se invoca cuando cambia el progreso", () => {
        const onProgressChange = vi.fn()

        render(
            React.createElement(SecretSequence, {
                sequences: [
                    { id: "test", sequence: ["up", "down"] as Direction[], onSuccess: vi.fn() },
                ],
                onProgressChange,
            })
        )

        act(() => {
            pressDirections(["up"])
        })

        // onProgressChange debe haberse llamado con el progreso actualizado
        expect(onProgressChange).toHaveBeenCalledWith(
            expect.objectContaining({ test: 1 })
        )
    })

    it("completa secuencia via componente", () => {
        const onSuccess = vi.fn()

        render(
            React.createElement(SecretSequence, {
                sequences: [
                    { id: "test", sequence: ["up", "down"] as Direction[], onSuccess },
                ],
            })
        )

        act(() => {
            pressDirections(["up", "down"])
        })

        expect(onSuccess).toHaveBeenCalledOnce()
    })
})
