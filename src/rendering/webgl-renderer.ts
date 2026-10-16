import type { ASCIIRendererOptions } from './ascii-renderer';
import type { CharacterData, RenderRegion } from '../patterns/pattern';
import type { Renderer } from './renderer';
import { GlyphAtlas } from './webgl/glyph-atlas';
import { ColorParser } from './webgl/color-parser';
import { BATCH_SIZE, GlyphPipeline, INSTANCE_FLOATS } from './webgl/glyph-pipeline';

/**
 * WebGL2 renderer using cached font glyphs and instanced, ordered batches.
 * @category Rendering
 */
export class WebGLRenderer implements Renderer {
    private _gl: WebGL2RenderingContext | null = null;
    private _canvas!: HTMLCanvasElement;
    private _options!: ASCIIRendererOptions;
    private _atlas: GlyphAtlas | null = null;
    private _colors: ColorParser | null = null;
    private _pipeline: GlyphPipeline | null = null;
    private _initialized = false;

    public get options(): ASCIIRendererOptions {
        return this._options;
    }

    public set options(options: ASCIIRendererOptions) {
        const fontChanged = options.fontSize !== this._options.fontSize ||
            options.fontFamily !== this._options.fontFamily;
        this._options = options;

        if (fontChanged)
            this._atlas?.reset();
    }

    public initialize(canvas: HTMLCanvasElement, options: ASCIIRendererOptions): void {
        this.destroy();
        this._canvas = canvas;
        this._options = options;
        const gl = canvas.getContext('webgl2', { alpha: true, preserveDrawingBuffer: true });

        if (!gl)
            throw new Error('Could not get WebGL2 context from canvas.');

        this._gl = gl;

        try {
            const glyphCanvas = document.createElement('canvas');
            const colorCanvas = document.createElement('canvas');
            colorCanvas.width = colorCanvas.height = 1;

            const glyphContext = glyphCanvas.getContext('2d');
            const colorContext = colorCanvas.getContext('2d', { willReadFrequently: true });

            if (!glyphContext || !colorContext)
                throw new Error('Could not get 2D context for WebGL glyphs and colors.');

            this._atlas = new GlyphAtlas(gl, glyphCanvas, glyphContext);
            this._colors = new ColorParser(colorCanvas, colorContext);
            this._pipeline = new GlyphPipeline(gl, canvas);
            this._pipeline.initialize();
            this._atlas.getFirstPage();
            this._initialized = true;
        } catch (error) {
            this.destroy();
            throw error;
        }
    }

    public clear(backgroundColor: string): void {
        if (!this._initialized || !this._gl)
            return;

        const gl = this._gl;

        if (gl.isContextLost())
            throw new Error('WebGL context was lost.');

        const color = this._colors!.parse(backgroundColor);
        gl.disable(gl.SCISSOR_TEST);

        if (color[3] === 1) {
            gl.clearColor(...color);
            gl.clear(gl.COLOR_BUFFER_BIT);
        } else if (color[3] > 0) {
            this._pipeline!.prepareDraw(true);

            this._pipeline!.instances.set([
                0, 0, this._canvas.width, this._canvas.height,
                0, 0, 0, 0, ...color, 0, 0, 1, 0
            ]);

            this._pipeline!.drawBatch(this._atlas!.getFirstPage(), 1);
        }
    }

    public render(characters: CharacterData[], region: RenderRegion): void {
        if (!this._initialized || !this._gl || characters.length === 0)
            return;

        const gl = this._gl;
        this._pipeline!.prepareDraw(false);

        const needsClipping =
            region.startColumn !== 0 ||
            region.startRow !== 0 ||
            region.endColumn !== region.columns ||
            region.endRow !== region.rows;

        if (needsClipping) {
            const left = Math.max(0, region.startColumn * region.charSpacingX);
            const top = Math.max(0, region.startRow * region.charSpacingY);
            const right = Math.min(this._canvas.width, region.endColumn * region.charSpacingX);
            const bottom = Math.min(this._canvas.height, region.endRow * region.charSpacingY);
            gl.enable(gl.SCISSOR_TEST);

            gl.scissor(
                Math.floor(left), this._canvas.height - Math.ceil(bottom),
                Math.max(0, Math.ceil(right) - Math.floor(left)),
                Math.max(0, Math.ceil(bottom) - Math.floor(top))
            );

            this._pipeline!.setClip(left, this._canvas.height - bottom, right, this._canvas.height - top);
        }

        let count = 0;
        let page = this._atlas!.getFirstPage();

        try {
            for (const character of characters) {
                if (character.x < 0 || character.x >= region.canvasWidth ||
                    character.y < 0 || character.y >= region.canvasHeight)
                    continue;

                const glyph = this._atlas!.getGlyph(character.char, this._options.fontSize, this._options.fontFamily);

                if (glyph.page !== page || count === BATCH_SIZE) {
                    this._pipeline!.drawBatch(page, count);
                    page = glyph.page;
                    count = 0;
                }

                const color = this._colors!.parse(
                    character.color ||
                    this._options.colorMap[character.char] ||
                    this._options.color
                );

                const opacity = this._options.enableOpacity === false ? 1 : (character.opacity ?? 1);
                const scale = character.scale ?? 1;
                const rotation = character.rotation ?? 0;

                this._pipeline!.instances.set([
                    character.x + glyph.left, character.y + glyph.top, glyph.width, glyph.height,
                    glyph.x / this._atlas!.size, glyph.y / this._atlas!.size,
                    glyph.width / this._atlas!.size, glyph.height / this._atlas!.size,
                    color[0], color[1], color[2], color[3] * opacity,
                    character.x + region.charWidth / 2, character.y + region.charHeight / 2,
                    Math.cos(rotation) * scale, Math.sin(rotation) * scale
                ], count * INSTANCE_FLOATS);

                count++;
            }

            this._pipeline!.drawBatch(page, count);
        } finally {
            gl.disable(gl.SCISSOR_TEST);
        }
    }

    public resize(width: number, height: number): void {
        if (!this._initialized || !this._gl)
            return;

        this._canvas.width = width;
        this._canvas.height = height;
        this._gl.viewport(0, 0, width, height);
        this._gl.disable(this._gl.SCISSOR_TEST);
        this._gl.clearColor(0, 0, 0, 0);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT);
    }

    public destroy(): void {
        this._atlas?.destroy();
        this._pipeline?.destroy();
        this._colors?.destroy();
        this._gl?.getExtension('WEBGL_lose_context')?.loseContext();
        this._atlas = this._pipeline = this._colors = null;
        this._gl = null;
        this._initialized = false;
    }
}
