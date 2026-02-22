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
    id?: string
    sequence: readonly SequenceStep[]
    onSuccess: () => void
}

/**
 * Opciones del engine
 */
export interface SecretSequenceEngineOptions {
    sequences: SecretSequenceConfig[]
    timeout?: number
    enabled?: boolean
    enableTouch?: boolean
    ignoreInputs?: boolean
    touchOptions?: TouchConfig
    onProgress?: (id: string | undefined, progress: number) => void
}

/**
 * Determina si el evento ocurre en un input, textarea
 * o elemento editable para evitar interferir con formularios.
 */
function isTypingTarget(target: EventTarget | null): boolean {
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
    if (typeof step === "string") {
        const directionKeys: Record<string, Direction> = {
            ArrowUp: "up",
            ArrowDown: "down",
            ArrowLeft: "left",
            ArrowRight: "right",
        }

        return directionKeys[event.key] === step
    }

    return (
        event.key.toLowerCase() === step.key.toLowerCase() &&
        (!!step.ctrl === event.ctrlKey) &&
        (!!step.shift === event.shiftKey) &&
        (!!step.alt === event.altKey) &&
        (!!step.meta === event.metaKey)
    )
}

/**
 * Engine puro de TypeScript para detectar múltiples secuencias
 * de teclado (direcciones y combinaciones) y gestos táctiles.
 *
 * No depende de React ni de ningún framework.
 *
 * @example
 * ```ts
 * const engine = new SecretSequenceEngine({
 *   sequences: [
 *     {
 *       id: "konami",
 *       sequence: ["up", "up", "down", "down", "left", "right", "left", "right"],
 *       onSuccess: () => console.log("Konami code activated!"),
 *     },
 *   ],
 * })
 *
 * engine.start()
 *
 * // Cuando ya no se necesite:
 * engine.destroy()
 * ```
 */
export class SecretSequenceEngine {
    private sequences: SecretSequenceConfig[]
    private timeout: number
    private enabled: boolean
    private enableTouch: boolean
    private ignoreInputs: boolean
    private touchOptions?: TouchConfig
    private onProgress?: (id: string | undefined, progress: number) => void

    private progressMap: Record<string, number>
    private timeoutId: ReturnType<typeof setTimeout> | null = null
    private touchStart: TouchPoint | null = null
    private running = false

    // Bound handlers para poder removerlos correctamente
    private handleKeyDown: (e: KeyboardEvent) => void
    private handleTouchStart: (e: TouchEvent) => void
    private handleTouchEnd: (e: TouchEvent) => void

    constructor(options: SecretSequenceEngineOptions) {
        this.sequences = options.sequences
        this.timeout = options.timeout ?? 2000
        this.enabled = options.enabled ?? true
        this.enableTouch = options.enableTouch ?? true
        this.ignoreInputs = options.ignoreInputs ?? true
        this.touchOptions = options.touchOptions
        this.onProgress = options.onProgress

        // Inicializar mapa de progreso
        this.progressMap = Object.fromEntries(
            this.sequences.map((s, i) => [s.id ?? String(i), 0])
        )

        // Bind handlers
        this.handleKeyDown = this._onKeyDown.bind(this)
        this.handleTouchStart = this._onTouchStart.bind(this)
        this.handleTouchEnd = this._onTouchEnd.bind(this)
    }

    /**
     * Registra los event listeners en window.
     * Llama a este método para activar la detección.
     */
    start(): void {
        if (this.running) return
        if (typeof window === "undefined") return

        this.running = true
        window.addEventListener("keydown", this.handleKeyDown)

        if (this.enableTouch) {
            window.addEventListener("touchstart", this.handleTouchStart, { passive: true })
            window.addEventListener("touchend", this.handleTouchEnd, { passive: true })
        }
    }

    /**
     * Remueve todos los event listeners.
     */
    stop(): void {
        if (!this.running) return
        if (typeof window === "undefined") return

        this.running = false
        window.removeEventListener("keydown", this.handleKeyDown)
        window.removeEventListener("touchstart", this.handleTouchStart)
        window.removeEventListener("touchend", this.handleTouchEnd)

        if (this.timeoutId) {
            clearTimeout(this.timeoutId)
            this.timeoutId = null
        }
    }

    /**
     * Detiene el engine y limpia el estado.
     */
    destroy(): void {
        this.stop()
        this.resetAll()
    }

    /**
     * Resetea el progreso de todas las secuencias.
     */
    reset(): void {
        this.resetAll()
    }

    /**
     * Retorna una copia del mapa de progreso actual.
     */
    getProgressMap(): Record<string, number> {
        return { ...this.progressMap }
    }

    /**
     * Permite actualizar las opciones del engine en caliente.
     */
    setOptions(options: Partial<SecretSequenceEngineOptions>): void {
        const wasRunning = this.running

        if (wasRunning) this.stop()

        if (options.sequences !== undefined) {
            this.sequences = options.sequences
            this.progressMap = Object.fromEntries(
                this.sequences.map((s, i) => [s.id ?? String(i), 0])
            )
        }
        if (options.timeout !== undefined) this.timeout = options.timeout
        if (options.enabled !== undefined) this.enabled = options.enabled
        if (options.enableTouch !== undefined) this.enableTouch = options.enableTouch
        if (options.ignoreInputs !== undefined) this.ignoreInputs = options.ignoreInputs
        if (options.touchOptions !== undefined) this.touchOptions = options.touchOptions
        if (options.onProgress !== undefined) this.onProgress = options.onProgress

        if (wasRunning) this.start()
    }

    // --- Private methods ---

    private resetAll(): void {
        this.progressMap = Object.fromEntries(
            Object.keys(this.progressMap).map(k => [k, 0])
        )
    }

    private advanceProgress(isMatch: (step: SequenceStep) => boolean): boolean {
        let matched = false
        const next = { ...this.progressMap }

        this.sequences.forEach((seq, index) => {
            const id = seq.id ?? String(index)
            const currentProgress = this.progressMap[id] ?? 0
            const expectedStep = seq.sequence[currentProgress]

            if (isMatch(expectedStep)) {
                matched = true
                const newProgress = currentProgress + 1
                next[id] = newProgress

                this.onProgress?.(id, newProgress)

                if (newProgress === seq.sequence.length) {
                    seq.onSuccess()
                    next[id] = 0
                }
            } else {
                next[id] = 0
            }
        })

        this.progressMap = next

        // Reinicia progreso si se supera el tiempo máximo entre pasos
        if (this.timeoutId) clearTimeout(this.timeoutId)
        this.timeoutId = setTimeout(() => this.resetAll(), this.timeout)

        return matched
    }

    private _onKeyDown(event: KeyboardEvent): void {
        if (!this.enabled) return
        if (this.ignoreInputs && isTypingTarget(event.target)) return

        const matched = this.advanceProgress(step => matchStep(step, event))

        if (matched) {
            event.preventDefault()
        }
    }

    private _onTouchStart(e: TouchEvent): void {
        const touch = e.touches[0]
        if (!touch) return

        this.touchStart = {
            x: touch.clientX,
            y: touch.clientY,
            time: Date.now(),
        }
    }

    private _onTouchEnd(e: TouchEvent): void {
        if (!this.touchStart) return

        const touch = e.changedTouches[0]
        if (!touch) return

        const touchEnd: TouchPoint = {
            x: touch.clientX,
            y: touch.clientY,
            time: Date.now(),
        }

        const direction = detectSwipe(this.touchStart, touchEnd, this.touchOptions)
        this.touchStart = null

        if (direction) {
            this.advanceProgress(step => typeof step === "string" && step === direction)
        }
    }
}
