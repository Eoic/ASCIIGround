import { describe, it, expect, beforeEach } from 'vitest';
import { WebGLRenderer, createRenderer } from '../../rendering/renderer';
import type { ASCIIRendererOptions } from '../../rendering/ascii-renderer';
import type { CharacterData, RenderRegion } from '../../patterns/pattern';

const createMockOptions = (overrides: Partial<ASCIIRendererOptions> = {}): ASCIIRendererOptions => ({
    color: '#ffffff',
    colorMap: {},
    fontSize: 16,
    fontFamily: 'monospace',
    backgroundColor: '#000000',
    padding: 0,
    rendererType: 'WebGL',
    enableMouseInteraction: false,
    animated: false,
    animationSpeed: 1,
    charSpacingX: undefined,
    charSpacingY: undefined,
    resizeTo: window,
    ...overrides
});

const createMockRegion = (overrides: Partial<RenderRegion> = {}): RenderRegion => ({
    rows: 10,
    columns: 20,
    startRow: 0,
    endRow: 10,
    startColumn: 0,
    endColumn: 20,
    charWidth: 10,
    charHeight: 16,
    charSpacingX: 10,
    charSpacingY: 16,
    canvasWidth: 200,
    canvasHeight: 160,
    ...overrides
});

const createMockCharacter = (overrides: Partial<CharacterData> = {}): CharacterData => ({
    x: 0,
    y: 0,
    char: 'A',
    ...overrides
});

describe('WebGLRenderer', () => {
    let renderer: WebGLRenderer;
    let canvas: HTMLCanvasElement;
    let options: ASCIIRendererOptions;

    beforeEach(() => {
        canvas = document.createElement('canvas');
        options = createMockOptions();
        renderer = new WebGLRenderer();
    });

    describe('initialization', () => {
        it('should initialize without errors', () => {
            expect(() => renderer.initialize(canvas, options)).not.toThrow();
        });

        it('should get WebGL2 context from canvas', () => {
            renderer.initialize(canvas, options);
            expect(canvas.getContext).toHaveBeenCalledWith('webgl2', expect.any(Object));
        });

        it('should store options', () => {
            renderer.initialize(canvas, options);
            expect(renderer.options).toEqual(options);
        });
    });

    describe('clear', () => {
        beforeEach(() => {
            renderer.initialize(canvas, options);
        });

        it('should clear with background color', () => {
            renderer.clear('#ff0000');

            const gl = canvas.getContext('webgl2');
            expect(gl?.clearColor).toHaveBeenCalledWith(1, 0, 0, 1);
            expect(gl?.clear).toHaveBeenCalled();
        });

        it('should parse hex colors correctly', () => {
            renderer.clear('#00ff00');

            const gl = canvas.getContext('webgl2');
            expect(gl?.clearColor).toHaveBeenCalledWith(0, 1, 0, 1);
        });
    });

    describe('render', () => {
        const region = createMockRegion();

        beforeEach(() => {
            renderer.initialize(canvas, options);
        });

        it('should not render empty character array', () => {
            renderer.render([], region);

            const gl = canvas.getContext('webgl2');
            expect(gl?.drawArraysInstanced).not.toHaveBeenCalled();
        });

        it('should render characters using instanced rendering', () => {
            const characters: CharacterData[] = [
                createMockCharacter({ x: 0, y: 0, char: 'A' }),
                createMockCharacter({ x: 10, y: 0, char: 'B' })
            ];

            renderer.render(characters, region);

            const gl = canvas.getContext('webgl2');
            expect(gl?.drawArraysInstanced).toHaveBeenCalledWith(
                expect.any(Number),
                0,
                4,
                characters.length
            );
        });

        it('should handle characters with opacity', () => {
            const characters: CharacterData[] = [
                createMockCharacter({ x: 0, y: 0, char: 'A', opacity: 0.5 })
            ];

            renderer.render(characters, region);

            const gl = canvas.getContext('webgl2');
            expect(gl?.drawArraysInstanced).toHaveBeenCalled();
        });

        it('should handle characters with scale', () => {
            const characters: CharacterData[] = [
                createMockCharacter({ x: 0, y: 0, char: 'A', scale: 2.0 })
            ];

            renderer.render(characters, region);

            const gl = canvas.getContext('webgl2');
            expect(gl?.drawArraysInstanced).toHaveBeenCalled();
        });

        it('should handle characters with rotation', () => {
            const characters: CharacterData[] = [
                createMockCharacter({ x: 0, y: 0, char: 'A', rotation: Math.PI / 4 })
            ];

            renderer.render(characters, region);

            const gl = canvas.getContext('webgl2');
            expect(gl?.drawArraysInstanced).toHaveBeenCalled();
        });

        it('should handle characters with color', () => {
            const characters: CharacterData[] = [
                createMockCharacter({ x: 0, y: 0, char: 'A', color: '#ff0000' })
            ];

            renderer.render(characters, region);

            const gl = canvas.getContext('webgl2');
            expect(gl?.drawArraysInstanced).toHaveBeenCalled();
        });

        it('should use colorMap for character colors', () => {
            renderer.options = createMockOptions({ colorMap: { 'A': '#00ff00' } });

            const characters: CharacterData[] = [
                createMockCharacter({ x: 0, y: 0, char: 'A' })
            ];

            renderer.render(characters, region);

            const gl = canvas.getContext('webgl2');
            expect(gl?.drawArraysInstanced).toHaveBeenCalled();
        });
    });

    describe('resize', () => {
        beforeEach(() => {
            renderer.initialize(canvas, options);
        });

        it('should resize canvas and viewport', () => {
            renderer.resize(1024, 768);

            expect(canvas.width).toBe(1024);
            expect(canvas.height).toBe(768);

            const gl = canvas.getContext('webgl2');
            expect(gl?.viewport).toHaveBeenCalledWith(0, 0, 1024, 768);
        });
    });

    describe('destroy', () => {
        beforeEach(() => {
            renderer.initialize(canvas, options);
        });

        it('should clean up WebGL resources', () => {
            renderer.destroy();

            const gl = canvas.getContext('webgl2');
            expect(gl?.deleteProgram).toHaveBeenCalled();
            expect(gl?.deleteVertexArray).toHaveBeenCalled();
            expect(gl?.deleteBuffer).toHaveBeenCalled();
        });

        it('should be safe to call multiple times', () => {
            renderer.destroy();
            expect(() => renderer.destroy()).not.toThrow();
        });
    });

    describe('options setter', () => {
        beforeEach(() => {
            renderer.initialize(canvas, options);
        });

        it('should update options', () => {
            const newOptions = createMockOptions({ fontSize: 24 });
            renderer.options = newOptions;
            expect(renderer.options.fontSize).toBe(24);
        });
    });
});

describe('createRenderer factory', () => {
    it('should create Canvas2DRenderer for 2D type', () => {
        const renderer = createRenderer('2D');
        expect(renderer.constructor.name).toBe('Canvas2DRenderer');
    });

    it('should create WebGLRenderer for WebGL type', () => {
        const renderer = createRenderer('WebGL');
        expect(renderer.constructor.name).toBe('WebGLRenderer');
    });

    it('should throw for unknown renderer type', () => {
        expect(() => createRenderer('unknown' as '2D' | 'WebGL')).toThrow();
    });
});
