/**
 * Global test setup for vitest
 * This file sets up comprehensive canvas mocking for all tests
 */

import { vi, beforeEach } from 'vitest';

// Complete Canvas Context Mock
const createCanvasContextMock = () => {
    // Use closure to store state
    let _fillStyle = '#000000';
    let _font = '12px monospace';
    let _textBaseline: CanvasTextBaseline = 'top';
    
    return {
        save: vi.fn(),
        restore: vi.fn(),
        clearRect: vi.fn(),
        beginPath: vi.fn(),
        rect: vi.fn(),
        clip: vi.fn(),
        fillText: vi.fn(),
        fillRect: vi.fn(),
        measureText: vi.fn(() => ({ width: 10 })),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
        scale: vi.fn(),
        transform: vi.fn(),
        setTransform: vi.fn(),
        resetTransform: vi.fn(),
        
        set fillStyle(value: string | CanvasGradient | CanvasPattern) {
            _fillStyle = typeof value === 'string' ? value : _fillStyle;
        },
        get fillStyle(): string { return _fillStyle; },
        set font(value: string) {
            _font = value;
        },
        get font(): string { return _font; },
        set textBaseline(value: CanvasTextBaseline) {
            _textBaseline = value;
        },
        get textBaseline(): CanvasTextBaseline { return _textBaseline; },
        
        canvas: {
            width: 800,
            height: 600,
            style: {},
        },
    };
};

class MockHTMLCanvasElement {
    width = 800;
    height = 600;
    style = {};
    _context: ReturnType<typeof createCanvasContextMock> | null = null;
    
    getContext(type: string) {
        if (type === '2d') {
            if (!this._context)
                this._context = createCanvasContextMock();

            return this._context;
        }

        if (type === 'webgl' || type === 'webgl2')
            return {};

        return null;
    }
    
    toDataURL() {
        return 'data:image/png;base64,mock';
    }
    
    addEventListener = vi.fn();
    removeEventListener = vi.fn();
    dispatchEvent = vi.fn();
    getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        right: 800,
        bottom: 600,
        width: 800,
        height: 600,
        x: 0,
        y: 0,
        toJSON: () => ({}),
    }));
}

const originalCreateElement = document.createElement.bind(document);

beforeEach(() => {
    (global as unknown as { HTMLCanvasElement: unknown }).HTMLCanvasElement = MockHTMLCanvasElement;
    
    HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation(
        function(this: HTMLCanvasElement, type: string) {
            if (type === '2d') {
                const mockElement = this as unknown as MockHTMLCanvasElement;

                if (!mockElement._context)
                    mockElement._context = createCanvasContextMock();

                return mockElement._context;
            }
            return null;
        }
    );

    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'canvas')
            return new MockHTMLCanvasElement() as unknown as HTMLCanvasElement;

        return originalCreateElement(tagName);
    });
});
