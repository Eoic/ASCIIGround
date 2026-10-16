import type { ASCIIRendererOptions } from '../../../rendering/ascii-renderer';
import type { RenderRegion } from '../../../patterns/pattern';
import { vi } from 'vitest';
import { WebGLRenderer } from '../../../rendering/renderer';

export const webglOptions: ASCIIRendererOptions = {
    color: 'white',
    colorMap: { A: '#00ff00' },
    animated: false,
    animationSpeed: 1,
    fontSize: 16,
    fontFamily: 'monospace',
    backgroundColor: 'black',
    padding: 0,
    rendererType: 'WebGL',
    enableMouseInteraction: false,
    resizeTo: window,
};

export const renderRegion: RenderRegion = {
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

function createWebGLContext(maxTextureSize: number) {
    const uploads: Float32Array[] = [];
    const loseContext = vi.fn();

    const gl = {
        MAX_TEXTURE_SIZE: 0x0d33,
        ARRAY_BUFFER: 0x8892,
        DYNAMIC_DRAW: 0x88e8,
        FLOAT: 0x1406,
        TRIANGLES: 0x0004,
        TEXTURE_2D: 0x0de1,
        TEXTURE0: 0x84c0,
        RGBA: 0x1908,
        UNSIGNED_BYTE: 0x1401,
        TEXTURE_MIN_FILTER: 0x2801,
        TEXTURE_MAG_FILTER: 0x2800,
        TEXTURE_WRAP_S: 0x2802,
        TEXTURE_WRAP_T: 0x2803,
        LINEAR: 0x2601,
        CLAMP_TO_EDGE: 0x812f,
        VERTEX_SHADER: 0x8b31,
        FRAGMENT_SHADER: 0x8b30,
        LINK_STATUS: 0x8b82,
        COMPILE_STATUS: 0x8b81,
        BLEND: 0x0be2,
        SCISSOR_TEST: 0x0c11,
        SRC_ALPHA: 0x0302,
        ONE_MINUS_SRC_ALPHA: 0x0303,
        ONE: 1,
        COLOR_BUFFER_BIT: 0x4000,
        UNPACK_PREMULTIPLY_ALPHA_WEBGL: 0x9241,
        UNPACK_FLIP_Y_WEBGL: 0x9240,
        getParameter: vi.fn(() => maxTextureSize),
        isContextLost: vi.fn(() => false),
        getExtension: vi.fn(() => ({ loseContext })),
        createShader: vi.fn(() => ({})),
        createProgram: vi.fn(() => ({})),
        createBuffer: vi.fn(() => ({})),
        createVertexArray: vi.fn(() => ({})),
        createTexture: vi.fn(() => ({})),
        getShaderParameter: vi.fn(() => true),
        getProgramParameter: vi.fn(() => true),
        getShaderInfoLog: vi.fn(() => 'compile failure'),
        getProgramInfoLog: vi.fn(() => 'link failure'),
        getAttribLocation: vi.fn((_program: unknown, name: string) =>
            ['a_rect', 'a_uv', 'a_color', 'a_transform'].indexOf(name)),
        getUniformLocation: vi.fn((_program: unknown, name: string) => ({ name })),
        shaderSource: vi.fn(),
        compileShader: vi.fn(),
        attachShader: vi.fn(),
        linkProgram: vi.fn(),
        deleteShader: vi.fn(),
        deleteProgram: vi.fn(),
        deleteBuffer: vi.fn(),
        deleteVertexArray: vi.fn(),
        deleteTexture: vi.fn(),
        bindVertexArray: vi.fn(),
        bindBuffer: vi.fn(),
        bufferData: vi.fn(),
        bufferSubData: vi.fn((_target: number, _offset: number, data: Float32Array) => {
            uploads.push(data.slice());
        }),
        enableVertexAttribArray: vi.fn(),
        vertexAttribPointer: vi.fn(),
        vertexAttribDivisor: vi.fn(),
        useProgram: vi.fn(),
        uniform1i: vi.fn(),
        uniform2f: vi.fn(),
        uniform4f: vi.fn(),
        enable: vi.fn(),
        disable: vi.fn(),
        blendFuncSeparate: vi.fn(),
        pixelStorei: vi.fn(),
        activeTexture: vi.fn(),
        viewport: vi.fn(),
        bindTexture: vi.fn(),
        texImage2D: vi.fn(),
        texSubImage2D: vi.fn(),
        texParameteri: vi.fn(),
        drawArraysInstanced: vi.fn(),
        clearColor: vi.fn(),
        clear: vi.fn(),
        scissor: vi.fn(),
    };
    return { gl, uploads, loseContext };
}

function createGlyphContext() {
    const glyphContext = {
        font: '',
        textBaseline: '',
        fillStyle: '',
        measureText: vi.fn(() => ({
            width: 10,
            actualBoundingBoxLeft: 2,
            actualBoundingBoxRight: 10,
            actualBoundingBoxAscent: -3,
            actualBoundingBoxDescent: 15,
        })),
        fillText: vi.fn(),
    };

    return glyphContext;
}

function createColorContext() {
    const colorValues: Record<string, number[]> = {
        white: [255, 255, 255, 255],
        '#00ff00': [0, 255, 0, 255],
        'rgba(255, 0, 0, 0.5)': [255, 0, 0, 128],
        rebeccapurple: [102, 51, 153, 255],
        transparent: [0, 0, 0, 0],
        '#1234': [17, 34, 51, 68],
    };

    const colorContext = {
        fillStyle: '',
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        getImageData: vi.fn(() => ({
            data: new Uint8ClampedArray(colorValues[colorContext.fillStyle] ?? [0, 0, 0, 255]),
        })),
    };

    return colorContext;
}

export function createWebGLFixture(maxTextureSize = 1024) {
    const { gl, uploads, loseContext } = createWebGLContext(maxTextureSize);
    const glyphContext = createGlyphContext();
    const colorContext = createColorContext();
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 160;
    const glyphCanvas = document.createElement('canvas');
    const colorCanvas = document.createElement('canvas');
    const getContext = vi.fn(() => gl);
    Object.defineProperty(canvas, 'getContext', { value: getContext });
    Object.defineProperty(glyphCanvas, 'getContext', { value: vi.fn(() => glyphContext) });
    Object.defineProperty(colorCanvas, 'getContext', { value: vi.fn(() => colorContext) });
    vi.spyOn(document, 'createElement').mockReturnValueOnce(glyphCanvas).mockReturnValueOnce(colorCanvas);
    const renderer = new WebGLRenderer();
    const initialize = () => renderer.initialize(canvas, webglOptions);

    return {
        renderer, initialize, canvas, gl, glyphContext, colorContext,
        uploads, glyphCanvas, colorCanvas, getContext, loseContext,
    };
}

/** Read one uploaded glyph using the instance buffer's documented attribute layout. */
export function readGlyphInstance(upload: Float32Array, index = 0) {
    const offset = index * 16;
    return {
        rect: Array.from(upload.slice(offset, offset + 4)),
        uv: Array.from(upload.slice(offset + 4, offset + 8)),
        color: Array.from(upload.slice(offset + 8, offset + 11)),
        opacity: upload[offset + 11],
        center: Array.from(upload.slice(offset + 12, offset + 14)),
        rotationScale: Array.from(upload.slice(offset + 14, offset + 16)),
    };
}
