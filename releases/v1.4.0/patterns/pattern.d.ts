/**
 * Core system for ASCIIGround pattern generators.
 *
 * This module defines the base pattern interface and implementation that all
 * pattern generators inherit from. It provides a standardized way to create static and
 * animated ASCII effects with configurable characters, timing, and interactivity.
 *
 * @author Karolis Strazdas
 */
/**
 * Configuration options for pattern generators.
 *
 * @category Patterns
 * @interface
 */
export interface PatternOptions {
    /** Array of characters to use for rendering, ordered from lowest to highest intensity */
    characters: string[];
}
/**
 * Default character set providing a gradient from light to dark.
 *
 * These characters are ordered by visual density, creating a smooth
 * transition effect when used in animations.
 *
 * @category Patterns
 */
export declare const DEFAULT_PATTERN_OPTIONS: PatternOptions;
/**
 * Represents a single character to be rendered at a specific position.
 *
 * This interface defines all the visual properties that can be applied
 * to an individual character in the ASCII animation.
 *
 * @category Patterns
 * @interface
 */
export interface CharacterData {
    /** X coordinate in the character grid */
    x: number;
    /** Y coordinate in the character grid */
    y: number;
    /** The character to render */
    char: string;
    /** Optional color override (CSS color string) */
    color?: string;
    /** Optional opacity value (0-1) */
    opacity?: number;
    /** Optional scale multiplier for size */
    scale?: number;
    /** Optional rotation in radians */
    rotation?: number;
}
/**
 * Rendering region that may extend beyond the visible area for complex effects.
 *
 * This interface provides complete information about the rendering context,
 * including dimensions, spacing, and boundaries. Some effects may render
 * outside the visible area for blur, particle systems, or edge effects.
 *
 * @category Patterns
 * @interface
 */
export interface RenderRegion {
    /** Number of character rows in the grid */
    rows: number;
    /** Number of character columns in the grid */
    columns: number;
    /** Starting row index (may be negative for extended regions) */
    startRow: number;
    /** Ending row index (may exceed visible area) */
    endRow: number;
    /** Starting column index (may be negative for extended regions) */
    startColumn: number;
    /** Ending column index (may exceed visible area) */
    endColumn: number;
    /** Width of each character in pixels */
    charWidth: number;
    /** Height of each character in pixels */
    charHeight: number;
    /** Horizontal spacing between characters */
    charSpacingX: number;
    /** Vertical spacing between characters */
    charSpacingY: number;
    /** Total canvas width in pixels */
    canvasWidth: number;
    /** Total canvas height in pixels */
    canvasHeight: number;
}
/**
 * Context for pattern generation containing timing and interaction data.
 *
 * This interface provides all the information a pattern needs to generate
 * the next frame of animation, including timing, mouse interaction, and
 * rendering boundaries.
 *
 * @category Patterns
 * @interface
 */
export interface PatternContext {
    /** Total elapsed time since animation start (in seconds) */
    time: number;
    /** Time elapsed since last frame (in seconds) */
    deltaTime: number;
    /** Animation-specific time (affected by speed multipliers) */
    animationTime: number;
    /** Current mouse X position relative to canvas (if available) */
    mouseX?: number;
    /** Current mouse Y position relative to canvas (if available) */
    mouseY?: number;
    /** Whether mouse was clicked this frame */
    clicked?: boolean;
    /** Whether animation is currently running */
    isAnimating: boolean;
    /** Animation speed multiplier */
    animationSpeed: number;
    /** Current rendering region information */
    region: RenderRegion;
}
/**
 * Base class for all pattern generators in ASCIIGround.
 *
 * This abstract class provides the foundation for creating animated ASCII patterns.
 * It handles option management, lifecycle methods, and defines the interface that
 * all patterns must implement.
 *
 * Patterns are responsible for generating arrays of {@link CharacterData} objects
 * that define what characters to render and where. The base class handles common
 * functionality like option updates and dirty state tracking.
 *
 * @category Patterns
 * @abstract
 * @template TOptions - The options interface this pattern uses
 *
 * @example Creating a custom pattern
 * ```typescript
 * interface CustomPatternOptions extends PatternOptions {
 *   speed: number;
 *   amplitude: number;
 * }
 *
 * class CustomPattern extends Pattern<CustomPatternOptions> {
 *   public static readonly ID = 'custom';
 *
 *   public generate(context: PatternContext): CharacterData[] {
 *     // Implementation here
 *     return [];
 *   }
 *
 *   public update(context: PatternContext): Pattern {
 *     // Update pattern state
 *     return this;
 *   }
 * }
 * ```
 */
export declare abstract class Pattern<TOptions extends PatternOptions = PatternOptions> {
    /**
     * Unique identifier for the pattern, that should be overridden in subclasses.
     */
    static readonly ID: string;
    /**
     * Options for the pattern, initialized with default values.
     */
    protected _options: TOptions;
    /**
     * Flag indicating if the pattern needs to be re-rendered.
     * This is set to true when pattern options change in a way that required re-render (e.g. color change).
     */
    protected _isDirty: boolean;
    get id(): string;
    get options(): TOptions;
    get isDirty(): boolean;
    set isDirty(value: boolean);
    constructor(options?: Partial<TOptions>);
    /**
     * Update pattern options without recreating the pattern instance.
     * Override this method if your pattern has expensive initialization that should be preserved.
     * @param newOptions - partial options to update
     */
    setOptions(newOptions: Partial<TOptions>): void;
    /**
     * Generate characters for the given context.
     * May render outside visible area for effects like blur or particle systems.
     * @param context - current rendering context with time, mouse position, etc.
     * @returns Array of characters to render with their positions and properties
     */
    abstract generate(context: PatternContext): CharacterData[];
    /**
     * Called when the pattern is initialized or resized.
     * Use this to set up any internal state or precompute values.
     * @param _region - the rendering region including visible area and padding.
     */
    initialize(_region: RenderRegion): void;
    /**
     * Called when the pattern is destroyed.
     * Use this to clean up resources, cancel timers, etc.
     */
    destroy(): void;
    /**
     * Update pattern state between frames.
     * Called before `generate()` on each frame.
     * @param _context - current rendering context.
     */
    abstract update(_context: PatternContext): Pattern;
    /**
     * Handle mouse interactions with the pattern.
     * Override to implement custom mouse effects.
     * @param _x - mouse X position relative to canvas.
     * @param _y - mouse Y position relative to canvas.
     * @param _clicked - Whether mouse was clicked this frame.
     */
    onMouseInteraction(_x: number, _y: number, _clicked: boolean): void;
    /**
     * Check if the pattern options have changed.
     * @param options - new options to compare against current options.
     * @returns True if any options have changed, false otherwise.
     */
    private _hasOptionsChanged;
}
