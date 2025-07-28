import { Pattern, PatternOptions, CharacterData, PatternContext, RenderRegion } from './pattern';
/**
 * Options for configuring a rain pattern.
 * @extends PatternOptions
 * @category Patterns
 * @property rainDensity - density of rain drops (0-1). Higher values create more rain streams.
 * @property minDropLength - minimum length of rain drops in characters.
 * @property maxDropLength - maximum length of rain drops in characters.
 * @property minSpeed - minimum falling speed multiplier for rain drops.
 * @property maxSpeed - maximum falling speed multiplier for rain drops.
 * @property mutationRate - probability of character mutation per frame (0-1).
 * @property fadeOpacity - background fade opacity for trail effect (0-1).
 */
export interface RainPatternOptions extends PatternOptions {
    rainDensity: number;
    minDropLength: number;
    maxDropLength: number;
    minSpeed: number;
    maxSpeed: number;
    mutationRate: number;
    fadeOpacity: number;
    headColor: string;
}
/**
 * Matrix-style rain pattern that creates falling streams of characters.
 * Features configurable rain density, drop lengths, speeds, and character mutation.
 * @category Patterns
 */
export declare class RainPattern extends Pattern<RainPatternOptions> {
    static readonly ID = "rain";
    private _rainDrops;
    private _region;
    private _lastFrameCharacters;
    constructor(options?: Partial<RainPatternOptions>);
    initialize(region: RenderRegion): void;
    update(context: PatternContext): Pattern;
    generate(context: PatternContext): CharacterData[];
    private _initializeRainDrops;
    private _createRainDrop;
    private _updateRainDrops;
    private _resetRainDrop;
    private _maintainRainDensity;
    /**
     * Adjust existing drops to fit a new region without losing current state.
     */
    private _adjustDropsToNewRegion;
    private _renderRainDrop;
    destroy(): void;
    setOptions(newOptions: Partial<RainPatternOptions>): void;
}
