/**
 * Coordenadas de un punto táctil
 */
export interface TouchPoint {
    x: number
    y: number
    time: number
}

/**
 * Configuración para la detección de swipes
 */
export interface TouchConfig {
    /** Distancia mínima en px para considerar un swipe (default: 30) */
    minDistance?: number
    /** Tiempo máximo en ms para completar un swipe (default: 300) */
    maxTime?: number
    /**
     * Ratio mínimo entre el eje dominante y el secundario
     * para evitar swipes diagonales (default: 1.5)
     */
    threshold?: number
}

/**
 * Dirección detectada de un swipe
 */
export type SwipeDirection = "up" | "down" | "left" | "right"

const DEFAULT_CONFIG: Required<TouchConfig> = {
    minDistance: 30,
    maxTime: 300,
    threshold: 1.5,
}

/**
 * Detecta la dirección de un swipe a partir de dos puntos táctiles.
 * Retorna la dirección si cumple los umbrales configurados, o null si no.
 *
 * @param start - Punto donde inició el touch
 * @param end - Punto donde terminó el touch
 * @param config - Configuración de sensibilidad (opcional)
 * @returns La dirección del swipe o null si no es válido
 */
export function detectSwipe(
    start: TouchPoint,
    end: TouchPoint,
    config?: TouchConfig
): SwipeDirection | null {
    const {
        minDistance,
        maxTime,
        threshold,
    } = { ...DEFAULT_CONFIG, ...config }

    // Verificar que el swipe se completó dentro del tiempo máximo
    const elapsed = end.time - start.time
    if (elapsed > maxTime || elapsed <= 0) return null

    const dx = end.x - start.x
    const dy = end.y - start.y

    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)

    // El eje dominante debe superar la distancia mínima
    const dominant = Math.max(absDx, absDy)
    if (dominant < minDistance) return null

    // El eje dominante debe ser significativamente mayor al secundario
    // para evitar swipes diagonales ambiguos
    const secondary = Math.min(absDx, absDy)
    if (secondary > 0 && dominant / secondary < threshold) return null

    // Determinar la dirección
    if (absDx > absDy) {
        return dx > 0 ? "right" : "left"
    } else {
        // En pantallas, Y positivo es hacia abajo
        return dy > 0 ? "down" : "up"
    }
}
