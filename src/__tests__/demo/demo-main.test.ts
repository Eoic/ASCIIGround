import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Test specifically for demo.ts coverage - targeting the main execution functions

describe('Demo.ts Coverage Test', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
        
        // Setup comprehensive mocks
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

        const mockDocument = {
            createElement: vi.fn((tagName: string) => {
                if (tagName === 'canvas') return mockCanvas;
                // Return a complete DOM element mock for other elements
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

        // Set up global mocks
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
        const mockDocument = globalThis.document;
        
        expect(mockDocument.addEventListener).toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function));
        
        // Get the callback and trigger it to cover the start() function
        // @ts-expect-error - Accessing mock calls for testing
        const calls = mockDocument.addEventListener.mock.calls;
        // @ts-expect-error - Using mock call structure for testing
        const domLoadedCall = calls.find((call: unknown[]) => call[0] === 'DOMContentLoaded');
        expect(domLoadedCall).toBeDefined();
        
        // @ts-expect-error - Accessing mock call data for testing
        const startFunction = domLoadedCall[1];
        
        // Execute the start function to cover its code
        // @ts-expect-error - Calling function from mock for testing
        startFunction();
        
        // Verify that start() function executed and called the expected functions:
        
        // 1. Canvas creation and setup (covers canvas creation code)
        expect(mockDocument.createElement).toHaveBeenCalledWith('canvas');
        
        // 2. DOM element retrieval (covers getElementById calls)
        expect(mockDocument.getElementById).toHaveBeenCalledWith('loader');
        expect(mockDocument.getElementById).toHaveBeenCalledWith('controls');
        
        // 3. Canvas appended to body (covers document.body.appendChild)
        expect(mockDocument.body.appendChild).toHaveBeenCalled();
    });

    it('should import demo module successfully', async () => {
        // This test ensures the demo.ts file is actually loaded and covered
        const demo = await import('../../demo/demo');
        
        // The module should be defined (even though it exports nothing)
        expect(demo).toBeDefined();
        
        // Verify the module executed by checking if addEventListener was called
        // @ts-expect-error - Accessing mocked global for testing
        const mockDocument = globalThis.document;
        expect(mockDocument.addEventListener).toHaveBeenCalled();
    });
});
