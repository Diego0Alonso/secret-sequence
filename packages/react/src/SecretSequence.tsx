import { useEffect } from "react"
import { useSecretSequence, type UseSecretSequenceOptions } from "./useSecretSequence"

/**
 * Props del componente SecretSequence.
 * Idénticas a UseSecretSequenceOptions, con callbacks y render prop opcionales.
 */
export interface SecretSequenceProps extends UseSecretSequenceOptions {
    /** Callback invocado cuando cambia el progreso de alguna secuencia */
    onProgressChange?: (progress: Record<string, number>) => void
    /** Render prop opcional para acceder al progreso y reset */
    children?: (state: { progress: Record<string, number>; reset: () => void }) => React.ReactNode
}

/**
 * Componente declarativo para detectar secuencias secretas.
 * Wrapper JSX sobre el hook `useSecretSequence`.
 *
 * Si no se pasa `children`, no renderiza nada.
 * Si se pasa `children` como render prop, recibe `{ progress, reset }`.
 *
 * Soporta todas las funcionalidades del core:
 * - Secuencias de teclado (direcciones y combos de teclas)
 * - Gestos táctiles (swipes) con configuración personalizable
 * - Timeout entre pasos
 * - Ignorar inputs/textareas
 *
 * @example Modo invisible (solo efecto)
 * ```tsx
 * <SecretSequence
 *   sequences={[
 *     {
 *       id: "konami",
 *       sequence: ["up", "up", "down", "down", "left", "right", "left", "right"],
 *       onSuccess: () => console.log("🎉"),
 *     },
 *   ]}
 *   enableTouch={true}
 *   touchOptions={{ minDistance: 40 }}
 * />
 * ```
 *
 * @example Con render prop para mostrar progreso
 * ```tsx
 * <SecretSequence
 *   sequences={[{ id: "code", sequence: ["up", "down"], onSuccess: fn }]}
 * >
 *   {({ progress, reset }) => (
 *     <div>
 *       <p>Progreso: {JSON.stringify(progress)}</p>
 *       <button onClick={reset}>Reset</button>
 *     </div>
 *   )}
 * </SecretSequence>
 * ```
 */
export function SecretSequence(props: SecretSequenceProps): React.ReactNode {
    const {
        onProgressChange,
        children,
        ...hookOptions
    } = props

    const { progress, reset } = useSecretSequence(hookOptions)

    // Notificar cambios de progreso via callback
    useEffect(() => {
        if (onProgressChange) {
            onProgressChange(progress)
        }
    }, [progress, onProgressChange])

    if (typeof children === "function") {
        return children({ progress, reset })
    }

    return null
}
