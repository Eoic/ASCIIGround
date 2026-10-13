import type { ASCIIRendererOptions } from '../../rendering/ascii-renderer';
import type { RenderRegion } from '../../patterns/pattern';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { Canvas2DRenderer, WebGLRenderer, createRenderer } from '../../rendering/renderer';

const options: ASCIIRendererOptions = {
    color: '#ffffff',
    colorMap: { A: '#00ff00' },
    animated: false,
    animationSpeed: 1,
    fontSize: 16,
    fontFamily: 'monospace',
    backgroundColor: '#000000',
    padding: 0,
    rendererType: '2D',
    enableMouseInteraction: false,
    resizeTo: window,
};

const region: RenderRegion = {
    rows: 10,
    columns: 10,
    startRow: 0,
    endRow: 10,
    startColumn: 0,
    endColumn: 10,
    charWidth: 10,
    charHeight: 16,
    charSpacingX: 10,
    charSpacingY: 16,
    canvasWidth: 100,
    canvasHeight: 160,
};

function setupCanvas() {
    const context = {
        fillStyle: '',
        globalAlpha: 1,
        font: '',
        textBaseline: '',
        fillRect: vi.fn(),
        fillText: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        scale: vi.fn(),
        rotate: vi.fn(),
        beginPath: vi.fn(),
        rect: vi.fn(),
        clip: vi.fn(),
    };
    const canvas = document.createElement('canvas');
    vi.spyOn(canvas, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
    const renderer = new Canvas2DRenderer();
    renderer.initialize(canvas, options);
    return { renderer, canvas, context };
}

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

describe('Canvas2DRenderer', () => {
    it('rejects canvases without a 2D context', () => {
        const canvas = document.createElement('canvas');
        vi.spyOn(canvas, 'getContext').mockReturnValue(null);
        expect(() => new Canvas2DRenderer().initialize(canvas, options)).toThrow('Could not get 2D context');
    });

    it('clips partial regions and skips characters outside the canvas', () => {
        const { renderer, context } = setupCanvas();
        renderer.render([
            { x: -1, y: 0, char: 'left' },
            { x: 100, y: 0, char: 'right' },
            { x: 0, y: -1, char: 'top' },
            { x: 0, y: 160, char: 'bottom' },
            { x: 20, y: 32, char: 'A' }
        ], { ...region, startColumn: 2, endColumn: 8, startRow: 2, endRow: 8 });
        expect(context.rect).toHaveBeenCalledWith(20, 32, 60, 96);
        expect(context.clip).toHaveBeenCalledOnce();
        expect(context.fillText).toHaveBeenCalledExactlyOnceWith('A', 20, 32);
        expect(context.restore).toHaveBeenCalledOnce();
        expect(context.fillStyle).toBe(options.color);
    });

    it('applies transforms and restores opacity and color for later frames', () => {
        const { renderer, context } = setupCanvas();
        renderer.render([
            { x: 0, y: 0, char: 'A', opacity: 0.5, scale: 2 },
            { x: 10, y: 0, char: 'B', rotation: 1, color: '#ff0000', opacity: 0.5 }
        ], region);
        expect(context.scale).toHaveBeenCalledExactlyOnceWith(2, 2);
        expect(context.rotate).toHaveBeenCalledExactlyOnceWith(1);
        expect(context.translate).toHaveBeenNthCalledWith(1, 5, 8);
        expect(context.translate).toHaveBeenNthCalledWith(2, 15, 8);
        expect(context.globalAlpha).toBe(1);
        expect(context.fillStyle).toBe(options.color);
        expect(context.clip).not.toHaveBeenCalled();
        renderer.render([{ x: 0, y: 0, char: 'B' }], region);
        expect(context.fillText).toHaveBeenLastCalledWith('B', 0, 0);
    });

    it('retains font and color after resize, option changes, and clearing', () => {
        const { renderer, canvas, context } = setupCanvas();
        renderer.options = { ...options, fontSize: 24, color: '#abcdef' };
        renderer.resize(200, 300);
        renderer.clear('#123456');
        expect(canvas.width).toBe(200);
        expect(canvas.height).toBe(300);
        expect(context.font).toBe('24px monospace');
        expect(context.fillRect).toHaveBeenCalledWith(0, 0, 200, 300);
        expect(context.fillStyle).toBe('#abcdef');
        expect(renderer.options.fontSize).toBe(24);
    });
});

describe('renderer selection', () => {
    it('uses 2D when WebGL is unavailable and rejects invalid renderer types', () => {
        vi.stubGlobal('WebGL2RenderingContext', undefined);
        expect(createRenderer('WebGL')).toBeInstanceOf(Canvas2DRenderer);
        expect(createRenderer('2D')).toBeInstanceOf(Canvas2DRenderer);
        expect(() => createRenderer('invalid' as '2D')).toThrow('Unknown renderer type');
    });

    it('reports missing WebGL contexts and allows cleanup before initialization', () => {
        vi.stubGlobal('WebGL2RenderingContext', class {});
        expect(createRenderer('WebGL')).toBeInstanceOf(WebGLRenderer);
        const renderer = new WebGLRenderer();
        const canvas = document.createElement('canvas');
        vi.spyOn(canvas, 'getContext').mockReturnValue(null);
        expect(() => renderer.initialize(canvas)).toThrow('Could not get WebGL2 context');
        expect(() => {
            renderer.clear('#000000');
            renderer.resize(100, 100);
            renderer.render([], region);
            renderer.destroy();
        }).not.toThrow();
    });
});
