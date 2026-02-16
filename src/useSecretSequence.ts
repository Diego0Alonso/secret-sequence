import { useEffect, useRef, useState, useCallback } from "react"
import { detectSwipe, type TouchConfig, type TouchPoint } from "./touchGestures"

/**
 * Direcciones soportadas para secuencias tipo Konami
 */
export type Direction = "up" | "down" | "left" | "right"

/**
 * Representa una combinación de teclas (ej: Ctrl + K)
 */
export type KeyCombo = {
    key: string
    ctrl?: boolean
    shift?: boolean
    alt?: boolean
    meta?: boolean
}

/**
 * Cada paso de una secuencia puede ser:
 * - Una dirección
 * - Una combinación de teclas
 */
export type SequenceStep = Direction | KeyCombo

/**
 * Configuración individual de una secuencia
 */
export interface SecretSequenceConfig {
    id?: string // Identificador opcional para distinguir múltiples secuencias
    sequence: readonly SequenceStep[] // Secuencia a detectar
    onSuccess: () => void // Callback cuando la secuencia se completa
}

/**
 * Opciones globales del hook
 */
export interface UseSecretSequenceOptions {
    sequences: SecretSequenceConfig[]
    timeout?: number // Tiempo máximo entre pasos antes de resetear
    enabled?: boolean // Permite activar/desactivar el hook
    enableTouch?: boolean // Activa detección de gestos táctiles (swipes)
    ignoreInputs?: boolean // Ignorar eventos cuando el usuario está escribiendo
    touchOptions?: TouchConfig // Configuración avanzada de sensibilidad táctil
    onProgress?: (id: string | undefined, progress: number) => void
}

/**
 * Determina si el evento ocurre en un input, textarea
 * o elemento editable para evitar interferir con formularios.
 */
function isTypingTarget(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) return false

    const tag = target.tagName.toLowerCase()

    return (
        tag === "input" ||
        tag === "textarea" ||
        target.isContentEditable
    )
}

/**
 * Verifica si el paso esperado coincide con el evento de teclado recibido.
 */
function matchStep(step: SequenceStep, event: KeyboardEvent): boolean {
    // Caso 1: Direcciones (ArrowUp, ArrowDown, etc.)
    if (typeof step === "string") {
        const directionKeys: Record<string, Direction> = {
            ArrowUp: "up",
            ArrowDown: "down",
            ArrowLeft: "left",
            ArrowRight: "right",
        }

        return directionKeys[event.key] === step
    }

    // Caso 2: Combinaciones de teclas
    return (
        event.key.toLowerCase() === step.key.toLowerCase() &&
        (!!step.ctrl === event.ctrlKey) &&
        (!!step.shift === event.shiftKey) &&
        (!!step.alt === event.altKey) &&
        (!!step.meta === event.metaKey)
    )
}

/**
 * Hook principal para detectar múltiples secuencias
 * de teclado (direcciones y combinaciones).
 */
export function useSecretSequence({
    sequences,
    timeout = 2000,
    enabled = true,
    enableTouch = true,
    ignoreInputs = true,
    touchOptions,
    onProgress,
}: UseSecretSequenceOptions) {

    // Referencia para manejar el timeout global
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    /**
     * Mapa que guarda el progreso actual de cada secuencia.
     * key: id de la secuencia
     * value: número de pasos completados
     */
    const [progressMap, setProgressMap] = useState<Record<string, number>>(
        () =>
            Object.fromEntries(
                sequences.map((s, i) => [s.id ?? String(i), 0])
            )
    )

    // Ref síncrona para rastrear el progreso
    // (necesaria para que preventDefault funcione de forma inmediata)
    const progressRef = useRef<Record<string, number>>(progressMap)

    /**
     * Resetea el progreso de todas las secuencias
     */
    const resetAll = useCallback(() => {
        setProgressMap(prev => {
            const reset = Object.fromEntries(Object.keys(prev).map(k => [k, 0]))
            progressRef.current = reset
            return reset
        })
    }, [])

    /**
     * Avanza el progreso de las secuencias según una función de matching.
     * Retorna true si algún paso coincidió.
     */
    const advanceProgress = useCallback(
        (isMatch: (step: SequenceStep) => boolean): boolean => {
            let matched = false
            const prev = progressRef.current
            const next = { ...prev }

            sequences.forEach((seq, index) => {
                const id = seq.id ?? String(index)
                const currentProgress = prev[id] ?? 0
                const expectedStep = seq.sequence[currentProgress]

                if (isMatch(expectedStep)) {
                    matched = true
                    const newProgress = currentProgress + 1
                    next[id] = newProgress

                    onProgress?.(id, newProgress)

                    if (newProgress === seq.sequence.length) {
                        seq.onSuccess()
                        next[id] = 0
                    }
                } else {
                    next[id] = 0
                }
            })

            progressRef.current = next
            setProgressMap(next)

            // Reinicia progreso si se supera el tiempo máximo entre pasos
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            timeoutRef.current = setTimeout(resetAll, timeout)

            return matched
        },
        [sequences, timeout, onProgress, resetAll]
    )

    /**
     * Procesa cada evento de teclado
     * y actualiza el progreso de las secuencias.
     */
    const processKey = useCallback(
        (event: KeyboardEvent) => {
            if (!enabled) return

            // Evita interferir con inputs si está habilitado
            if (ignoreInputs && isTypingTarget(event.target)) return

            // Verifica las coincidencias de forma síncrona
            // para poder prevenir el comportamiento por defecto del navegador
            // (ej: Ctrl+K abre búsqueda, Ctrl+U muestra código fuente)
            const matched = advanceProgress(step => matchStep(step, event))

            if (matched) {
                event.preventDefault()
            }
        },
        [enabled, ignoreInputs, advanceProgress]
    )

    /**
     * Listener global de teclado
     */
    useEffect(() => {
        if (typeof window === "undefined") return

        window.addEventListener("keydown", processKey)
        return () => window.removeEventListener("keydown", processKey)
    }, [processKey])

    /**
     * Listeners de gestos táctiles (touchstart / touchend)
     * Detecta swipes y los mapea a direcciones.
     */
    useEffect(() => {
        if (typeof window === "undefined") return
        if (!enabled || !enableTouch) return

        let touchStart: TouchPoint | null = null

        const handleTouchStart = (e: TouchEvent) => {
            const touch = e.touches[0]
            if (!touch) return

            touchStart = {
                x: touch.clientX,
                y: touch.clientY,
                time: Date.now(),
            }
        }

        const handleTouchEnd = (e: TouchEvent) => {
            if (!touchStart) return

            const touch = e.changedTouches[0]
            if (!touch) return

            const touchEnd: TouchPoint = {
                x: touch.clientX,
                y: touch.clientY,
                time: Date.now(),
            }

            const direction = detectSwipe(touchStart, touchEnd, touchOptions)
            touchStart = null

            if (direction) {
                advanceProgress(step => typeof step === "string" && step === direction)
            }
        }

        window.addEventListener("touchstart", handleTouchStart, { passive: true })
        window.addEventListener("touchend", handleTouchEnd, { passive: true })

        return () => {
            window.removeEventListener("touchstart", handleTouchStart)
            window.removeEventListener("touchend", handleTouchEnd)
        }
    }, [enabled, enableTouch, touchOptions, advanceProgress])

    return {
        progressMap, // Progreso individual por secuencia
        reset: resetAll, // Función para resetear manualmente
    }
}
