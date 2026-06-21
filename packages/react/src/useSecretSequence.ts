import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import {
    SecretSequenceEngine,
    type SecretSequenceConfig,
    type SecretSequenceEngineOptions,
    type TouchConfig,
} from "secret-sequence-core"

/**
 * Compara dos mapas de progreso por valor para evitar re-renders
 * cuando el estado no cambió (p. ej. atajos de una sola tecla, que
 * completan y resetean el progreso a 0 en la misma pulsación).
 */
function isSameProgress(
    a: Record<string, number>,
    b: Record<string, number>
): boolean {
    const aKeys = Object.keys(a)
    if (aKeys.length !== Object.keys(b).length) return false
    for (const key of aKeys) {
        if (a[key] !== b[key]) return false
    }
    return true
}

/**
 * Opciones para el hook useSecretSequence.
 * Refleja las opciones del engine del core.
 */
export interface UseSecretSequenceOptions {
    /** Lista de secuencias a detectar */
    sequences: SecretSequenceConfig[]
    /** Tiempo máximo entre pasos antes de resetear (ms). Default: 2000 */
    timeout?: number
    /** Habilitar/deshabilitar la detección. Default: true */
    enabled?: boolean
    /** Habilitar detección de gestos táctiles (swipes). Default: true */
    enableTouch?: boolean
    /** Ignorar eventos cuando el foco está en inputs/textareas. Default: true */
    ignoreInputs?: boolean
    /** Configuración de sensibilidad para gestos táctiles */
    touchOptions?: TouchConfig
    /** Elemento al que adjuntar los listeners. Default: `window` */
    target?: EventTarget
}

/**
 * Valor retornado por el hook useSecretSequence.
 */
export interface UseSecretSequenceReturn {
    /** Mapa de progreso actual: { [sequenceId]: stepsCompleted } */
    progress: Record<string, number>
    /** Resetea el progreso de todas las secuencias */
    reset: () => void
}

/**
 * Hook de React para detectar secuencias de teclado (Konami codes, combos de teclas)
 * y gestos táctiles (swipes) usando el engine de secret-sequence-core.
 *
 * Gestiona automáticamente el ciclo de vida del engine:
 * - Se inicia al montar el componente
 * - Se actualiza reactivamente cuando cambian las opciones
 * - Se destruye al desmontar el componente
 *
 * @example
 * ```tsx
 * function App() {
 *   const { progress } = useSecretSequence({
 *     sequences: [
 *       {
 *         id: "konami",
 *         sequence: ["up", "up", "down", "down", "left", "right", "left", "right"],
 *         onSuccess: () => console.log("🎉 Konami activado!"),
 *       },
 *     ],
 *     enableTouch: true,
 *     touchOptions: { minDistance: 50, maxTime: 400 },
 *   })
 *
 *   return <pre>{JSON.stringify(progress, null, 2)}</pre>
 * }
 * ```
 *
 * @example Touch-only (sin teclado)
 * ```tsx
 * const { progress } = useSecretSequence({
 *   sequences: [
 *     {
 *       id: "swipe-pattern",
 *       sequence: ["up", "down", "left", "right"],
 *       onSuccess: () => alert("Patrón de swipe detectado!"),
 *     },
 *   ],
 *   enableTouch: true,
 *   touchOptions: {
 *     minDistance: 30,
 *     maxTime: 300,
 *     threshold: 1.5,
 *   },
 * })
 * ```
 */
export function useSecretSequence(
    options: UseSecretSequenceOptions
): UseSecretSequenceReturn {
    const {
        sequences,
        timeout,
        enabled = true,
        enableTouch = true,
        ignoreInputs = true,
        touchOptions,
        target,
    } = options

    const [progress, setProgress] = useState<Record<string, number>>({})
    const engineRef = useRef<SecretSequenceEngine | null>(null)

    // Refs estables para los callbacks de las secuencias
    // para evitar re-crear el engine en cada render
    const sequencesRef = useRef(sequences)
    sequencesRef.current = sequences

    const touchOptionsRef = useRef(touchOptions)
    touchOptionsRef.current = touchOptions

    // Claves estables para comparación profunda (evita bucle infinito con objetos inline)
    const sequencesKey = JSON.stringify(
        sequences.map(({ onSuccess, ...rest }) => rest)
    )
    const touchOptionsKey = JSON.stringify(touchOptions)

    // Secuencias con onSuccess ESTABLE: el engine las cachea, pero cada callback
    // delega al valor actual vía ref. Así, cambiar solo el callback (sin tocar las
    // teclas) sigue invocando el onSuccess fresco sin re-sincronizar el engine.
    const stableSequences = useMemo<SecretSequenceConfig[]>(
        () =>
            sequencesRef.current.map((seq, i) => ({
                ...seq,
                onSuccess: () => sequencesRef.current[i]?.onSuccess(),
            })),
        // Se recrea solo cuando cambian teclas/id/orden/cantidad, no el callback.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [sequencesKey]
    )
    const stableSequencesRef = useRef(stableSequences)
    stableSequencesRef.current = stableSequences

    // Empuja el progreso al estado solo si cambió de valor (evita re-render por pulsación).
    const syncProgress = useCallback(() => {
        const engine = engineRef.current
        if (!engine) return
        const next = engine.getProgressMap()
        setProgress(prev => (isSameProgress(prev, next) ? prev : next))
    }, [])

    // Crear y destruir el engine con el ciclo de vida del componente
    useEffect(() => {
        const engineOptions: SecretSequenceEngineOptions = {
            sequences: stableSequencesRef.current,
            timeout,
            enabled,
            enableTouch,
            ignoreInputs,
            touchOptions: touchOptionsRef.current,
            target,
            onProgress: syncProgress,
        }

        const engine = new SecretSequenceEngine(engineOptions)
        engineRef.current = engine

        // Inicializar el estado de progreso
        setProgress(engine.getProgressMap())

        engine.start()

        return () => {
            engine.destroy()
            engineRef.current = null
        }
        // Solo re-crear el engine cuando cambian las opciones primitivas
        // (incluido el target, para re-enganchar los listeners al nuevo elemento).
        // sequences y touchOptions se manejan por ref.
    }, [timeout, enabled, enableTouch, ignoreInputs, target, syncProgress])

    // Sincronizar cambios en sequences sin destruir el engine
    useEffect(() => {
        if (!engineRef.current) return

        engineRef.current.setOptions({
            sequences: stableSequencesRef.current,
            touchOptions: touchOptionsRef.current,
            onProgress: syncProgress,
        })

        // Actualizar el mapa de progreso por si cambiaron los IDs
        setProgress(engineRef.current.getProgressMap())
    }, [sequencesKey, touchOptionsKey, syncProgress])

    const reset = useCallback(() => {
        if (engineRef.current) {
            engineRef.current.reset()
            setProgress(engineRef.current.getProgressMap())
        }
    }, [])

    return { progress, reset }
}
