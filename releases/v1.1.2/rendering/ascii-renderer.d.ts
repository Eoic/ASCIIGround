import { Pattern } from '../patterns/pattern';
/**
 * Configuration options for the ASCII renderer.
 * @category Rendering
 */
export interface ASCIIRendererOptions {
    /** Text color for rendered characters */
    color: string;
    /** Whether animation is enabled */
    animated: boolean;
    /** Animation speed multiplier */
    animationSpeed: number;
    /** Font size in pixels */
    fontSize: number;
    /** Font family to use for rendering */
    fontFamily: string;
    /** Background color */
    backgroundColor: string;
    /** Padding around the rendered area */
    padding: number;
    /** Renderer type to use */
    rendererType: '2D' | 'WebGL';
    /** Enable mouse interaction support */
    enableMouseInteraction: boolean;
    /** Horizontal spacing between characters. If not specified, auto-calculated based on character width */
    charSpacingX?: number;
    /** Vertical spacing between characters. If not specified, auto-calculated based on character height */
    charSpacingY?: number;
    /** Resize target for the renderer, defaults to window. */
    resizeTo: Window | HTMLElement;
}
/**
 * Constructor options for the ASCIIRenderer.
 * @category Rendering
 * @see ASCIIRenderer
 */
export interface ASCIIRendererConstructor {
    canvas: HTMLCanvasElement;
    pattern?: Pattern;
    options?: Partial<ASCIIRendererOptions>;
}
/**
 * Main ASCII renderer that coordinates pattern generation with rendering back-ends.
 * Supports both 2D canvas and WebGL rendering with automatic fallback.
 * @category Rendering
 */
export declare class ASCIIRenderer {
    private _state;
    private _handleResize;
    /**
     * Get the current rendering options.
     * @returns The current ASCIIRendererOptions.
     */
    get options(): ASCIIRendererOptions;
    /** Get the current pattern generator. */
    get pattern(): Pattern;
    /** Set a new pattern generator for the renderer. */
    set pattern(pattern: Pattern);
    /** Whether the renderer is currently animating. */
    get isAnimating(): boolean;
    /**
     * Get the canvas element, throwing an error if not initialized.
     */
    private get canvas();
    /**
     * Get the real canvas size, accounting for padding and `resizeTo` target size.
     * This is used to ensure the canvas is sized correctly for rendering.
     */
    private get realCanvasSize();
    /**
     * Get the renderer, throwing an error if not initialized.
     */
    private get renderer();
    /**
     * Get the region, throwing an error if not calculated.
     */
    private get region();
    /**
     * Get the temp context, ensuring it's initialized.
     */
    private get tempContext();
    /**
     * Create a new ASCIIRenderer instance.
     * @param options - the renderer constructor parameters.
     */
    constructor({ canvas, pattern, options }: ASCIIRendererConstructor);
    /**
     * Render a single frame. This method updates the pattern state and renders characters to the canvas.
     * @param time - optional timestamp for the frame, defaults to `performance.now()`.
     */
    render(time?: number): void;
    /**
     * Start animation loop.
     */
    startAnimation(): void;
    /**
     * Stop animation loop.
     */
    stopAnimation(): void;
    /**
     * Update rendering options.
     */
    setOptions(newOptions: Partial<ASCIIRendererOptions>): void;
    /**
     * Resize the canvas and recalculate layout.
     */
    resize(): void;
    /**
     * Cleanup resources and stop animation.
     */
    destroy(): void;
    /**
     * Calculate character spacing based on font metrics.
     * @returns A tuple containing the character width, height, and spacing sizes.
     */
    private _calculateSpacing;
    /**
     * Calculate the rendering region based on canvas size and options.
     * @returns The calculated RenderRegion object.
     */
    private _calculateRegion;
    /**
     * Initialize the renderer with the canvas and options.
     * This sets up the rendering context and prepares for rendering.
     */
    private _setupRenderer;
    /**
     * Handle mouse move events to update mouse position.
     * @param event Mouse event to handle.
     */
    private _mouseMoveHandler;
    /**
     * Handle mouse click events to update clicked state.
     * This can be used by patterns to respond to user input.
     */
    private _mouseClickHandler;
    /**
     * Setup mouse event listeners for interaction.
     * This allows patterns to respond to mouse movements and clicks.
     */
    private _setupMouseEvents;
    /**
     * Reset the animation time to zero.
     * Useful when restarting animations or switching patterns.
     */
    private _resetAnimationTime;
    /**
     * Synchronize animation state with the current options.
     * This ensures that the renderer reflects the current animation settings.
     */
    private _syncAnimationState;
    /**
     * Generate a hash for the current character data list.
     * @param list - the character data list to hash.
     * @returns A numeric hash value.
     */
    private _hash;
    /**
     * Check if the output has changed since the last render.
     * This is used to avoid unnecessary rendering when nothing has changed.
     * @param list - the current character data list.
     * @returns True if the output has changed, false otherwise.
     */
    private _hasOutputChanged;
    /**
     * Check if the new options differ from the current ones.
     * @param options - the options to compare against current options.
     * @returns True if any option has changed, false otherwise.
     */
    private _hasOptionsChanged;
}
