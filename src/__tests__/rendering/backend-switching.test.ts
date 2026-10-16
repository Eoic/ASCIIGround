import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ASCIIRenderer, ASCIIGround, DummyPattern } from '../../index';
import { createRenderer, type Renderer } from '../../rendering/renderer';
import { PatternControlsManager } from '../../demo/ui/config-generator';
import { DEBOUNCE_INTERVAL_MS } from '../../demo/ui/constants';

vi.mock('../../rendering/renderer', async (importOriginal) => ({
    ...await importOriginal<typeof import('../../rendering/renderer')>(),
    createRenderer: vi.fn(),
}));

type MockBackend = Pick<Renderer, 'options'> & {
    [K in 'initialize' | 'clear' | 'render' | 'resize' | 'destroy']: ReturnType<typeof vi.fn<Renderer[K]>>;
};

function createMockBackend(): MockBackend {
    const backend: MockBackend = {
        options: {} as Renderer['options'],
        initialize: vi.fn((_canvas, options) => { backend.options = options; }),
        clear: vi.fn(),
        render: vi.fn(),
        resize: vi.fn(),
        destroy: vi.fn(),
    };
    return backend;
}

function selectBackend(form: HTMLFormElement, type: '2D' | 'WebGL'): HTMLSelectElement {
    const select = form.querySelector<HTMLSelectElement>('[name="rendererType"]')!;
    select.value = type;
    select.dispatchEvent(new Event('input', { bubbles: true }));
    vi.advanceTimersByTime(DEBOUNCE_INTERVAL_MS);
    return select;
}

describe('Backend switching', () => {
    let renderer: ASCIIRenderer | undefined;
    let ground: ASCIIGround | undefined;
    let manager: PatternControlsManager | undefined;
    let canvas: HTMLCanvasElement;
    let canvasBackend: MockBackend;
    let webglBackend: MockBackend;
    let fallbackBackend: MockBackend;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.spyOn(document, 'createElement').mockRestore();
        canvas = document.createElement('canvas');
        canvas.id = 'background';
        canvas.className = 'scene';
        canvas.setAttribute('aria-label', 'Animated background');
        document.body.appendChild(canvas);

        vi.spyOn(Object.getPrototypeOf(canvas), 'getContext').mockReturnValue({
            font: '',
            measureText: () => ({ width: 10, actualBoundingBoxAscent: 12, actualBoundingBoxDescent: 4 }),
        });
        vi.spyOn(globalThis, 'requestAnimationFrame').mockReturnValue(42);
        vi.spyOn(globalThis, 'cancelAnimationFrame');
        vi.spyOn(console, 'warn').mockImplementation(() => {});

        canvasBackend = createMockBackend();
        webglBackend = createMockBackend();
        fallbackBackend = createMockBackend();
        vi.mocked(createRenderer).mockImplementation(type => type === 'WebGL' ? webglBackend : canvasBackend);
    });

    afterEach(() => {
        manager?.destroy();
        ground?.destroy();
        renderer?.destroy();
        manager = ground = renderer = undefined;
        document.body.innerHTML = '';
        vi.useRealTimers();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('replaces the canvas while retaining its attributes, pattern, and options', () => {
        const pattern = new DummyPattern({ characters: ['X'] });
        const destroyPattern = vi.spyOn(pattern, 'destroy');
        renderer = new ASCIIRenderer({ canvas, pattern, options: { fontSize: 24 } });

        renderer.setOptions({ rendererType: 'WebGL' });

        expect(renderer.canvas).not.toBe(canvas);
        expect(document.getElementById('background')).toBe(renderer.canvas);
        expect(renderer.canvas.className).toBe('scene');
        expect(renderer.canvas.getAttribute('aria-label')).toBe('Animated background');
        expect(renderer.pattern).toBe(pattern);
        expect(renderer.options).toMatchObject({ fontSize: 24, rendererType: 'WebGL' });
        expect(destroyPattern).not.toHaveBeenCalled();
        expect(canvasBackend.destroy).toHaveBeenCalledOnce();
    });

    it('keeps one animation loop across switches and stops it on destruction', () => {
        renderer = new ASCIIRenderer({ canvas });
        renderer.startAnimation();
        renderer.render();

        renderer.setOptions({ rendererType: 'WebGL' });
        renderer.render();

        expect(webglBackend.render).toHaveBeenCalledOnce();
        expect(requestAnimationFrame).toHaveBeenCalledOnce();

        vi.mocked(createRenderer).mockReturnValueOnce(fallbackBackend);
        renderer.setOptions({ rendererType: '2D' });
        renderer.destroy();

        expect(webglBackend.destroy).toHaveBeenCalledOnce();
        expect(fallbackBackend.destroy).toHaveBeenCalledOnce();
        expect(cancelAnimationFrame).toHaveBeenCalledWith(42);
    });

    it('moves mouse handlers to the active canvas and removes them on destruction', () => {
        renderer = new ASCIIRenderer({ canvas, options: { enableMouseInteraction: true } });
        renderer.setOptions({ rendererType: 'WebGL' });

        canvas.dispatchEvent(new MouseEvent('click'));
        expect(renderer.mouseInfo.clicked).toBe(false);
        renderer.canvas.dispatchEvent(new MouseEvent('click'));
        expect(renderer.mouseInfo.clicked).toBe(true);

        const activeCanvas = renderer.canvas;
        renderer.destroy();
        activeCanvas.dispatchEvent(new MouseEvent('click'));
        expect(renderer.mouseInfo.clicked).toBe(false);
    });

    it('exposes the fallback canvas and backend through ASCIIGround after initialization fails', () => {
        webglBackend.initialize.mockImplementationOnce(() => { throw new Error('Shader compilation failed'); });

        ground = new ASCIIGround().init(canvas, new DummyPattern(), { rendererType: 'WebGL' });

        expect(ground.options.rendererType).toBe('2D');
        expect(ground.canvas).not.toBe(canvas);
        expect(document.getElementById('background')).toBe(ground.canvas);
        expect(webglBackend.destroy).toHaveBeenCalledOnce();
        expect(canvasBackend.initialize).toHaveBeenCalledOnce();
    });

    it('preserves pattern and renderer settings when switching through demo controls', () => {
        renderer = new ASCIIRenderer({ canvas, pattern: new DummyPattern() });
        const form = document.createElement('form');
        manager = new PatternControlsManager(form, renderer);
        renderer.pattern.setOptions({ characters: ['Z'] });
        renderer.setOptions({ fontSize: 30 });
        const pattern = renderer.pattern;

        selectBackend(form, 'WebGL');

        expect(renderer.options).toMatchObject({ rendererType: 'WebGL', fontSize: 30 });
        expect(renderer.pattern).toBe(pattern);
        expect(renderer.pattern.options.characters).toEqual(['Z']);

        manager.switchPattern('rain');
        expect(renderer.options).toMatchObject({ rendererType: 'WebGL', fontSize: 30 });
    });

    it('shows the actual fallback backend in demo controls', () => {
        renderer = new ASCIIRenderer({ canvas });
        const form = document.createElement('form');
        manager = new PatternControlsManager(form, renderer);
        webglBackend.initialize.mockImplementationOnce(() => { throw new Error('Shader compilation failed'); });

        const select = selectBackend(form, 'WebGL');
        renderer.render();

        expect(renderer.options.rendererType).toBe('2D');
        expect(select.value).toBe('2D');
        expect(canvasBackend.render).toHaveBeenCalled();
    });

    it('moves a canvas resize target and its observer to the replacement', () => {
        const observe = vi.fn();
        const disconnect = vi.fn();
        vi.stubGlobal('ResizeObserver', class {
            observe = observe;
            disconnect = disconnect;
        });
        const prototype = Object.getPrototypeOf(canvas) as HTMLCanvasElement;
        vi.spyOn(prototype, 'clientWidth', 'get').mockReturnValue(320);
        vi.spyOn(prototype, 'clientHeight', 'get').mockReturnValue(240);
        canvas.style.padding = '0px';
        renderer = new ASCIIRenderer({ canvas, options: { resizeTo: canvas } });

        renderer.setOptions({ rendererType: 'WebGL' });
        renderer.resize();

        expect(renderer.options.resizeTo).toBe(renderer.canvas);
        expect(disconnect).toHaveBeenCalledOnce();
        expect(observe).toHaveBeenLastCalledWith(renderer.canvas);
        expect(renderer.canvas.width).toBe(320);
        expect(renderer.canvas.height).toBe(240);
    });

    it('retries a failed GPU frame through Canvas 2D without restarting the pattern', () => {
        renderer = new ASCIIRenderer({ canvas, options: { rendererType: 'WebGL', enableMouseInteraction: true } });
        const pattern = renderer.pattern;
        webglBackend.render.mockImplementationOnce(() => { throw new Error('Context lost'); });
        renderer.startAnimation();

        renderer.render();

        expect(renderer.options.rendererType).toBe('2D');
        expect(renderer.pattern).toBe(pattern);
        expect(webglBackend.destroy).toHaveBeenCalledOnce();
        expect(canvasBackend.render).toHaveBeenCalledWith(...webglBackend.render.mock.calls[0]);
        expect(requestAnimationFrame).toHaveBeenCalledOnce();
        renderer.canvas.dispatchEvent(new MouseEvent('click'));
        expect(renderer.mouseInfo.clicked).toBe(true);
    });

    it('recovers a paused unchanged frame when its WebGL context is lost', () => {
        renderer = new ASCIIRenderer({ canvas, options: { rendererType: 'WebGL' } });
        renderer.render();
        renderer.render();
        expect(webglBackend.render).toHaveBeenCalledOnce();
        webglBackend.clear.mockImplementationOnce(() => { throw new Error('Context lost'); });

        canvas.dispatchEvent(new Event('webglcontextlost'));

        expect(renderer.options.rendererType).toBe('2D');
        expect(canvasBackend.render).toHaveBeenCalledOnce();

        canvas.dispatchEvent(new Event('webglcontextlost'));
        expect(canvasBackend.render).toHaveBeenCalledOnce();
    });

    it('redraws unchanged output after resizing while animated', () => {
        renderer = new ASCIIRenderer({ canvas, pattern: new DummyPattern() });
        renderer.startAnimation();
        renderer.render(1000);
        renderer.render(1000);
        expect(canvasBackend.render).toHaveBeenCalledOnce();

        renderer.resize();
        renderer.render(1000);

        expect(canvasBackend.render).toHaveBeenCalledTimes(2);
    });
});
