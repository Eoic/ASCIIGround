/**
 * UV coordinates for a character in the texture atlas.
 * @category Rendering
 */
export interface UVCoordinates {
    u0: number;
    v0: number;
    u1: number;
    v1: number;
}

/**
 * Texture atlas for WebGL character rendering.
 * Generates a texture containing all renderable characters for efficient GPU-based text rendering.
 * @category Rendering
 */
export class TextureAtlas {
    private _canvas: HTMLCanvasElement | null = null;
    private _context: CanvasRenderingContext2D | null = null;
    private _texture: WebGLTexture | null = null;
    private _uvMap: Map<string, UVCoordinates> = new Map();
    private _cellWidth: number = 0;
    private _cellHeight: number = 0;
    private _columns: number = 0;
    private _rows: number = 0;
    private _atlasWidth: number = 0;
    private _atlasHeight: number = 0;
    private _fallbackUV: UVCoordinates = { u0: 0, v0: 0, u1: 0, v1: 0 };

    /**
     * Generate the texture atlas from a set of characters.
     * @param gl - WebGL2 rendering context.
     * @param characters - Array of characters to include in the atlas.
     * @param fontSize - Font size in pixels.
     * @param fontFamily - Font family name.
     */
    public generate(
        gl: WebGL2RenderingContext,
        characters: string[],
        fontSize: number,
        fontFamily: string
    ): void {
        if (characters.length === 0)
            return;

        this._destroyTexture(gl);
        this._uvMap.clear();
        this._createCanvas();
        this._measureCharacters(characters, fontSize, fontFamily);
        this._calculateAtlasLayout(characters.length);
        this._renderCharacters(characters, fontSize, fontFamily);
        this._createTexture(gl);
    }

    /**
     * Get UV coordinates for a character.
     * @param char - The character to look up.
     * @returns UV coordinates for the character, or fallback if not found.
     */
    public getUV(char: string): UVCoordinates {
        return this._uvMap.get(char) || this._fallbackUV;
    }

    /**
     * Check if a character exists in the atlas.
     * @param char - The character to check.
     * @returns True if the character is in the atlas.
     */
    public hasCharacter(char: string): boolean {
        return this._uvMap.has(char);
    }

    /**
     * Get the WebGL texture.
     * @returns The WebGL texture or null if not generated.
     */
    public getTexture(): WebGLTexture | null {
        return this._texture;
    }

    /**
     * Get the cell size used for each character.
     * @returns Object with width and height of each cell.
     */
    public getCellSize(): { width: number; height: number } {
        return { width: this._cellWidth, height: this._cellHeight };
    }

    /**
     * Get the atlas dimensions.
     * @returns Object with width and height of the atlas texture.
     */
    public getAtlasSize(): { width: number; height: number } {
        return { width: this._atlasWidth, height: this._atlasHeight };
    }

    /**
     * Clean up all resources.
     * @param gl - WebGL2 rendering context.
     */
    public destroy(gl: WebGL2RenderingContext): void {
        this._destroyTexture(gl);
        this._canvas = null;
        this._context = null;
        this._uvMap.clear();
    }

    private _createCanvas(): void {
        this._canvas = document.createElement('canvas');
        const context = this._canvas.getContext('2d', { willReadFrequently: true });

        if (!context)
            throw new Error('Failed to create 2D context for texture atlas');

        this._context = context;
    }

    private _measureCharacters(characters: string[], fontSize: number, fontFamily: string): void {
        if (!this._context)
            return;

        this._context.font = `${fontSize}px ${fontFamily}`;
        this._context.textBaseline = 'top';

        let maxWidth = 0;
        let maxHeight = 0;

        for (const char of characters) {
            const metrics = this._context.measureText(char);
            const width = Math.ceil(metrics.width);
            const height = Math.ceil(
                metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
            );

            maxWidth = Math.max(maxWidth, width);
            maxHeight = Math.max(maxHeight, height);
        }

        this._cellWidth = maxWidth + 2;
        this._cellHeight = Math.max(maxHeight, fontSize) + 2;
    }

    private _calculateAtlasLayout(charCount: number): void {
        this._columns = Math.min(16, charCount);
        this._rows = Math.ceil(charCount / this._columns);
        this._atlasWidth = this._nextPowerOf2(this._columns * this._cellWidth);
        this._atlasHeight = this._nextPowerOf2(this._rows * this._cellHeight);
    }

    private _nextPowerOf2(value: number): number {
        let power = 1;

        while (power < value)
            power *= 2;

        return power;
    }

    private _renderCharacters(characters: string[], fontSize: number, fontFamily: string): void {
        if (!this._canvas || !this._context)
            return;

        this._canvas.width = this._atlasWidth;
        this._canvas.height = this._atlasHeight;
        this._context.clearRect(0, 0, this._atlasWidth, this._atlasHeight);
        this._context.font = `${fontSize}px ${fontFamily}`;
        this._context.textBaseline = 'top';
        this._context.fillStyle = '#ffffff';

        for (let i = 0; i < characters.length; i++) {
            const char = characters[i];
            const col = i % this._columns;
            const row = Math.floor(i / this._columns);
            const x = col * this._cellWidth + 1;
            const y = row * this._cellHeight + 1;

            this._context.fillText(char, x, y);

            const u0 = x / this._atlasWidth;
            const v0 = y / this._atlasHeight;
            const u1 = (x + this._cellWidth - 2) / this._atlasWidth;
            const v1 = (y + this._cellHeight - 2) / this._atlasHeight;

            this._uvMap.set(char, { u0, v0, u1, v1 });
        }

        if (characters.length > 0)
            this._fallbackUV = this._uvMap.get(characters[0]) || this._fallbackUV;
    }

    private _createTexture(gl: WebGL2RenderingContext): void {
        if (!this._canvas)
            return;

        this._texture = gl.createTexture();

        if (!this._texture)
            throw new Error('Failed to create WebGL texture');

        gl.bindTexture(gl.TEXTURE_2D, this._texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            this._canvas
        );

        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    private _destroyTexture(gl: WebGL2RenderingContext): void {
        if (this._texture) {
            gl.deleteTexture(this._texture);
            this._texture = null;
        }
    }
}
