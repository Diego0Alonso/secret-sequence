import { describe, it, expect } from "vitest"
import { detectSwipe, type TouchPoint, type TouchConfig } from "../touchGestures"

/**
 * Helper para crear un TouchPoint rápidamente.
 */
function point(x: number, y: number, time = 0): TouchPoint {
    return { x, y, time }
}

describe("detectSwipe", () => {
    // --- Detección de dirección ---

    it("detecta swipe right", () => {
        const result = detectSwipe(point(0, 0, 0), point(100, 0, 100))
        expect(result).toBe("right")
    })

    it("detecta swipe left", () => {
        const result = detectSwipe(point(100, 0, 0), point(0, 0, 100))
        expect(result).toBe("left")
    })

    it("detecta swipe down", () => {
        const result = detectSwipe(point(0, 0, 0), point(0, 100, 100))
        expect(result).toBe("down")
    })

    it("detecta swipe up", () => {
        const result = detectSwipe(point(0, 100, 0), point(0, 0, 100))
        expect(result).toBe("up")
    })

    // --- Rechazos ---

    it("retorna null si la distancia es menor a minDistance (default 30)", () => {
        const result = detectSwipe(point(0, 0, 0), point(10, 0, 100))
        expect(result).toBeNull()
    })

    it("retorna null si el tiempo excede maxTime (default 300)", () => {
        const result = detectSwipe(point(0, 0, 0), point(100, 0, 500))
        expect(result).toBeNull()
    })

    it("retorna null si elapsed es 0", () => {
        const result = detectSwipe(point(0, 0, 100), point(100, 0, 100))
        expect(result).toBeNull()
    })

    it("retorna null si elapsed es negativo", () => {
        const result = detectSwipe(point(0, 0, 200), point(100, 0, 100))
        expect(result).toBeNull()
    })

    it("retorna null para swipe diagonal (ratio bajo threshold)", () => {
        // dx = 50, dy = 50 → ratio = 1.0 → menor que threshold default (1.5)
        const result = detectSwipe(point(0, 0, 0), point(50, 50, 100))
        expect(result).toBeNull()
    })

    // --- Configuración personalizada ---

    it("respeta minDistance personalizado", () => {
        const config: TouchConfig = { minDistance: 200 }
        const result = detectSwipe(point(0, 0, 0), point(100, 0, 100), config)
        expect(result).toBeNull()
    })

    it("respeta maxTime personalizado", () => {
        const config: TouchConfig = { maxTime: 1000 }
        // Con maxTime default (300) esto fallaría, pero con 1000 pasa
        const result = detectSwipe(point(0, 0, 0), point(100, 0, 800), config)
        expect(result).toBe("right")
    })

    it("respeta threshold personalizado", () => {
        // dx=50, dy=40 → ratio 1.25, menor que default 1.5 pero mayor que 1.0
        const config: TouchConfig = { threshold: 1.0 }
        const result = detectSwipe(point(0, 0, 0), point(50, 40, 100), config)
        expect(result).toBe("right")
    })

    it("acepta swipe cuando secondary es 0 (perfectamente recto)", () => {
        // Swipe perfectamente horizontal: dy = 0, no se aplica threshold
        const result = detectSwipe(point(0, 0, 0), point(100, 0, 100))
        expect(result).toBe("right")
    })
})
