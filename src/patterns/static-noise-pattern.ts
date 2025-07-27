import { createSeededRandom } from '../utils/seeded-random';
import { Pattern, type PatternOptions, type CharacterData, type PatternContext } from './pattern';

/**
 * Options for configuring a static pattern.
 * @extends PatternOptions
 * @category Patterns
 * @property seed - the seed value for random number generation used to ensure reproducible noise patterns.
 */
export interface StaticNoisePatternOptions extends PatternOptions {
    seed: number;
}

const DEFAULT_STATIC_NOISE_OPTIONS: Required<
    Pick<StaticNoisePatternOptions, 
    keyof Omit<StaticNoisePatternOptions, keyof PatternOptions>>
> = {
    seed: 0,
};

/**
 * Static noise pattern class.
 * @category Patterns
 */
export class StaticNoisePattern extends Pattern<StaticNoisePatternOptions> {
    public static readonly ID = 'static';

    constructor(options: Partial<StaticNoisePatternOptions> = {}) {
        super({ ...DEFAULT_STATIC_NOISE_OPTIONS, ...options });
    }

    public update(_context: PatternContext): Pattern {
        return this;
    }

    public generate({ region, animationTime }: PatternContext): CharacterData[] {
        const characters: CharacterData[] = [];
        const randomizer = createSeededRandom(this._options.seed + Math.floor(animationTime * 10));

        for (let row = region.startRow; row <= region.endRow; row++) {
            for (let col = region.startColumn; col <= region.endColumn; col++) {
                const charIndex = Math.floor(randomizer() * this._options.characters.length);
                const char = this._options.characters[charIndex] || ' ';

                characters.push({
                    char,
                    x: col * region.charSpacingX,
                    y: row * region.charSpacingY,
                });
            }
        }

        return characters;
    }
}
