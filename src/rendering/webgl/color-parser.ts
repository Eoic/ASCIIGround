type Color = [number, number, number, number];

/** Resolves CSS colors through Canvas 2D and caches their normalized RGBA values. */
export class ColorParser {
    private _canvas: HTMLCanvasElement;
    private _context: CanvasRenderingContext2D;
    private _colors = new Map<string, Color>();

    public constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
        this._canvas = canvas;
        this._context = context;
    }

    public destroy(): void {
        this._colors.clear();
        this._canvas.width = this._canvas.height = 1;
    }

    public parse(cssColor: string): Color {
        const cached = this._colors.get(cssColor);

        if (cached)
            return cached;

        const context = this._context;
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = '#000000';
        context.fillStyle = cssColor;
        context.fillRect(0, 0, 1, 1);

        const rgba = context.getImageData(0, 0, 1, 1).data;
        const color: Color = [rgba[0] / 255, rgba[1] / 255, rgba[2] / 255, rgba[3] / 255];

        if (this._colors.size >= 1024)
            this._colors.clear();

        this._colors.set(cssColor, color);
        return color;
    }
}
