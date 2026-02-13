import { useEffect, useRef, useState, useCallback } from "react"

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
    enableTouch?: boolean // (Reservado para soporte táctil)
    ignoreInputs?: boolean // Ignorar eventos cuando el usuario está escribiendo
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

    /**
     * Resetea el progreso de todas las secuencias
     */
    const resetAll = useCallback(() => {
        setProgressMap(prev =>
            Object.fromEntries(Object.keys(prev).map(k => [k, 0]))
        )
    }, [])

    /**
     * Procesa cada evento de teclado
     * y actualiza el progreso de las secuencias.
     */
    const processKey = useCallback(
        (event: KeyboardEvent) => {
            if (!enabled) return

            // Evita interferir con inputs si está habilitado
            if (ignoreInputs && isTypingTarget(event.target)) return

            setProgressMap(prev => {
                const next = { ...prev }

                sequences.forEach((seq, index) => {
                    const id = seq.id ?? String(index)
                    const currentProgress = prev[id]
                    const expectedStep = seq.sequence[currentProgress]

                    // Si el paso coincide con lo esperado
                    if (matchStep(expectedStep, event)) {
                        const newProgress = currentProgress + 1
                        next[id] = newProgress

                        // Notifica progreso si el usuario lo necesita
                        onProgress?.(id, newProgress)

                        // Si completó la secuencia
                        if (newProgress === seq.sequence.length) {
                            seq.onSuccess()
                            next[id] = 0
                        }
                    } else {
                        // Si falla, reinicia esa secuencia
                        next[id] = 0
                    }
                })

                return next
            })

            // Reinicia progreso si se supera el tiempo máximo entre pasos
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            timeoutRef.current = setTimeout(resetAll, timeout)
        },
        [enabled, sequences, timeout, ignoreInputs, onProgress, resetAll]
    )

    /**
     * Listener global de teclado
     */
    useEffect(() => {
        if (typeof window === "undefined") return

        window.addEventListener("keydown", processKey)
        return () => window.removeEventListener("keydown", processKey)
    }, [processKey])

    return {
        progressMap, // Progreso individual por secuencia
        reset: resetAll, // Función para resetear manualmente
    }
}
