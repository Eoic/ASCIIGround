export interface AtlasPage {
    texture: WebGLTexture;
    x: number;
    y: number;
    rowHeight: number;
}

interface Glyph {
    page: AtlasPage;
    x: number;
    y: number;
    width: number;
    height: number;
    left: number;
    top: number;
}

/** Owns cached glyph textures and packs rasterized characters into atlas pages. */
export class GlyphAtlas {
    public readonly size: number;
    private _gl: WebGL2RenderingContext;
    private _canvas: HTMLCanvasElement;
    private _context: CanvasRenderingContext2D;
    private _pages: AtlasPage[] = [];
    private _glyphs = new Map<string, Glyph>();

    public constructor(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
        this._gl = gl;
        this._canvas = canvas;
        this._context = context;
        this.size = Math.min(1024, gl.getParameter(gl.MAX_TEXTURE_SIZE) as number);
    }

    public getFirstPage(): AtlasPage {
        return this._pages[0] ?? this._createPage();
    }

    public destroy(): void {
        this.reset();
        this._canvas.width = this._canvas.height = 1;
    }

    public reset(): void {
        this._pages.forEach(page => this._gl.deleteTexture(page.texture));
        this._pages = [];
        this._glyphs.clear();
    }

    public getGlyph(character: string, fontSize: number, fontFamily: string): Glyph {
        const cached = this._glyphs.get(character);

        if (cached)
            return cached;

        const context = this._context;
        context.font = `${fontSize}px ${fontFamily}`;
        context.textBaseline = 'top';

        const metrics = context.measureText(character);
        const left = Math.floor(-(metrics.actualBoundingBoxLeft ?? 0)) - 1;
        const top = Math.floor(-(metrics.actualBoundingBoxAscent ?? 0)) - 1;
        const width = Math.max(1, Math.ceil(metrics.actualBoundingBoxRight ?? metrics.width) - left + 1);
        const height = Math.max(1, Math.ceil(metrics.actualBoundingBoxDescent ?? fontSize) - top + 1);

        if (width > this.size || height > this.size)
            throw new Error('Character exceeds the WebGL glyph atlas size.');

        let page = this._pages.at(-1) ?? this._createPage();

        if (page.x + width > this.size) {
            page.x = 0;
            page.y += page.rowHeight;
            page.rowHeight = 0;
        }

        if (page.y + height > this.size)
            page = this._createPage();

        const glyph = { page, x: page.x, y: page.y, width, height, left, top };
        page.x += width;
        page.rowHeight = Math.max(page.rowHeight, height);
        this._canvas.width = width;
        this._canvas.height = height;
        context.font = `${fontSize}px ${fontFamily}`;
        context.textBaseline = 'top';
        context.fillStyle = '#ffffff';
        context.fillText(character, -left, -top);

        const gl = this._gl;
        gl.bindTexture(gl.TEXTURE_2D, page.texture);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, glyph.x, glyph.y, gl.RGBA, gl.UNSIGNED_BYTE, this._canvas);
        this._glyphs.set(character, glyph);
        return glyph;
    }

    private _createPage(): AtlasPage {
        const gl = this._gl;
        const texture = gl.createTexture();

        if (!texture)
            throw new Error('Could not create WebGL glyph atlas.');

        const page = { texture, x: 0, y: 0, rowHeight: 0 };
        this._pages.push(page);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.size, this.size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        return page;
    }
}
