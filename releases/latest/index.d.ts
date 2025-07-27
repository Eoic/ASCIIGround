import { Pattern } from './patterns/pattern';
import { ASCIIRendererOptions } from './rendering/ascii-renderer';
/**
 * The main ASCIIGround class that orchestrates pattern generation and rendering.
 *
 * This class provides a high-level interface for creating animated ASCII backgrounds.
 * It manages the lifecycle of patterns and renderers, offering methods for initialization,
 * animation control, and configuration updates.
 *
 * @category Main
 *
 * @example Creating and controlling an ASCII animation
 * ```typescript
 * const asciiGround = new ASCIIGround();
 *
 * // Initialize with canvas and pattern.
 * asciiGround.init(canvas, pattern, options);
 *
 * // Control animation.
 * asciiGround.startAnimation();
 * asciiGround.stopAnimation();
 *
 * // Update configuration.
 * asciiGround.setOptions({ fontSize: 14, color: '#667eea' });
 *
 * // Clean up when done.
 * asciiGround.destroy();
 * ```
 */
export declare class ASCIIGround {
    private _renderer;
    get pattern(): Pattern;
    get options(): ASCIIRendererOptions;
    private get renderer();
    private set renderer(value);
    /**
     * Initialize the ASCIIGround instance with a canvas, a pattern and renderer options.
     * @param canvas - The HTML canvas element to render on.
     * @param pattern - The pattern to use for rendering.
     * @param options - Optional renderer options.
     */
    init(canvas: HTMLCanvasElement, pattern: Pattern, options?: Partial<ASCIIRendererOptions>): ASCIIGround;
    /**
     * Start the animation.
     * @returns The current ASCIIGround instance.
     */
    startAnimation(): ASCIIGround;
    /**
     * Stop the animation.
     * @returns The current ASCIIGround instance.
     */
    stopAnimation(): ASCIIGround;
    /**
     * Set a new pattern generator for the renderer.
     * @param pattern - The new pattern to set.
     * @returns The current ASCIIGround instance.
     */
    setPattern(pattern: Pattern): ASCIIGround;
    /**
     * Set new options for the renderer.
     * @param options - The new options to set.
     * @returns The current ASCIIGround instance.
     */
    setOptions(options: Partial<ASCIIRendererOptions>): ASCIIGround;
    /**
     * Destroy the ASCIIGround instance, cleaning up resources.
     * This will stop the animation and nullify the renderer.
     */
    destroy(): void;
}
/**
 * Default export of the ASCIIGround class for convenient importing.
 *
 * @example
 * ```typescript
 * import ASCIIGround from 'asciiground';
 *
 * const asciiGround = new ASCIIGround();
 * ```
 */
export default ASCIIGround;
/**
 * @category Patterns
 */
export { Pattern, type PatternOptions, type PatternContext, type CharacterData, type RenderRegion } from './patterns/pattern';
/**
 * @category Patterns
 */
export { PerlinNoisePattern, type PerlinNoisePatternOptions } from './patterns/perlin-noise-pattern';
/**
 * @category Patterns
 */
export { RainPattern, type RainPatternOptions } from './patterns/rain-pattern';
/**
 * @category Patterns
 */
export { StaticNoisePattern, type StaticNoisePatternOptions } from './patterns/static-noise-pattern';
/**
 * @category Patterns
 */
export { DummyPattern } from './patterns/dummy-pattern';
/**
 * @category Rendering
 */
export { ASCIIRenderer, type ASCIIRendererOptions } from './rendering/ascii-renderer';
/**
 * @category Rendering
 */
export { type Renderer, Canvas2DRenderer, WebGLRenderer, createRenderer } from './rendering/renderer';
/**
 * @category Utilities
 */
export { createSeededRandom } from './utils/seeded-random';
