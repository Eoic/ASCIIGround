import { 
    Pattern, 
    type PatternOptions, 
    type CharacterData, 
    type PatternContext, 
    type RenderRegion 
} from './pattern';

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

const DEFAULT_RAIN_OPTIONS: Required<
    Pick<RainPatternOptions, 
    keyof Omit<RainPatternOptions, keyof PatternOptions>>
> = {
    rainDensity: 0.8,
    minDropLength: 8,
    maxDropLength: 25,
    minSpeed: 0.5,
    maxSpeed: 1.5,
    mutationRate: 0.04,
    fadeOpacity: 0.2,
    headColor: '#FFFFFF',
};

/**
 * Represents a single rain drop falling down the screen.
 * @category RainPattern
 * @internal
 */
interface RainDrop {
    y: number;
    column: number;
    speed: number;
    length: number;
    characters: string[];
    lastMutationTime: number;
}

/**
 * Matrix-style rain pattern that creates falling streams of characters.
 * Features configurable rain density, drop lengths, speeds, and character mutation.
 * @category Patterns
 */
export class RainPattern extends Pattern<RainPatternOptions> {
    public static readonly ID = 'rain';

    private _rainDrops: RainDrop[] = [];
    private _region: RenderRegion | null = null;
    private _lastFrameCharacters: CharacterData[] = [];

    constructor(options: Partial<RainPatternOptions> = {}) {
        super({ ...DEFAULT_RAIN_OPTIONS, ...options } as RainPatternOptions);
    }

    public initialize(region: RenderRegion): void {
        const hadDrops = this._rainDrops.length > 0;
        const oldRegion = this._region;
        this._region = region;

        if (!hadDrops || !oldRegion || 
            Math.abs(oldRegion.columns - region.columns) > 2 || 
            Math.abs(oldRegion.rows - region.rows) > 2) {
            this._rainDrops = [];
            this._lastFrameCharacters = [];
            this._initializeRainDrops();
        } else {
            this._adjustDropsToNewRegion(oldRegion, region);
            this._maintainRainDensity();
        }
    }

    public update(context: PatternContext): Pattern {
        if (!this._region)
            return this;

        this._updateRainDrops(context);
        this._maintainRainDensity();
        return this;
    }

    public generate(context: PatternContext): CharacterData[] {
        if (!this._region || this._rainDrops.length === 0) {
            if (this._region && this._rainDrops.length === 0)
                this._initializeRainDrops();

            if (this._rainDrops.length === 0)
                return [];
        }

        const characters: CharacterData[] = [];

        if (this._options.fadeOpacity > 0) {
            for (const prevChar of this._lastFrameCharacters) 
                characters.push({ ...prevChar, opacity: this._options.fadeOpacity});
        }

        for (const drop of this._rainDrops) 
            this._renderRainDrop(drop, characters, context);

        this._lastFrameCharacters = characters.filter(char => char.opacity !== this._options.fadeOpacity);
        
        return characters;
    }

    private _initializeRainDrops(): void {
        if (!this._region)
            return;

        const targetDropCount = Math.floor(this._region.columns * this._options.rainDensity);
        const actualTargetCount = Math.max(1, targetDropCount);

        for (let i = 0; i < actualTargetCount; i++) {
            const column = Math.floor(Math.random() * this._region.columns) + this._region.startColumn;
            const drop = this._createRainDrop(column, 0);

            if (i < Math.max(1, Math.floor(actualTargetCount * 0.3)))
                drop.y = Math.random() * this._region.rows;

            this._rainDrops.push(drop);
        }
    }

    private _createRainDrop(column: number, currentTime: number = 0): RainDrop {
        const length = Math.floor(
            Math.random() * (this._options.maxDropLength - this._options.minDropLength)
        ) + this._options.minDropLength;

        const characters = Array.from(
            { length },
            () => this._options.characters[Math.floor(Math.random() * this._options.characters.length)]
        );
    
        const y = -Math.floor(Math.random() * length) - Math.random() * 10;

        return {
            y,
            column,
            length,
            characters,
            lastMutationTime: currentTime,
            speed: Math.random() * (this._options.maxSpeed - this._options.minSpeed) + this._options.minSpeed,
        };
    }

    private _updateRainDrops(context: PatternContext): void {
        if (!this._region)
            return;

        for (const drop of this._rainDrops) {
            if (context.isAnimating)
                drop.y += drop.speed * context.animationSpeed * context.deltaTime;

            if (context.animationTime - drop.lastMutationTime > 1 / this._options.mutationRate) {
                if (Math.random() < this._options.mutationRate) {
                    const charIndex = Math.floor(Math.random() * drop.length);

                    drop.characters[charIndex] = this._options.characters[
                        Math.floor(Math.random() * this._options.characters.length)
                    ];

                    drop.lastMutationTime = context.animationTime;
                }
            }

            if (drop.y - drop.length > this._region.endRow) 
                this._resetRainDrop(drop, context.animationTime);
        }
    }

    private _resetRainDrop(drop: RainDrop, currentTime: number): void {
        if (!this._region)
            return;

        drop.lastMutationTime = currentTime;
        drop.y = -Math.floor(Math.random() * 8) - drop.length;

        drop.length = Math.floor(
            Math.random() * (this._options.maxDropLength - this._options.minDropLength)
        ) + this._options.minDropLength;

        drop.characters = Array.from(
            { length: drop.length },
            () => this._options.characters[Math.floor(Math.random() * this._options.characters.length)]
        );

        drop.speed = Math.random() * (this._options.maxSpeed - this._options.minSpeed) + this._options.minSpeed;
        drop.column = Math.floor(Math.random() * this._region.columns) + this._region.startColumn;
    }

    private _maintainRainDensity(): void {
        if (!this._region)
            return;

        const targetDropCount = Math.floor(this._region.columns * this._options.rainDensity);

        while (this._rainDrops.length < targetDropCount) {
            const column = (this._rainDrops.length % this._region.columns) + this._region.startColumn;
            const drop = this._createRainDrop(column, 0);
            
            if (Math.random() < 0.4) 
                drop.y = Math.random() * this._region.rows + this._region.startRow;
            
            this._rainDrops.push(drop);
        }

        if (this._rainDrops.length > targetDropCount) 
            this._rainDrops.length = targetDropCount;
    }

    /**
     * Adjust existing drops to fit a new region without losing current state.
     */
    private _adjustDropsToNewRegion(_oldRegion: RenderRegion, newRegion: RenderRegion): void {
        for (const drop of this._rainDrops) {
            if (drop.column >= newRegion.startColumn + newRegion.columns)
                drop.column = (drop.column % newRegion.columns) + newRegion.startColumn;
            else if (drop.column < newRegion.startColumn)
                drop.column = newRegion.startColumn;
        }
    }

    private _renderRainDrop(drop: RainDrop, characters: CharacterData[], _context: PatternContext): void {
        if (!this._region) return;

        for (let i = 0; i < drop.length; i++) {
            const charY = Math.floor(drop.y) - i;
            
            if (charY < this._region.startRow || charY > this._region.endRow) 
                continue;

            if (drop.column < this._region.startColumn || drop.column > this._region.endColumn)
                continue;

            const x = drop.column * this._region.charSpacingX;
            const y = charY * this._region.charSpacingY;

            let color: string | undefined = undefined;
            let opacity = 1.0;

            // TODO: Account for padding.
            // TODO: Fix density accumulation (currently, it goes from left to right, but should be random).
            if (i === 0)
                color = this._options.headColor;
            else if (i >= 3) 
                opacity = 1 - (i / drop.length);

            characters.push({
                x,
                y,
                color,
                opacity,
                char: drop.characters[i],
            });
        }
    }

    public destroy(): void {
        this._rainDrops = [];
        this._lastFrameCharacters = [];
        this._region = null;
    }

    public setOptions(newOptions: Partial<RainPatternOptions>): void {
        super.setOptions(newOptions);

        if (newOptions.rainDensity !== undefined && this._region) 
            this._maintainRainDensity();

        if (newOptions.characters !== undefined) {
            for (const drop of this._rainDrops) {
                drop.characters = Array.from(
                    { length: drop.length },
                    () => this._options.characters[Math.floor(Math.random() * this._options.characters.length)]
                );
            }
        }
    }
}
