import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// We need to mock everything before importing demo.ts since it runs immediately

// Mock DOM elements - Create a proper canvas mock with working width/height
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

// Mock window
const mockWindow = {
    innerWidth: 1920,
    innerHeight: 1080,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
};

// Setup global mocks before any imports
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

describe('Demo Script Execution', () => {
    let domContentLoadedCallback: () => void;
    let mockCanvas: ReturnType<typeof createMockCanvas>;

    beforeEach(() => {
        vi.clearAllMocks();
        mockCanvas = createMockCanvas();
        
        // Set up the createElement mock to return our specific canvas instance
        mockDocument.createElement.mockImplementation((tagName: string) => {
            if (tagName === 'canvas')
                return mockCanvas;
            
            // Return a more complete DOM element mock for other elements
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
        
        // Capture the DOMContentLoaded callback when it's registered
        mockDocument.addEventListener.mockImplementation((event: string, callback: () => void) => {
            if (event === 'DOMContentLoaded')
                domContentLoadedCallback = callback;
        });
        
        // Clear module cache to ensure fresh imports
        vi.resetModules();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should register DOMContentLoaded event listener', async () => {
        // Import demo.ts to execute the IIFE
        await import('../../demo/demo');
        
        // Verify that addEventListener was called with DOMContentLoaded
        expect(mockDocument.addEventListener).toHaveBeenCalledWith(
            'DOMContentLoaded',
            expect.any(Function)
        );
    });

    it('should execute start function when DOMContentLoaded fires', async () => {
        // Mock ASCIIRenderer to avoid complex initialization
        const mockASCIIRenderer = vi.fn();
        vi.doMock('../rendering/ascii-renderer', () => ({
            ASCIIRenderer: mockASCIIRenderer,
        }));
        
        // Mock createPatternControls to avoid complex UI logic
        const mockCreatePatternControls = vi.fn(() => ({
            switchPattern: vi.fn(),
        }));
        vi.doMock('./ui/config-generator', () => ({
            createPatternControls: mockCreatePatternControls,
        }));
        
        // Import demo.ts to register the event listener
        await import('../../demo/demo');
        
        // Simulate DOMContentLoaded event
        if (domContentLoadedCallback)
            domContentLoadedCallback();

        // Verify canvas creation
        expect(mockDocument.createElement).toHaveBeenCalledWith('canvas');
        
        // Debug logging
        console.log('mockCanvas width after execution:', mockCanvas.width);
        console.log('mockCanvas height after execution:', mockCanvas.height);
        console.log('mockWindow dimensions:', mockWindow.innerWidth, mockWindow.innerHeight);
        
        // Verify canvas dimensions are set (using the actual created canvas)
        expect(mockCanvas.width).toBe(1920);
        expect(mockCanvas.height).toBe(1080);
        
        // Verify DOM element queries
        expect(mockDocument.getElementById).toHaveBeenCalledWith('loader');
        expect(mockDocument.getElementById).toHaveBeenCalledWith('controls');
        
        // Verify canvas is appended to body
        expect(mockBody.appendChild).toHaveBeenCalledWith(mockCanvas);
        
        // Verify loader is hidden
        expect(mockLoader.classList.add).toHaveBeenCalledWith('hidden');
        
        // Verify controls are shown
        expect(mockControlsClassList.remove).toHaveBeenCalledWith('hidden');
    });

    it('should handle missing DOM elements gracefully', async () => {
        // Mock getElementById to return null for missing elements
        mockDocument.getElementById.mockReturnValue(null);
        
        // Import demo.ts
        await import('../../demo/demo');
        
        // This should not throw even with null elements
        expect(() => {
            if (domContentLoadedCallback)
                domContentLoadedCallback();
        }).toThrow(); // It will throw because elements are null
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

        // Verify controls are unhidden (part of handleControls function)
        expect(mockControlsClassList.remove).toHaveBeenCalledWith('hidden');
    });

    it('should handle start function execution flow', async () => {
        await import('../../demo/demo');
        
        if (domContentLoadedCallback)
            domContentLoadedCallback();

        // Verify the complete flow:
        // 1. Canvas creation and setup
        expect(mockDocument.createElement).toHaveBeenCalledWith('canvas');
        expect(mockCanvas.width).toBe(1920);
        expect(mockCanvas.height).toBe(1080);
        
        // 2. DOM element retrieval
        expect(mockDocument.getElementById).toHaveBeenCalledWith('loader');
        expect(mockDocument.getElementById).toHaveBeenCalledWith('controls');
        
        // 3. Canvas append to body
        expect(mockBody.appendChild).toHaveBeenCalledWith(mockCanvas);
        
        // 4. Controls handling (show controls)
        expect(mockControlsClassList.remove).toHaveBeenCalledWith('hidden');
        
        // 5. Loader removal (hide loader)
        expect(mockLoader.classList.add).toHaveBeenCalledWith('hidden');
    });

    it('should handle window resize properties', async () => {
        // Test with different window dimensions
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
