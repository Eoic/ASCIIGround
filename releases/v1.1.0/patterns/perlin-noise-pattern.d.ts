import { Pattern, PatternOptions, CharacterData, PatternContext } from './pattern';
/**
 * Options for configuring a Perlin noise pattern.
 * @extends PatternOptions
 * @category Patterns
 * @property frequency - the base frequency of the Perlin noise. Higher values result in more rapid changes.
 * @property octaves - the number of noise layers to combine for fractal noise. More octaves add detail.
 * @property persistence - controls the amplitude of each octave. Lower values reduce the influence of higher octaves.
 * @property lacunarity - controls the frequency of each octave. Higher values increase the frequency
 * @property seed - the seed value for random number generation used to ensure reproducible noise patterns.
 */
export interface PerlinNoisePatternOptions extends PatternOptions {
    frequency: number;
    octaves: number;
    persistence: number;
    lacunarity: number;
    seed: number;
}
/**
 * Perlin noise implementation that provides smooth, organic-looking noise patterns.
 * Supports multiple octaves for fractal noise generation.
 * @category Patterns
 */
export declare class PerlinNoisePattern extends Pattern<PerlinNoisePatternOptions> {
    static readonly ID = "perlin-noise";
    /**
     * Stores a permutation table used for generating Perlin noise.
     * This array contains a shuffled sequence of numbers and is used to
     * determine gradient directions and hashing in algorithm.
     */
    private _permutations;
    private get _frequency();
    private get _octaves();
    private get _persistence();
    private get _lacunarity();
    constructor(options?: Partial<PerlinNoisePatternOptions>);
    /**
     * Update options while preserving expensive permutation table when possible.
     */
    setOptions(newOptions: Partial<PerlinNoisePatternOptions>): void;
    update(_context: PatternContext): PerlinNoisePattern;
    /**
     * Generate characters for the current frame using Perlin noise.
     * @param context - the current rendering context with time and region info
     * @returns Array of character data for rendering
     */
    generate({ animationTime, region }: PatternContext): CharacterData[];
    /**
     * Generate a proper permutation table for Perlin noise.
     */
    private _generatePermutations;
    /**
     * Fade function for smooth interpolation.
     */
    private _fade;
    /**
     * Linear interpolation.
     */
    private _lerp;
    /**
     * 3D gradient function.
     */
    private _gradient3D;
    /**
     * Generate 3D Perlin noise at given coordinates.
     */
    _noise3D(x: number, y: number, z: number): number;
    /**
     * Generate fractal noise using multiple octaves.
     * This creates more natural-looking, organic patterns.
     */
    _fractalNoise(x: number, y: number, time?: number): number;
    /**
     * Generate animated noise that changes over time.
     * This creates flowing, organic motion patterns.
     */
    _animatedNoise(x: number, y: number, time: number): number;
    /**
     * Generate a noise function suitable for ASCII pattern generation.
     */
    _getNoiseFunction(direction?: 'left' | 'right' | 'up' | 'down'): (x: number, y: number, time: number) => number;
}
