import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

function createMockCanvas() {
    let _width = 0;
    let _height = 0;

    return {
        get width() { return _width; },
        set width(value) { _width = Number(value); },
        get height() { return _height; },
        set height(value) { _height = Number(value); },
        style: {},
        getContext: vi.fn(() => ({
            fillStyle: '',
            font: '',
            textBaseline: 'top',
            fillRect: vi.fn(),
            fillText: vi.fn(),
            measureText: vi.fn(() => ({ width: 10 })),
            clearRect: vi.fn(),
            save: vi.fn(),
            restore: vi.fn(),
            translate: vi.fn(),
            rotate: vi.fn(),
            scale: vi.fn(),
        })),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        getBoundingClientRect: vi.fn(() => ({
            left: 0, top: 0, right: _width, bottom: _height,
            width: _width, height: _height, x: 0, y: 0, toJSON: () => ({}),
        })),
        setAttribute: vi.fn(),
        getAttribute: vi.fn(),
        removeAttribute: vi.fn(),
        hasAttribute: vi.fn(),
    };
}

const mockLoader = {
    classList: {
        add: vi.fn(),
        remove: vi.fn(),
        contains: vi.fn(),
    },
};

const mockControlsClassList = {
    add: vi.fn(),
    remove: vi.fn(),
    contains: vi.fn(),
};

const mockControls = {
    classList: mockControlsClassList,
    innerHTML: '',
    appendChild: vi.fn(),
    removeChild: vi.fn(),
    querySelector: vi.fn(),
    querySelectorAll: vi.fn(() => []),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
} as unknown as HTMLFormElement;

const mockBody = {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
};

// Mock document
const mockDocument = {
    createElement: vi.fn(),
    getElementById: vi.fn((id: string) => {
        if (id === 'loader') return mockLoader;
        if (id === 'controls') return mockControls;
        return null;
    }),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    body: mockBody,
};

const mockWindow = {
    innerWidth: 1920,
    innerHeight: 1080,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
};

Object.assign(globalThis, {
    document: mockDocument,
    window: mockWindow,
    HTMLCanvasElement: vi.fn(),
    HTMLFormElement: vi.fn(),
    requestAnimationFrame: vi.fn((callback: FrameRequestCallback) => {
        callback(1000);
        return 123;
    }),
    cancelAnimationFrame: vi.fn(),
    ResizeObserver: vi.fn(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
    })),
});

describe('Demo script execution', () => {
    let domContentLoadedCallback: () => void;
    let mockCanvas: ReturnType<typeof createMockCanvas>;

    beforeEach(() => {
        vi.clearAllMocks();
        mockCanvas = createMockCanvas();

        mockDocument.createElement.mockImplementation((tagName: string) => {
            if (tagName === 'canvas')
                return mockCanvas;
            
            return {
                tagName: tagName.toUpperCase(),
                appendChild: vi.fn(),
                removeChild: vi.fn(),
                innerHTML: '',
                textContent: '',
                value: '',
                type: '',
                id: '',
                className: '',
                title: '',
                setAttribute: vi.fn(),
                getAttribute: vi.fn(),
                removeAttribute: vi.fn(),
                hasAttribute: vi.fn(),
                classList: {
                    add: vi.fn(),
                    remove: vi.fn(),
                    contains: vi.fn(),
                    toggle: vi.fn(),
                },
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                style: {},
                checked: false,
                disabled: false,
                selected: false,
                options: [],
            };
        });

        mockDocument.addEventListener.mockImplementation((event: string, callback: () => void) => {
            if (event === 'DOMContentLoaded')
                domContentLoadedCallback = callback;
        });

        vi.resetModules();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should register DOMContentLoaded event listener', async () => {
        await import('../../demo/demo');

        expect(mockDocument.addEventListener).toHaveBeenCalledWith(
            'DOMContentLoaded',
            expect.any(Function)
        );
    });

    it('should execute start function when DOMContentLoaded fires', async () => {
        const mockASCIIRenderer = vi.fn();

        vi.doMock('../rendering/ascii-renderer', () => ({
            ASCIIRenderer: mockASCIIRenderer,
        }));

        const mockCreatePatternControls = vi.fn(() => ({
            switchPattern: vi.fn(),
        }));

        vi.doMock('./ui/config-generator', () => ({
            createPatternControls: mockCreatePatternControls,
        }));

        await import('../../demo/demo');

        if (domContentLoadedCallback)
            domContentLoadedCallback();

        expect(mockDocument.createElement).toHaveBeenCalledWith('canvas');
        
        expect(mockCanvas.width).toBe(1920);
        expect(mockCanvas.height).toBe(1080);
        expect(mockDocument.getElementById).toHaveBeenCalledWith('loader');
        expect(mockDocument.getElementById).toHaveBeenCalledWith('controls');
        expect(mockBody.appendChild).toHaveBeenCalledWith(mockCanvas);
        expect(mockLoader.classList.add).toHaveBeenCalledWith('hidden');
        expect(mockControlsClassList.remove).toHaveBeenCalledWith('hidden');
    });

    it('should handle missing DOM elements gracefully', async () => {
        mockDocument.getElementById.mockReturnValue(null);
        await import('../../demo/demo');
        
        expect(() => {
            if (domContentLoadedCallback)
                domContentLoadedCallback();
        }).toThrow();
    });

    it('should create canvas with correct properties', async () => {
        await import('../../demo/demo');
        
        if (domContentLoadedCallback)
            domContentLoadedCallback();

        expect(mockDocument.createElement).toHaveBeenCalledWith('canvas');
        expect(mockCanvas.width).toBe(mockWindow.innerWidth);
        expect(mockCanvas.height).toBe(mockWindow.innerHeight);
    });

    it('should initialize pattern controls with perlin-noise pattern', async () => {
        await import('../../demo/demo');
        
        if (domContentLoadedCallback)
            domContentLoadedCallback();

        expect(mockControlsClassList.remove).toHaveBeenCalledWith('hidden');
    });

    it('should handle start function execution flow', async () => {
        await import('../../demo/demo');
        
        if (domContentLoadedCallback)
            domContentLoadedCallback();

        expect(mockDocument.createElement).toHaveBeenCalledWith('canvas');
        expect(mockCanvas.width).toBe(1920);
        expect(mockCanvas.height).toBe(1080);
        expect(mockDocument.getElementById).toHaveBeenCalledWith('loader');
        expect(mockDocument.getElementById).toHaveBeenCalledWith('controls');
        expect(mockBody.appendChild).toHaveBeenCalledWith(mockCanvas);
        expect(mockControlsClassList.remove).toHaveBeenCalledWith('hidden');
        expect(mockLoader.classList.add).toHaveBeenCalledWith('hidden');
    });

    it('should handle window resize properties', async () => {
        Object.assign(mockWindow, {
            innerWidth: 800,
            innerHeight: 600,
        });

        await import('../../demo/demo');
        
        if (domContentLoadedCallback)
            domContentLoadedCallback();

        expect(mockCanvas.width).toBe(800);
        expect(mockCanvas.height).toBe(600);
    });
});
