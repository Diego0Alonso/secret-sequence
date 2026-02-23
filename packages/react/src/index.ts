// Hook principal
export { useSecretSequence } from "./useSecretSequence"
export type { UseSecretSequenceOptions, UseSecretSequenceReturn } from "./useSecretSequence"

// Componente declarativo
export { SecretSequence } from "./SecretSequence"
export type { SecretSequenceProps } from "./SecretSequence"

// Re-export tipos del core para conveniencia
export type {
    Direction,
    KeyCombo,
    SequenceStep,
    SecretSequenceConfig,
    SecretSequenceEngineOptions,
    TouchConfig,
    TouchPoint,
    SwipeDirection,
} from "secret-sequence-core"
