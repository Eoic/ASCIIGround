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
    public _noise3D(x: number, y: number, z: number): number {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        const u = this._fade(x);
        const v = this._fade(y);
        const w = this._fade(z);
        const a = (this._permutations[X] + Y) & 255;
        const aa = (this._permutations[a] + Z) & 255;
        const ab = (this._permutations[(a + 1) & 255] + Z) & 255;
        const b = (this._permutations[(X + 1) & 255] + Y) & 255;
        const ba = (this._permutations[b] + Z) & 255;
        const bb = (this._permutations[(b + 1) & 255] + Z) & 255;

        return this._lerp(
            this._lerp(
                this._lerp(
                    this._gradient3D(this._permutations[aa], x, y, z),
                    this._gradient3D(this._permutations[ba], x - 1, y, z),
                    u
                ),
                this._lerp(
                    this._gradient3D(this._permutations[ab], x, y - 1, z),
                    this._gradient3D(this._permutations[bb], x - 1, y - 1, z),
                    u
                ),
                v
            ),
            this._lerp(
                this._lerp(
                    this._gradient3D(this._permutations[(aa + 1) & 255], x, y, z - 1),
                    this._gradient3D(this._permutations[(ba + 1) & 255], x - 1, y, z - 1),
                    u
                ),
                this._lerp(
                    this._gradient3D(this._permutations[(ab + 1) & 255], x, y - 1, z - 1),
                    this._gradient3D(this._permutations[(bb + 1) & 255], x - 1, y - 1, z - 1),
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
    public _fractalNoise(x: number, y: number, time: number = 0): number {
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

    /**
     * Generate animated noise that changes over time.
     * This creates flowing, organic motion patterns.
     */
    public _animatedNoise(x: number, y: number, time: number): number {
        const timeScale = 0.01;
        const spatialScale = this._frequency;

        const noiseOne = this._fractalNoise(
            x * spatialScale, y * spatialScale,
            time * timeScale
        );

        const noiseTwo = this._fractalNoise(
            (x + 1000) * spatialScale, 
            (y + 1000) * spatialScale, 
            time * timeScale * 0.8
        );

        return (noiseOne + noiseTwo * 0.5) / 1.5;
    }

    /**
     * Generate a noise function suitable for ASCII pattern generation.
     */
    public _getNoiseFunction(
        direction: 'left' | 'right' | 'up' | 'down' = 'down'
    ): (x: number, y: number, time: number) => number {
        return (x: number, y: number, time: number) => {
            let dx = x;
            let dy = y;
            const dt = time;

            switch (direction) {
                case 'left':
                    dx = x + time * 0.5;
                    break;
                case 'right':
                    dx = x - time * 0.5;
                    break;
                case 'up':
                    dy = y + time * 0.5;
                    break;
                case 'down':
                    dy = y - time * 0.5;
                    break;
            }

            return this._animatedNoise(dx, dy, dt);
        };
    }
}
