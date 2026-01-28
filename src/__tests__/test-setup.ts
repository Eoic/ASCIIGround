/**
 * Global test setup for vitest
 * This file sets up comprehensive canvas mocking for all tests
 */

import { vi, beforeEach } from 'vitest';

// WebGL2 Context Mock
export const createWebGL2ContextMock = () => {
    const mockBuffer = {};
    const mockTexture = {};
    const mockProgram = {};
    const mockShader = {};
    const mockVAO = {};

    return {
        // Constants
        VERTEX_SHADER: 35633,
        FRAGMENT_SHADER: 35632,
        LINK_STATUS: 35714,
        COMPILE_STATUS: 35713,
        ARRAY_BUFFER: 34962,
        STATIC_DRAW: 35044,
        DYNAMIC_DRAW: 35048,
        FLOAT: 5126,
        TRIANGLE_STRIP: 5,
        TEXTURE_2D: 3553,
        TEXTURE0: 33984,
        TEXTURE_WRAP_S: 10242,
        TEXTURE_WRAP_T: 10243,
        TEXTURE_MIN_FILTER: 10241,
        TEXTURE_MAG_FILTER: 10240,
        CLAMP_TO_EDGE: 33071,
        LINEAR: 9729,
        RGBA: 6408,
        UNSIGNED_BYTE: 5121,
        BLEND: 3042,
        SRC_ALPHA: 770,
        ONE_MINUS_SRC_ALPHA: 771,
        COLOR_BUFFER_BIT: 16384,

        // Shader methods
        createShader: vi.fn(() => mockShader),
        shaderSource: vi.fn(),
        compileShader: vi.fn(),
        getShaderParameter: vi.fn(() => true),
        getShaderInfoLog: vi.fn(() => ''),
        deleteShader: vi.fn(),

        // Program methods
        createProgram: vi.fn(() => mockProgram),
        attachShader: vi.fn(),
        linkProgram: vi.fn(),
        getProgramParameter: vi.fn(() => true),
        getProgramInfoLog: vi.fn(() => ''),
        deleteProgram: vi.fn(),
        useProgram: vi.fn(),
        getUniformLocation: vi.fn(() => ({})),
        getAttribLocation: vi.fn((_, name: string) => {
            const locations: Record<string, number> = {
                a_vertexPosition: 0,
                a_instancePosition: 1,
                a_instanceUV: 2,
                a_instanceColor: 3,
                a_instanceOpacity: 4,
                a_instanceScale: 5,
                a_instanceRotation: 6,
            };
            return locations[name] ?? -1;
        }),

        // Uniform methods
        uniform1i: vi.fn(),
        uniform1f: vi.fn(),
        uniform2f: vi.fn(),
        uniform3f: vi.fn(),
        uniform4f: vi.fn(),

        // Buffer methods
        createBuffer: vi.fn(() => mockBuffer),
        bindBuffer: vi.fn(),
        bufferData: vi.fn(),
        bufferSubData: vi.fn(),
        deleteBuffer: vi.fn(),

        // VAO methods
        createVertexArray: vi.fn(() => mockVAO),
        bindVertexArray: vi.fn(),
        deleteVertexArray: vi.fn(),

        // Attribute methods
        enableVertexAttribArray: vi.fn(),
        vertexAttribPointer: vi.fn(),
        vertexAttribDivisor: vi.fn(),

        // Texture methods
        createTexture: vi.fn(() => mockTexture),
        bindTexture: vi.fn(),
        texParameteri: vi.fn(),
        texImage2D: vi.fn(),
        deleteTexture: vi.fn(),
        activeTexture: vi.fn(),

        // Draw methods
        drawArrays: vi.fn(),
        drawArraysInstanced: vi.fn(),
        drawElements: vi.fn(),

        // State methods
        enable: vi.fn(),
        disable: vi.fn(),
        blendFunc: vi.fn(),
        viewport: vi.fn(),
        clearColor: vi.fn(),
        clear: vi.fn(),

        // Canvas reference
        canvas: {
            width: 800,
            height: 600,
        },
    };
};

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
    _webglContext: ReturnType<typeof createWebGL2ContextMock> | null = null;

    getContext(type: string, _options?: unknown) {
        if (type === '2d') {
            if (!this._context)
                this._context = createCanvasContextMock();

            return this._context;
        }

        if (type === 'webgl2') {
            if (!this._webglContext)
                this._webglContext = createWebGL2ContextMock();

            return this._webglContext;
        }

        if (type === 'webgl')
            return null;

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

beforeEach(() => {
    (global as unknown as { HTMLCanvasElement: unknown }).HTMLCanvasElement = MockHTMLCanvasElement;
    (global as unknown as { WebGL2RenderingContext: unknown }).WebGL2RenderingContext = class {};

    HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation(
        function(this: HTMLCanvasElement, type: string, _options?: unknown) {
            const mockElement = this as unknown as MockHTMLCanvasElement;

            if (type === '2d') {
                if (!mockElement._context)
                    mockElement._context = createCanvasContextMock();

                return mockElement._context;
            }

            if (type === 'webgl2') {
                if (!mockElement._webglContext)
                    mockElement._webglContext = createWebGL2ContextMock();

                return mockElement._webglContext;
            }

            return null;
        }
    );

    const originalCreateElement = document.createElement.bind(document);

    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'canvas')
            return new MockHTMLCanvasElement() as unknown as HTMLCanvasElement;

        return originalCreateElement(tagName);
    });
});
