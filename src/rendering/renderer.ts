import type { ASCIIRendererOptions } from './ascii-renderer';
import type { CharacterData, RenderRegion } from '../patterns/pattern';
import { TextureAtlas } from './texture-atlas';

/**
 * Common interface for all renderers.
 * @category Rendering
 */
export interface Renderer {
    /**
     * Get the rendering options.
     */
    get options(): ASCIIRendererOptions;

    /**
     * Set the rendering options.
     */
    set options(options: ASCIIRendererOptions);

    /**
     * Initialize the renderer with the given canvas.
     */
    initialize(canvas: HTMLCanvasElement, options: ASCIIRendererOptions): void;

    /**
     * Clear the canvas with the given background color.
     */
    clear(backgroundColor: string): void;

    /**
     * Render the given characters.
     */
    render(characters: CharacterData[], region: RenderRegion): void;

    /**
     * Resize the renderer to the given dimensions.
     */
    resize(width: number, height: number): void;

    /**
     * Cleanup resources.
     */
    destroy(): void;
}

/**
 * 2D Canvas renderer for ASCII characters.
 * @category Rendering
 */
export class Canvas2DRenderer implements Renderer {
    private _canvas!: HTMLCanvasElement;
    private _context!: CanvasRenderingContext2D;
    private _options!: ASCIIRendererOptions;

    public get options(): ASCIIRendererOptions {
        return this._options;
    }

    public set options(options: ASCIIRendererOptions) {
        this._options = options;
        this._setupContext();
    }

    public initialize(canvas: HTMLCanvasElement, options: ASCIIRendererOptions): void {
        this._canvas = canvas;
        this._options = options;
        const context = canvas.getContext('2d');

        if (!context) 
            throw new Error('Could not get 2D context from canvas');

        this._context = context;
        this._setupContext();
    }

    public clear(backgroundColor: string): void {
        this._context.fillStyle = backgroundColor;
        this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
        this._context.fillStyle = this._options.color;
    }

    public render(characters: CharacterData[], region: RenderRegion): void {
        const needsClipping = 
            region.startColumn !== 0 || 
            region.startRow !== 0 || 
            region.endColumn !== region.columns || 
            region.endRow !== region.rows;

        if (needsClipping) {
            this._context.save();
            this._context.beginPath();

            this._context.rect(
                region.startColumn * region.charSpacingX,
                region.startRow * region.charSpacingY,
                (region.endColumn - region.startColumn) * region.charSpacingX,
                (region.endRow - region.startRow) * region.charSpacingY
            );

            this._context.clip();
        }

        const defaultColor = this._options.color;
        const colorMap = this._options.colorMap;
        let currentColor = defaultColor;
        let currentAlpha = 1;
        this._context.fillStyle = defaultColor;

        for (const char of characters) {
            if (char.x < 0 || char.x >= region.canvasWidth ||
                char.y < 0 || char.y >= region.canvasHeight)
                continue;

            const targetAlpha = char.opacity === undefined ? 1 : char.opacity;

            if (targetAlpha !== currentAlpha) {
                this._context.globalAlpha = targetAlpha;
                currentAlpha = targetAlpha;
            }

            const charColor = char.color || colorMap[char.char] || defaultColor;

            if (charColor !== currentColor) {
                this._context.fillStyle = charColor;
                currentColor = charColor;
            }

            if (char.scale !== undefined || char.rotation !== undefined) {
                this._context.save();
                this._context.translate(char.x + region.charWidth / 2, char.y + region.charHeight / 2);

                if (char.rotation !== undefined)
                    this._context.rotate(char.rotation);

                if (char.scale !== undefined)
                    this._context.scale(char.scale, char.scale);

                this._context.fillText(char.char, -region.charWidth / 2, -region.charHeight / 2);
                this._context.restore();
            } else
                this._context.fillText(char.char, char.x, char.y);
        }

        if (currentAlpha !== 1)
            this._context.globalAlpha = 1;

        if (currentColor !== defaultColor)
            this._context.fillStyle = defaultColor;

        if (needsClipping) 
            this._context.restore();
    }

    public resize(width: number, height: number): void {
        this._canvas.width = width;
        this._canvas.height = height;
        this._setupContext();
    }

    public destroy(): void {}

    private _setupContext(): void {
        this._context.font = `${this._options.fontSize}px ${this._options.fontFamily}`;
        this._context.textBaseline = 'top';
        this._context.fillStyle = this._options.color;
    }
}

/** Number of floats per instance in the instance buffer */
const FLOATS_PER_INSTANCE = 12;

/** Initial capacity for instance buffer (number of characters) */
const INITIAL_INSTANCE_CAPACITY = 5000;

/** Parsed RGB color */
interface ParsedColor {
    r: number;
    g: number;
    b: number;
}

/**
 * WebGL renderer for ASCII characters with enhanced performance.
 * Uses instanced rendering and a texture atlas for efficient GPU-based text rendering.
 * @category Rendering
 */
export class WebGLRenderer implements Renderer {
    private _gl!: WebGL2RenderingContext;
    private _canvas!: HTMLCanvasElement;
    private _program!: WebGLProgram;
    private _options!: ASCIIRendererOptions;
    private _isInitialized = false;

    private _atlas: TextureAtlas = new TextureAtlas();
    private _vao: WebGLVertexArrayObject | null = null;
    private _quadVBO: WebGLBuffer | null = null;
    private _instanceVBO: WebGLBuffer | null = null;
    private _instanceBuffer: Float32Array | null = null;
    private _instanceCapacity: number = 0;
    private _colorCache: Map<string, ParsedColor> = new Map();
    private _currentCharacters: string[] = [];
    private _currentFontSize: number = 0;
    private _currentFontFamily: string = '';

    private _uniformLocations: {
        resolution: WebGLUniformLocation | null;
        charSize: WebGLUniformLocation | null;
        atlas: WebGLUniformLocation | null;
    } = { resolution: null, charSize: null, atlas: null };

    private _attribLocations: {
        vertexPosition: number;
        instancePosition: number;
        instanceUV: number;
        instanceColor: number;
        instanceOpacity: number;
        instanceScale: number;
        instanceRotation: number;
    } = {
            vertexPosition: -1,
            instancePosition: -1,
            instanceUV: -1,
            instanceColor: -1,
            instanceOpacity: -1,
            instanceScale: -1,
            instanceRotation: -1,
        };

    public get options(): ASCIIRendererOptions {
        return this._options;
    }

    public set options(newOptions: ASCIIRendererOptions) {
        const oldOptions = this._options;
        this._options = newOptions;

        if (!this._isInitialized)
            return;

        if (oldOptions &&
            (oldOptions.fontSize !== newOptions.fontSize ||
             oldOptions.fontFamily !== newOptions.fontFamily)) 
            this._rebuildAtlas();
        
    }

    public initialize(canvas: HTMLCanvasElement, options: ASCIIRendererOptions): void {
        this._canvas = canvas;
        this._options = options;

        const gl = canvas.getContext('webgl2', { alpha: false, antialias: false });

        if (!gl)
            throw new Error('Could not get WebGL2 context from canvas.');

        this._gl = gl;
        this._setupWebGL();
        this._setupBuffers();
        this._isInitialized = true;
    }

    public clear(backgroundColor: string): void {
        if (!this._isInitialized)
            return;

        const gl = this._gl;
        const color = this._parseColor(backgroundColor);
        gl.clearColor(color.r, color.g, color.b, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    public render(characters: CharacterData[], region: RenderRegion): void {
        if (!this._isInitialized || characters.length === 0)
            return;

        const gl = this._gl;

        this._ensureAtlas(characters);
        this._ensureBufferCapacity(characters.length);

        if (!this._instanceBuffer)
            return;

        const defaultColor = this._parseColor(this._options.color);
        const colorMap = this._options.colorMap;

        for (let i = 0; i < characters.length; i++) {
            const char = characters[i];
            const uv = this._atlas.getUV(char.char);
            const charColor = char.color || colorMap[char.char];
            const color = charColor ? this._parseColor(charColor) : defaultColor;

            const offset = i * FLOATS_PER_INSTANCE;
            this._instanceBuffer[offset + 0] = char.x;
            this._instanceBuffer[offset + 1] = char.y;
            this._instanceBuffer[offset + 2] = uv.u0;
            this._instanceBuffer[offset + 3] = uv.v0;
            this._instanceBuffer[offset + 4] = uv.u1;
            this._instanceBuffer[offset + 5] = uv.v1;
            this._instanceBuffer[offset + 6] = color.r;
            this._instanceBuffer[offset + 7] = color.g;
            this._instanceBuffer[offset + 8] = color.b;
            this._instanceBuffer[offset + 9] = char.opacity ?? 1.0;
            this._instanceBuffer[offset + 10] = char.scale ?? 1.0;
            this._instanceBuffer[offset + 11] = char.rotation ?? 0.0;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this._instanceVBO);
        gl.bufferSubData(
            gl.ARRAY_BUFFER,
            0,
            this._instanceBuffer.subarray(0, characters.length * FLOATS_PER_INSTANCE)
        );

        gl.useProgram(this._program);
        gl.uniform2f(this._uniformLocations.resolution, region.canvasWidth, region.canvasHeight);

        const cellSize = this._atlas.getCellSize();
        gl.uniform2f(this._uniformLocations.charSize, cellSize.width, cellSize.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this._atlas.getTexture());
        gl.uniform1i(this._uniformLocations.atlas, 0);

        gl.bindVertexArray(this._vao);
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, characters.length);
        gl.bindVertexArray(null);
    }

    public resize(width: number, height: number): void {
        if (!this._isInitialized)
            return;

        this._canvas.width = width;
        this._canvas.height = height;
        this._gl.viewport(0, 0, width, height);
    }

    public destroy(): void {
        if (!this._isInitialized)
            return;

        const gl = this._gl;

        this._atlas.destroy(gl);

        if (this._vao)
            gl.deleteVertexArray(this._vao);

        if (this._quadVBO)
            gl.deleteBuffer(this._quadVBO);

        if (this._instanceVBO)
            gl.deleteBuffer(this._instanceVBO);

        if (this._program)
            gl.deleteProgram(this._program);

        this._vao = null;
        this._quadVBO = null;
        this._instanceVBO = null;
        this._instanceBuffer = null;
        this._colorCache.clear();
        this._isInitialized = false;
    }

    private _setupWebGL(): void {
        const gl = this._gl;

        const vertexShaderSource = `#version 300 es
            precision highp float;

            // Static quad geometry (0,0 to 1,1)
            in vec2 a_vertexPosition;

            // Per-instance data
            in vec2 a_instancePosition;
            in vec4 a_instanceUV;
            in vec3 a_instanceColor;
            in float a_instanceOpacity;
            in float a_instanceScale;
            in float a_instanceRotation;

            uniform vec2 u_resolution;
            uniform vec2 u_charSize;

            out vec2 v_texCoord;
            out vec3 v_color;
            out float v_opacity;

            void main() {
                // Calculate UV for this vertex
                v_texCoord = mix(a_instanceUV.xy, a_instanceUV.zw, a_vertexPosition);
                v_color = a_instanceColor;
                v_opacity = a_instanceOpacity;

                // Apply scale and rotation around character center
                vec2 centered = (a_vertexPosition - 0.5) * u_charSize * a_instanceScale;

                float cosR = cos(a_instanceRotation);
                float sinR = sin(a_instanceRotation);
                vec2 rotated = vec2(
                    centered.x * cosR - centered.y * sinR,
                    centered.x * sinR + centered.y * cosR
                );

                // Position with center offset
                vec2 position = a_instancePosition + rotated + u_charSize * 0.5;

                // Convert to clip space (flip Y for canvas coordinates)
                vec2 clipSpace = ((position / u_resolution) * 2.0 - 1.0) * vec2(1, -1);
                gl_Position = vec4(clipSpace, 0.0, 1.0);
            }
        `;

        const fragmentShaderSource = `#version 300 es
            precision highp float;

            in vec2 v_texCoord;
            in vec3 v_color;
            in float v_opacity;

            uniform sampler2D u_atlas;

            out vec4 fragColor;

            void main() {
                vec4 texColor = texture(u_atlas, v_texCoord);
                // Use the red channel as alpha (text is rendered as white on transparent)
                float alpha = max(texColor.r, max(texColor.g, texColor.b));
                fragColor = vec4(v_color, alpha * v_opacity);
            }
        `;

        const vertexShader = this._createShader(gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this._createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

        this._program = gl.createProgram()!;
        gl.attachShader(this._program, vertexShader);
        gl.attachShader(this._program, fragmentShader);
        gl.linkProgram(this._program);

        if (!gl.getProgramParameter(this._program, gl.LINK_STATUS))
            throw new Error('Failed to link WebGL program: ' + gl.getProgramInfoLog(this._program));

        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);

        this._uniformLocations.resolution = gl.getUniformLocation(this._program, 'u_resolution');
        this._uniformLocations.charSize = gl.getUniformLocation(this._program, 'u_charSize');
        this._uniformLocations.atlas = gl.getUniformLocation(this._program, 'u_atlas');

        this._attribLocations.vertexPosition = gl.getAttribLocation(this._program, 'a_vertexPosition');
        this._attribLocations.instancePosition = gl.getAttribLocation(this._program, 'a_instancePosition');
        this._attribLocations.instanceUV = gl.getAttribLocation(this._program, 'a_instanceUV');
        this._attribLocations.instanceColor = gl.getAttribLocation(this._program, 'a_instanceColor');
        this._attribLocations.instanceOpacity = gl.getAttribLocation(this._program, 'a_instanceOpacity');
        this._attribLocations.instanceScale = gl.getAttribLocation(this._program, 'a_instanceScale');
        this._attribLocations.instanceRotation = gl.getAttribLocation(this._program, 'a_instanceRotation');

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }

    private _setupBuffers(): void {
        const gl = this._gl;

        this._vao = gl.createVertexArray();
        gl.bindVertexArray(this._vao);

        this._quadVBO = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this._quadVBO);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0, 0,
            1, 0,
            0, 1,
            1, 1
        ]), gl.STATIC_DRAW);

        gl.enableVertexAttribArray(this._attribLocations.vertexPosition);
        gl.vertexAttribPointer(this._attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);

        this._instanceVBO = gl.createBuffer();
        this._ensureBufferCapacity(INITIAL_INSTANCE_CAPACITY);

        gl.bindVertexArray(null);
    }

    private _ensureBufferCapacity(requiredCount: number): void {
        if (this._instanceCapacity >= requiredCount && this._instanceBuffer)
            return;

        const gl = this._gl;
        const newCapacity = Math.max(requiredCount, this._instanceCapacity * 2, INITIAL_INSTANCE_CAPACITY);
        this._instanceBuffer = new Float32Array(newCapacity * FLOATS_PER_INSTANCE);
        this._instanceCapacity = newCapacity;

        gl.bindVertexArray(this._vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._instanceVBO);
        gl.bufferData(gl.ARRAY_BUFFER, this._instanceBuffer.byteLength, gl.DYNAMIC_DRAW);

        const stride = FLOATS_PER_INSTANCE * Float32Array.BYTES_PER_ELEMENT;

        gl.enableVertexAttribArray(this._attribLocations.instancePosition);
        gl.vertexAttribPointer(this._attribLocations.instancePosition, 2, gl.FLOAT, false, stride, 0);
        gl.vertexAttribDivisor(this._attribLocations.instancePosition, 1);

        gl.enableVertexAttribArray(this._attribLocations.instanceUV);
        gl.vertexAttribPointer(this._attribLocations.instanceUV, 4, gl.FLOAT, false, stride, 2 * 4);
        gl.vertexAttribDivisor(this._attribLocations.instanceUV, 1);

        gl.enableVertexAttribArray(this._attribLocations.instanceColor);
        gl.vertexAttribPointer(this._attribLocations.instanceColor, 3, gl.FLOAT, false, stride, 6 * 4);
        gl.vertexAttribDivisor(this._attribLocations.instanceColor, 1);

        gl.enableVertexAttribArray(this._attribLocations.instanceOpacity);
        gl.vertexAttribPointer(this._attribLocations.instanceOpacity, 1, gl.FLOAT, false, stride, 9 * 4);
        gl.vertexAttribDivisor(this._attribLocations.instanceOpacity, 1);

        gl.enableVertexAttribArray(this._attribLocations.instanceScale);
        gl.vertexAttribPointer(this._attribLocations.instanceScale, 1, gl.FLOAT, false, stride, 10 * 4);
        gl.vertexAttribDivisor(this._attribLocations.instanceScale, 1);

        gl.enableVertexAttribArray(this._attribLocations.instanceRotation);
        gl.vertexAttribPointer(this._attribLocations.instanceRotation, 1, gl.FLOAT, false, stride, 11 * 4);
        gl.vertexAttribDivisor(this._attribLocations.instanceRotation, 1);

        gl.bindVertexArray(null);
    }

    private _ensureAtlas(characters: CharacterData[]): void {
        const fontSize = this._options.fontSize;
        const fontFamily = this._options.fontFamily;
        const charSet = new Set<string>();

        for (const char of characters)
            charSet.add(char.char);

        for (const char of Object.keys(this._options.colorMap))
            charSet.add(char);

        const chars = Array.from(charSet);
        const charsChanged = chars.length !== this._currentCharacters.length ||
            chars.some(c => !this._currentCharacters.includes(c));
        const fontChanged = fontSize !== this._currentFontSize || fontFamily !== this._currentFontFamily;

        if (charsChanged || fontChanged) {
            this._atlas.generate(this._gl, chars, fontSize, fontFamily);
            this._currentCharacters = chars;
            this._currentFontSize = fontSize;
            this._currentFontFamily = fontFamily;
        }
    }

    private _rebuildAtlas(): void {
        if (this._currentCharacters.length > 0) {
            this._atlas.generate(
                this._gl,
                this._currentCharacters,
                this._options.fontSize,
                this._options.fontFamily
            );
            this._currentFontSize = this._options.fontSize;
            this._currentFontFamily = this._options.fontFamily;
        }
    }

    private _parseColor(color: string): ParsedColor {
        const cached = this._colorCache.get(color);

        if (cached)
            return cached;

        let hex = color.replace('#', '');

        if (hex.length === 3 || hex.length === 4)
            hex = hex.split('').map(c => c + c).join('');

        const result: ParsedColor = {
            r: parseInt(hex.substring(0, 2), 16) / 255,
            g: parseInt(hex.substring(2, 4), 16) / 255,
            b: parseInt(hex.substring(4, 6), 16) / 255,
        };

        this._colorCache.set(color, result);
        return result;
    }

    private _createShader(type: number, source: string): WebGLShader {
        const gl = this._gl;
        const shader = gl.createShader(type)!;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const error = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error(`Failed to compile shader: ${error}`);
        }

        return shader;
    }
}

/**
 * Factory function to create appropriate renderer based on preference.
 */
export const createRenderer = (rendererType: '2D' | 'WebGL'): Renderer => {
    switch (rendererType) {
        case 'WebGL':
            if (typeof WebGL2RenderingContext !== 'undefined') {
                try {
                    return new WebGLRenderer();
                } catch (error) {
                    console.warn('WebGL renderer failed, falling back to 2D canvas:', error);
                    return new Canvas2DRenderer();
                }
            } else {
                console.warn('WebGL2 not supported, falling back to 2D canvas.');
                return new Canvas2DRenderer();
            }
        case '2D':
            return new Canvas2DRenderer();
        default:
            throw new Error('Unknown renderer type given!');
    }
};
