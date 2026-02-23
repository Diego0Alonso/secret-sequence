import { useEffect, useRef, useState, useCallback } from "react"
import {
    SecretSequenceEngine,
    type SecretSequenceConfig,
    type SecretSequenceEngineOptions,
    type TouchConfig,
} from "secret-sequence-core"

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

    // Crear y destruir el engine con el ciclo de vida del componente
    useEffect(() => {
        const engineOptions: SecretSequenceEngineOptions = {
            sequences: sequencesRef.current,
            timeout,
            enabled,
            enableTouch,
            ignoreInputs,
            touchOptions: touchOptionsRef.current,
            onProgress: (_id, _step) => {
                // Leer el progreso directamente del engine para tener
                // el estado completo de todas las secuencias
                if (engineRef.current) {
                    setProgress(engineRef.current.getProgressMap())
                }
            },
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
        // Solo re-crear el engine cuando cambian las opciones primitivas.
        // sequences y touchOptions se manejan por ref.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeout, enabled, enableTouch, ignoreInputs])

    // Sincronizar cambios en sequences sin destruir el engine
    useEffect(() => {
        if (!engineRef.current) return

        engineRef.current.setOptions({
            sequences: sequencesRef.current,
            touchOptions: touchOptionsRef.current,
            onProgress: () => {
                if (engineRef.current) {
                    setProgress(engineRef.current.getProgressMap())
                }
            },
        })

        // Actualizar el mapa de progreso por si cambiaron los IDs
        setProgress(engineRef.current.getProgressMap())
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sequencesKey, touchOptionsKey])

    const reset = useCallback(() => {
        if (engineRef.current) {
            engineRef.current.reset()
            setProgress(engineRef.current.getProgressMap())
        }
    }, [])

    return { progress, reset }
}
