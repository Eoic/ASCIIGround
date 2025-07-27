/**
 * ASCIIGround - A TypeScript library for creating animated ASCII canvas backgrounds.
 * 
 * This library provides a comprehensive solution for creating stunning ASCII-based animations
 * that can be used as website backgrounds. It supports various pattern generators including
 * Perlin noise, rain effects, static noise, and custom patterns.
 * 
 * @author Karolis Strazdas
 * 
 * @example Basic usage
 * ```typescript
 * import { ASCIIGround, PerlinNoisePattern } from 'asciiground';
 * 
 * const canvas = document.getElementById('canvas') as HTMLCanvasElement;
 * const pattern = new PerlinNoisePattern({ characters: ['.', ':', ';', '#'] });
 * 
 * const asciiGround = new ASCIIGround()
 *   .init(canvas, pattern, { fontSize: 12, color: '#667eea' })
 *   .startAnimation();
 * ```
 * 
 * @example Canvas setup with rain pattern
 * ```typescript
 * import { ASCIIGround, RainPattern } from 'asciiground';
 * 
 * const canvas = document.getElementById('canvas') as HTMLCanvasElement;
 * 
 * const pattern = new RainPattern({ 
 *   characters: ['|', '!', '1', ':'],
 *   dropDensity: 0.8,
 * });
 * 
 * const asciiGround = new ASCIIGround()
 *   .init(canvas, pattern, {
 *     fontSize: 14,
 *     color: '#764ba2',
 *     backgroundColor: '#000000',
 *   })
 *   .startAnimation();
 * ```
 */

import type { Pattern } from './patterns/pattern';
import { ASCIIRenderer, type ASCIIRendererOptions } from './rendering/ascii-renderer';

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
export class ASCIIGround {
    private _renderer: ASCIIRenderer | null = null;

    public get pattern(): Pattern {
        return this.renderer.pattern;
    }

    public get options(): ASCIIRendererOptions {
        return Object.freeze(this.renderer.options);
    }

    private get renderer(): ASCIIRenderer {
        if (!this._renderer) 
            throw new Error('Renderer is not initialized - call init() first.');

        return this._renderer;
    }

    private set renderer(value: ASCIIRenderer | null) {
        this._renderer = value;
    }

    /**
     * Initialize the ASCIIGround instance with a canvas, a pattern and renderer options.
     * @param canvas - The HTML canvas element to render on.
     * @param pattern - The pattern to use for rendering.
     * @param options - Optional renderer options.
     */
    public init(
        canvas: HTMLCanvasElement,
        pattern: Pattern,
        options?: Partial<ASCIIRendererOptions>
    ): ASCIIGround {
        this.renderer = new ASCIIRenderer(canvas, pattern, options);
        return this;
    }

    /**
     * Start the animation.
     * @returns The current ASCIIGround instance.
     */
    public startAnimation(): ASCIIGround {
        this.renderer.startAnimation();
        return this;
    }

    /**
     * Stop the animation.
     * @returns The current ASCIIGround instance.
     */
    public stopAnimation(): ASCIIGround {
        this.renderer.stopAnimation();
        return this;
    }

    /**
     * Set a new pattern generator for the renderer.
     * @param pattern - The new pattern to set.
     * @returns The current ASCIIGround instance.
     */
    public setPattern(pattern: Pattern): ASCIIGround {
        this.renderer.pattern = pattern;
        return this;
    }

    /**
     * Set new options for the renderer.
     * @param options - The new options to set.
     * @returns The current ASCIIGround instance.
     */
    public setOptions(options: Partial<ASCIIRendererOptions>): ASCIIGround {
        this.renderer.setOptions(options);
        return this;
    }

    /**
     * Destroy the ASCIIGround instance, cleaning up resources.
     * This will stop the animation and nullify the renderer.
     */
    public destroy(): void {
        this.renderer.destroy();
        this.renderer = null;
    }
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

// ============================================================================
// Pattern exports.
// ============================================================================

/**
 * @category Patterns
 */
export { 
    Pattern, 
    type PatternOptions, 
    type PatternContext, 
    type CharacterData, 
    type RenderRegion 
} from './patterns/pattern';

/**
 * @category Patterns
 */
export { 
    PerlinNoisePattern, 
    type PerlinNoisePatternOptions 
} from './patterns/perlin-noise-pattern';

/**
 * @category Patterns
 */
export { 
    RainPattern, 
    type RainPatternOptions 
} from './patterns/rain-pattern';

/**
 * @category Patterns
 */
export { 
    StaticNoisePattern, 
    type StaticNoisePatternOptions 
} from './patterns/static-noise-pattern';

/**
 * @category Patterns
 */
export { DummyPattern } from './patterns/dummy-pattern';

// ============================================================================
// Rendering exports.
// ============================================================================

/**
 * @category Rendering
 */
export { ASCIIRenderer, type ASCIIRendererOptions } from './rendering/ascii-renderer';

/**
 * @category Rendering
 */
export { 
    type Renderer, 
    Canvas2DRenderer, 
    WebGLRenderer, 
    createRenderer 
} from './rendering/renderer';

// ============================================================================
// Utility exports.
// ============================================================================

/**
 * @category Utilities
 */
export { createSeededRandom } from './utils/seeded-random';
