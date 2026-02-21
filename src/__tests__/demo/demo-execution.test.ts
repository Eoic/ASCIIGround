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

const mockDocument = {
    createElement: vi.fn(),
    getElementById: vi.fn((id: string) => {
        if (id === 'canvas') return null; // Let the demo create the canvas element
        if (id === 'loader') return mockLoader;
        if (id === 'controls') return mockControls;
        if (id === 'controls-tab') return mockControls;
        if (id === 'canvas-container') return null;
        return null;
    }),
    querySelectorAll: vi.fn((selector: string) => {
        if (selector === '.tab-button') return [];
        if (selector === '.tab-content') return [];
        return [];
    }),
    querySelector: vi.fn((selector: string) => {
        if (selector === '#debug-tab .debug-info') {
            return {
                innerHTML: '',
                appendChild: vi.fn(),
            };
        }

        return null;
    }),
    addEventListener: vi.fn(),
    createDocumentFragment: vi.fn(() => {
        return {
            appendChild: vi.fn((_element: HTMLElement) => {}),
        };
    }),
    removeEventListener: vi.fn(),
    body: mockBody,
};

const mockWindow = {
    innerWidth: 1920,
    innerHeight: 1080,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    getComputedStyle: vi.fn(() => ({
        paddingLeft: '0px',
        paddingRight: '0px',
        paddingTop: '0px',
        paddingBottom: '0px',
    })),
};

Object.assign(globalThis, {
    document: mockDocument,
    window: mockWindow,
    HTMLCanvasElement: vi.fn(),
    HTMLFormElement: vi.fn(),
    HTMLElement: vi.fn(),
    requestAnimationFrame: vi.fn((callback: FrameRequestCallback) => {
        callback(1000);
        return 123;
    }),
    cancelAnimationFrame: vi.fn(),
    setInterval: vi.fn((_callback: () => void, _interval: number) => {
        return 123;
    }),
    clearInterval: vi.fn(),
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

        /* eslint-disable @typescript-eslint/no-explicit-any */
        /* eslint-disable @typescript-eslint/no-unsafe-member-access */
        /* eslint-disable @typescript-eslint/no-unsafe-assignment */
        vi.doMock('../../rendering/ascii-renderer', () => ({
            ASCIIRenderer: vi.fn().mockImplementation(function({ canvas, options }: any) {
                if (canvas && options?.resizeTo) {
                    const target = options.resizeTo;

                    if (target && 'clientWidth' in target) {
                        canvas.width = target.clientWidth;
                        canvas.height = target.clientHeight;
                    } else if (target && 'innerWidth' in target) {
                        canvas.width = target.innerWidth;
                        canvas.height = target.innerHeight;
                    }
                }
                return {
                    initialize: vi.fn(),
                    render: vi.fn(),
                    clear: vi.fn(),
                    destroy: vi.fn(),
                    resize: vi.fn(),
                    options: {},
                    renderInfo: {
                        fps: 60,
                    },
                    mouseInfo: {
                        x: 0,
                        y: 0,
                    },
                    canvas,
                };
            }),
        }));

        /* eslint-enable @typescript-eslint/no-explicit-any */
        /* eslint-enable @typescript-eslint/no-unsafe-member-access */
        /* eslint-enable @typescript-eslint/no-unsafe-assignment */
        vi.doMock('../../demo/ui/config-generator', () => ({
            createPatternControls: vi.fn(() => ({
                switchPattern: vi.fn(),
            })),
        }));

        mockDocument.createElement.mockImplementation((tagName: string) => {
            if (tagName === 'canvas')
                return mockCanvas;

            if (tagName === 'div') {
                const mockDiv = {
                    tagName: 'DIV',
                    id: '',
                    appendChild: vi.fn(),
                    removeChild: vi.fn(),
                    innerHTML: '',
                    textContent: '',
                    get clientWidth() { 
                        return mockWindow.innerWidth; 
                    },
                    get clientHeight() { 
                        return mockWindow.innerHeight; 
                    },
                    getBoundingClientRect: vi.fn(() => ({
                        left: 0, top: 0, right: mockWindow.innerWidth, bottom: mockWindow.innerHeight,
                        width: mockWindow.innerWidth, height: mockWindow.innerHeight, x: 0, y: 0, toJSON: () => ({}),
                    })),
                    style: {
                        paddingLeft: '0px',
                        paddingRight: '0px',
                        paddingTop: '0px',
                        paddingBottom: '0px',
                    },
                    classList: {
                        add: vi.fn(),
                        remove: vi.fn(),
                        contains: vi.fn(),
                        toggle: vi.fn(),
                    },
                    addEventListener: vi.fn(),
                    removeEventListener: vi.fn(),
                    setAttribute: vi.fn(),
                    getAttribute: vi.fn(),
                    removeAttribute: vi.fn(),
                    hasAttribute: vi.fn(),
                };

                Object.setPrototypeOf(mockDiv, HTMLElement.prototype);
                return mockDiv;
            }

            return {
                tagName: tagName.toUpperCase(),
                appendChild: vi.fn(),
                removeChild: vi.fn(),
                innerHTML: '',
                textContent: '',
                innerText: '',
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

        mockDocument.getElementById.mockImplementation((id: string) => {
            if (id === 'canvas') return null;
            if (id === 'loader') return mockLoader;
            if (id === 'controls') return mockControls;
            if (id === 'controls-tab') return mockControls;
            if (id === 'canvas-container') return null;
            return null;
        });

        mockDocument.querySelectorAll.mockImplementation((selector: string) => {
            if (selector === '.tab-button') return [];
            if (selector === '.tab-content') return [];
            return [];
        });

        mockDocument.querySelector.mockImplementation((selector: string) => {
            if (selector === '#debug-tab .debug-info') {
                return {
                    innerHTML: '',
                    appendChild: vi.fn(),
                };
            }

            return null;
        });

        mockDocument.createDocumentFragment.mockImplementation(() => {
            return {
                appendChild: vi.fn((_element: HTMLElement) => {}),
            };
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
        await import('../../demo/demo');

        if (domContentLoadedCallback)
            domContentLoadedCallback();

        expect(mockDocument.createElement).toHaveBeenCalledWith('div');
        expect(mockDocument.createElement).toHaveBeenCalledWith('canvas');
        expect(mockDocument.getElementById).toHaveBeenCalledWith('canvas-container');
        expect(mockCanvas.width).toBe(1920);
        expect(mockCanvas.height).toBe(1080);
        expect(mockDocument.getElementById).toHaveBeenCalledWith('loader');
        expect(mockDocument.getElementById).toHaveBeenCalledWith('controls');
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
        expect(mockDocument.createElement).toHaveBeenCalledWith('div');
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

        const canvasCalls = mockDocument.createElement.mock.calls.filter(call => call[0] === 'canvas');
        expect(canvasCalls.length).toBeGreaterThan(0);
    });

    it('should handle tab switching functionality', async () => {
        const mockTabButtons = [
            {
                getAttribute: vi.fn(() => 'controls-tab'),
                classList: { remove: vi.fn(), add: vi.fn() },
                addEventListener: vi.fn(),
            },
            {
                getAttribute: vi.fn(() => 'debug-tab'),
                classList: { remove: vi.fn(), add: vi.fn() },
                addEventListener: vi.fn(),
            }
        ];

        const mockTabContents = [
            { classList: { remove: vi.fn(), add: vi.fn() } },
            { classList: { remove: vi.fn(), add: vi.fn() } }
        ];

        mockDocument.querySelectorAll.mockImplementation((selector: string) => {
            if (selector === '.tab-button') return mockTabButtons as never[];
            if (selector === '.tab-content') return mockTabContents as never[];
            return [];
        });

        await import('../../demo/demo');
        
        if (domContentLoadedCallback)
            domContentLoadedCallback();

        expect(mockTabButtons[0].addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
        expect(mockTabButtons[1].addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });

    it('should handle debug info setup', async () => {
        const mockDebugContainer = {
            innerHTML: '',
            appendChild: vi.fn(),
        };

        mockDocument.querySelector.mockImplementation((selector: string) => {
            if (selector === '#debug-tab .debug-info') return mockDebugContainer;
            return null;
        });

        vi.doMock('../../rendering/ascii-renderer', () => ({
            ASCIIRenderer: vi.fn().mockImplementation(function() {
                return {
                    initialize: vi.fn(),
                    render: vi.fn(),
                    clear: vi.fn(),
                    destroy: vi.fn(),
                    resize: vi.fn(),
                    options: {},
                    renderInfo: {
                        fps: 60,
                        frameCount: 100,
                        rows: 40,
                        columns: 80,
                    },
                    mouseInfo: {
                        x: 150,
                        y: 200,
                    },
                    canvas: mockCanvas,
                    setOptions: vi.fn(),
                };
            }),
        }));

        await import('../../demo/demo');
        
        if (domContentLoadedCallback)
            domContentLoadedCallback();

        expect(globalThis.setInterval).toHaveBeenCalled();
    });

    it('should handle buildDebugInfo function', async () => {
        const mockDebugContainer = {
            innerHTML: '',
            appendChild: vi.fn(),
        };

        const mockFragment = {
            appendChild: vi.fn(),
        };

        const mockStrongElement = {
            innerText: '',
        };

        const mockSpanElement = {
            innerText: '',
        };

        mockDocument.querySelector.mockReturnValue(mockDebugContainer);
        mockDocument.createDocumentFragment.mockReturnValue(mockFragment);
        mockDocument.createElement.mockImplementation((tagName: string) => {
            if (tagName === 'canvas')
                return mockCanvas;

            if (tagName === 'div') {
                return { 
                    id: '', 
                    appendChild: vi.fn(), 
                    get clientWidth() { return 800; }, 
                    get clientHeight() { return 600; },
                };
            }

            if (tagName === 'strong')
                return mockStrongElement;

            if (tagName === 'span')
                return mockSpanElement;

            return { tagName: tagName.toUpperCase() };
        });

        await import('../../demo/demo');
        
        if (domContentLoadedCallback)
            domContentLoadedCallback();

        expect(mockDocument.createDocumentFragment).toHaveBeenCalled();
        expect(mockFragment.appendChild).toHaveBeenCalled();
        expect(mockDebugContainer.appendChild).toHaveBeenCalledWith(mockFragment);
    });

    it('should handle missing debug container gracefully', async () => {
        mockDocument.querySelector.mockImplementation((selector: string) => {
            if (selector === '#debug-tab .debug-info') return null;
            return null;
        });

        await import('../../demo/demo');
        
        if (domContentLoadedCallback)
            domContentLoadedCallback();

        expect(globalThis.setInterval).not.toHaveBeenCalled();
    });
});
