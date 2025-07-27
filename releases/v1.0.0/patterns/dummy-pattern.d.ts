import { Pattern, CharacterData, PatternContext, PatternOptions } from './pattern';
/**
 * Configuration options for dummy pattern.
 * @category DummyPattern
 */
export type DummyPatternOptions = PatternOptions;
/**
 * Dummy pattern that does not generate any characters.
 * This is useful for initializing the renderer to a well-defined state
 * without a specific pattern, and in order to avoid doing missing pattern checks.
 * @category Patterns
 */
export declare class DummyPattern extends Pattern<DummyPatternOptions> {
    static readonly ID = "dummy";
    constructor(options?: Partial<DummyPatternOptions>);
    update(_context: PatternContext): DummyPattern;
    generate(_context: PatternContext): CharacterData[];
}
