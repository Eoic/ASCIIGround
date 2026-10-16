import type { ASCIIRendererOptions } from './ascii-renderer';
import type { CharacterData, RenderRegion } from '../patterns/pattern';
import { WebGLRenderer } from './webgl-renderer';

/**
 * Common interface for all renderers.
 * @category Rendering
 */
export interface Renderer {
    /**
     * Get the rendering options.
     */
    get options(): ASCIIRendererOptions;

    /**
     * Set the rendering options.
     */
    set options(options: ASCIIRendererOptions);

    /**
     * Initialize the renderer with the given canvas.
     */
    initialize(canvas: HTMLCanvasElement, options: ASCIIRendererOptions): void;

    /**
     * Clear the canvas with the given background color.
     */
    clear(backgroundColor: string): void;

    /**
     * Render the given characters.
     */
    render(characters: CharacterData[], region: RenderRegion): void;

    /**
     * Resize the renderer to the given dimensions.
     */
    resize(width: number, height: number): void;

    /**
     * Cleanup resources.
     */
    destroy(): void;
}

/**
 * 2D Canvas renderer for ASCII characters.
 * @category Rendering
 */
export class Canvas2DRenderer implements Renderer {
    private _canvas!: HTMLCanvasElement;
    private _context!: CanvasRenderingContext2D;
    private _options!: ASCIIRendererOptions;

    public get options(): ASCIIRendererOptions {
        return this._options;
    }

    public set options(options: ASCIIRendererOptions) {
        this._options = options;
        this._setupContext();
    }

    public initialize(canvas: HTMLCanvasElement, options: ASCIIRendererOptions): void {
        this._canvas = canvas;
        this._options = options;
        const context = canvas.getContext('2d');

        if (!context) 
            throw new Error('Could not get 2D context from canvas');

        this._context = context;
        this._setupContext();
    }

    public clear(backgroundColor: string): void {
        this._context.fillStyle = backgroundColor;
        this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
        this._context.fillStyle = this._options.color;
    }

    public render(characters: CharacterData[], region: RenderRegion): void {
        const needsClipping = 
            region.startColumn !== 0 || 
            region.startRow !== 0 || 
            region.endColumn !== region.columns || 
            region.endRow !== region.rows;

        if (needsClipping) {
            this._context.save();
            this._context.beginPath();

            this._context.rect(
                region.startColumn * region.charSpacingX,
                region.startRow * region.charSpacingY,
                (region.endColumn - region.startColumn) * region.charSpacingX,
                (region.endRow - region.startRow) * region.charSpacingY
            );

            this._context.clip();
        }

        const defaultColor = this._options.color;
        const colorMap = this._options.colorMap;
        let currentColor = defaultColor;
        let currentAlpha = 1;
        this._context.fillStyle = defaultColor;

        for (const char of characters) {
            if (char.x < 0 || char.x >= region.canvasWidth ||
                char.y < 0 || char.y >= region.canvasHeight)
                continue;

            const targetAlpha = this._options.enableOpacity === false ? 1 : (char.opacity ?? 1);

            if (targetAlpha !== currentAlpha) {
                this._context.globalAlpha = targetAlpha;
                currentAlpha = targetAlpha;
            }

            const charColor = char.color || colorMap[char.char] || defaultColor;

            if (charColor !== currentColor) {
                this._context.fillStyle = charColor;
                currentColor = charColor;
            }

            if (char.scale !== undefined || char.rotation !== undefined) {
                this._context.save();
                this._context.translate(char.x + region.charWidth / 2, char.y + region.charHeight / 2);

                if (char.rotation !== undefined)
                    this._context.rotate(char.rotation);

                if (char.scale !== undefined)
                    this._context.scale(char.scale, char.scale);

                this._context.fillText(char.char, -region.charWidth / 2, -region.charHeight / 2);
                this._context.restore();
            } else
                this._context.fillText(char.char, char.x, char.y);
        }

        if (currentAlpha !== 1)
            this._context.globalAlpha = 1;

        if (currentColor !== defaultColor)
            this._context.fillStyle = defaultColor;

        if (needsClipping) 
            this._context.restore();
    }

    public resize(width: number, height: number): void {
        this._canvas.width = width;
        this._canvas.height = height;
        this._setupContext();
    }

    public destroy(): void {}

    private _setupContext(): void {
        this._context.font = `${this._options.fontSize}px ${this._options.fontFamily}`;
        this._context.textBaseline = 'top';
        this._context.fillStyle = this._options.color;
    }
}

/**
 * Factory function to create appropriate renderer based on preference.
 */
export const createRenderer = (rendererType: '2D' | 'WebGL'): Renderer => {
    switch (rendererType) {
        case 'WebGL':
            return new WebGLRenderer();
        case '2D':
            return new Canvas2DRenderer();
        default:
            throw new Error('Unknown renderer type given!');
    }
};

export { WebGLRenderer } from './webgl-renderer';
