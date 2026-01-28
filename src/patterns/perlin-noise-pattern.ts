import { Pattern, type PatternOptions, type CharacterData, type PatternContext } from './pattern';
import { createSeededRandom } from '../utils/seeded-random';

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

const DEFAULT_PERLIN_OPTIONS: Required<
    Pick<PerlinNoisePatternOptions, 
    keyof Omit<PerlinNoisePatternOptions, keyof PatternOptions>>
> = {
    frequency: 0.01,
    octaves: 4,
    persistence: 0.5,
    lacunarity: 2.0,
    seed: 0,
};

/**
 * Perlin noise implementation that provides smooth, organic-looking noise patterns.
 * Supports multiple octaves for fractal noise generation.
 * @category Patterns
 */
export class PerlinNoisePattern extends Pattern<PerlinNoisePatternOptions> {
    public static readonly ID = 'perlin-noise';

    /**
     * Stores a permutation table used for generating Perlin noise.
     * This array contains a shuffled sequence of numbers and is used to
     * determine gradient directions and hashing in algorithm.
     */
    private _permutations: number[];

    private get _frequency(): number {
        return this._options.frequency;
    }

    private get _octaves(): number {
        return this._options.octaves;
    }

    private get _persistence(): number {
        return this._options.persistence;
    }

    private get _lacunarity(): number {
        return this._options.lacunarity;
    }

    constructor(options: Partial<PerlinNoisePatternOptions> = {}) {
        super({ ...DEFAULT_PERLIN_OPTIONS, ...options });
        this._permutations = this._generatePermutations(this._options.seed);
    }

    /**
     * Update options while preserving expensive permutation table when possible.
     */
    public setOptions(newOptions: Partial<PerlinNoisePatternOptions>): void {
        const oldSeed = this._options.seed;
        super.setOptions(newOptions);

        if (newOptions.seed !== undefined && newOptions.seed !== oldSeed)
            this._permutations = this._generatePermutations(this._options.seed);
    }

    public update(_context: PatternContext): PerlinNoisePattern {
        return this;
    }

    /**
     * Generate characters for the current frame using Perlin noise.
     * @param context - the current rendering context with time and region info
     * @returns Array of character data for rendering
     */
    public generate({ animationTime, region }: PatternContext): CharacterData[] {
        if (this.options.characters.length === 0)
            return [];

        const characters: CharacterData[] = [];

        for (let row = region.startRow; row <= region.endRow; row++) {
            for (let col = region.startColumn; col <= region.endColumn; col++) {
                const noise = this._fractalNoise(
                    col * this._options.frequency,
                    row * this._options.frequency,
                    animationTime * 0.001
                );

                const normalizedValue = Math.max(0, Math.min(1, (noise + 1) / 2));
                const charIndex = Math.floor(normalizedValue * this._options.characters.length);
                const clampedIndex = Math.max(0, Math.min(charIndex, this._options.characters.length - 1));
                
                characters.push({
                    char: this._options.characters[clampedIndex],
                    x: col * region.charSpacingX,
                    y: row * region.charSpacingY,
                    opacity: normalizedValue,
                });
            }
        }
        
        return characters;
    }

    /**
     * Generate a proper permutation table for Perlin noise.
     */
    private _generatePermutations(seed: number): number[] {
        const randomizer = createSeededRandom(seed);
        const table: number[] = Array.from({ length: 256 }, (_, i) => i);

        for (let i = 255; i > 0; i--) {
            const j = Math.floor(randomizer() * (i + 1));
            const temp = table[i];
            table[i] = table[j];
            table[j] = temp;
        }

        return table.concat(table);
    }

    /**
     * Fade function for smooth interpolation.
     */
    private _fade(t: number): number {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    /**
     * Linear interpolation.
     */
    private _lerp(a: number, b: number, t: number): number {
        return a + t * (b - a);
    }

    /**
     * 3D gradient function.
     */
    private _gradient3D(hash: number, x: number, y: number, z: number): number {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    /**
     * Generate 3D Perlin noise at given coordinates.
     */
    private _noise3D(x: number, y: number, z: number): number {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        const u = this._fade(x);
        const v = this._fade(y);
        const w = this._fade(z);
        const p = this._permutations;
        const a = p[X] + Y;
        const aa = p[a] + Z;
        const ab = p[a + 1] + Z;
        const b = p[X + 1] + Y;
        const ba = p[b] + Z;
        const bb = p[b + 1] + Z;

        return this._lerp(
            this._lerp(
                this._lerp(
                    this._gradient3D(p[aa], x, y, z),
                    this._gradient3D(p[ba], x - 1, y, z),
                    u
                ),
                this._lerp(
                    this._gradient3D(p[ab], x, y - 1, z),
                    this._gradient3D(p[bb], x - 1, y - 1, z),
                    u
                ),
                v
            ),
            this._lerp(
                this._lerp(
                    this._gradient3D(p[aa + 1], x, y, z - 1),
                    this._gradient3D(p[ba + 1], x - 1, y, z - 1),
                    u
                ),
                this._lerp(
                    this._gradient3D(p[ab + 1], x, y - 1, z - 1),
                    this._gradient3D(p[bb + 1], x - 1, y - 1, z - 1),
                    u
                ),
                v
            ),
            w
        );
    }

    /**
     * Generate fractal noise using multiple octaves.
     * This creates more natural-looking, organic patterns.
     */
    private _fractalNoise(x: number, y: number, time: number = 0): number {
        let value = 0;
        let maxValue = 0;
        let amplitude = 1;
        let frequency = 1;

        for (let i = 0; i < this._octaves; i++) {
            value += this._noise3D(
                x * frequency,
                y * frequency,
                time * frequency
            ) * amplitude;

            maxValue += amplitude;
            amplitude *= this._persistence;
            frequency *= this._lacunarity;
        }

        return value / maxValue;
    }
}
