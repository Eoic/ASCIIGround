import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

interface MockDocument {
    createElement: ReturnType<typeof vi.fn>;
    getElementById: ReturnType<typeof vi.fn>;
    addEventListener: ReturnType<typeof vi.fn>;
    body: {
        appendChild: ReturnType<typeof vi.fn>;
    };
}

describe('Demo.ts Coverage Test', () => {
    let mockDocument: MockDocument;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
        
        const mockCanvas = {
            width: 0,
            height: 0,
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
                left: 0, top: 0, right: 800, bottom: 600,
                width: 800, height: 600, x: 0, y: 0, toJSON: () => ({}),
            })),
        };

        const mockLoader = { 
            classList: { 
                add: vi.fn(), 
                remove: vi.fn(),
                contains: vi.fn(),
            }, 
        };
        
        const mockControls = { 
            classList: { 
                add: vi.fn(), 
                remove: vi.fn(),
                contains: vi.fn(),
            },
            appendChild: vi.fn(),
            querySelector: vi.fn(),
            querySelectorAll: vi.fn(() => []),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        };

        mockDocument = {
            createElement: vi.fn((tagName: string) => {
                if (tagName === 'canvas')
                    return mockCanvas;

                return {
                    tagName: tagName.toUpperCase(),
                    appendChild: vi.fn(),
                    removeChild: vi.fn(),
                    innerHTML: '',
                    textContent: '',
                    className: '',
                    style: {},
                    value: '',
                    type: '',
                    checked: false,
                    disabled: false,
                    selected: false,
                    setAttribute: vi.fn(),
                    getAttribute: vi.fn(),
                    removeAttribute: vi.fn(),
                    hasAttribute: vi.fn(),
                    classList: { add: vi.fn(), remove: vi.fn(), contains: vi.fn(), toggle: vi.fn() },
                    addEventListener: vi.fn(),
                    removeEventListener: vi.fn(),
                    focus: vi.fn(),
                    blur: vi.fn(),
                    click: vi.fn(),
                    children: [],
                    childNodes: [],
                    parentNode: null,
                    nextSibling: null,
                    previousSibling: null,
                    firstChild: null,
                    lastChild: null,
                };
            }),
            getElementById: vi.fn((id: string) => {
                if (id === 'loader') return mockLoader;
                if (id === 'controls') return mockControls;
                return null;
            }),
            addEventListener: vi.fn(),
            body: { appendChild: vi.fn() },
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
            requestAnimationFrame: vi.fn((cb: FrameRequestCallback) => {
                cb(1000);
                return 123;
            }),
            cancelAnimationFrame: vi.fn(),
            ResizeObserver: vi.fn(() => ({
                observe: vi.fn(),
                unobserve: vi.fn(),
                disconnect: vi.fn(),
            })),
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.resetModules();
    });

    it('should execute demo.ts and cover all main functions', async () => {
        await import('../../demo/demo');
        
        const addEventListenerMock = mockDocument.addEventListener;
        expect(addEventListenerMock).toHaveBeenCalledWith('DOMContentLoaded', expect.anything());

        const calls = vi.mocked(addEventListenerMock).mock.calls;
        const domLoadedCall = calls.find(call => call[0] === 'DOMContentLoaded');
        expect(domLoadedCall).toBeDefined();
        
        if (domLoadedCall) {
            const startFunction = domLoadedCall[1] as () => void;
            startFunction();
            
            const createElementMock = mockDocument.createElement;
            expect(createElementMock).toHaveBeenCalledWith('canvas');
            
            const getElementByIdMock = mockDocument.getElementById;
            expect(getElementByIdMock).toHaveBeenCalledWith('loader');
            expect(getElementByIdMock).toHaveBeenCalledWith('controls');

            const appendChildMock = mockDocument.body.appendChild;
            expect(appendChildMock).toHaveBeenCalled();
        }
    });

    it('should import demo module successfully', async () => {
        const demo = await import('../../demo/demo');

        expect(demo).toBeDefined();
        const addEventListenerMock = mockDocument.addEventListener;
        expect(addEventListenerMock).toHaveBeenCalled();
    });
});
