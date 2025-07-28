import { Pattern, PatternOptions, CharacterData, PatternContext } from './pattern';
/**
 * Options for configuring a static pattern.
 * @extends PatternOptions
 * @category Patterns
 * @property seed - the seed value for random number generation used to ensure reproducible noise patterns.
 */
export interface StaticNoisePatternOptions extends PatternOptions {
    seed: number;
}
/**
 * Static noise pattern class.
 * @category Patterns
 */
export declare class StaticNoisePattern extends Pattern<StaticNoisePatternOptions> {
    static readonly ID = "static";
    constructor(options?: Partial<StaticNoisePatternOptions>);
    update(_context: PatternContext): Pattern;
    generate({ region, animationTime }: PatternContext): CharacterData[];
}
