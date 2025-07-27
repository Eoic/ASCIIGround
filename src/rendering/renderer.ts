import type { ASCIIRendererOptions } from './ascii-renderer';
import type { CharacterData, RenderRegion } from '../patterns/pattern';

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

        for (const char of characters) {
            if (char.x < 0 || char.x >= region.canvasWidth || 
                char.y < 0 || char.y >= region.canvasHeight) 
                continue;

            if (char.opacity !== undefined) 
                this._context.globalAlpha = char.opacity;

            if (char.color) 
                this._context.fillStyle = char.color;
            
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

            if (char.opacity !== undefined) 
                this._context.globalAlpha = 1;

            if (char.color) 
                this._context.fillStyle = this._options.color;
        }

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

/**
 * WebGL renderer for ASCII characters with enhanced performance.
 * @category Rendering
 */
export class WebGLRenderer implements Renderer {
    private _gl!: WebGL2RenderingContext;
    private _canvas!: HTMLCanvasElement;
    private _program!: WebGLProgram;
    private _options!: ASCIIRendererOptions;
    private _isInitialized = false;

    public get options(): ASCIIRendererOptions {
        return this._options;
    }

    public set options(_options: ASCIIRendererOptions) {
        this._options = _options;
    }

    public initialize(canvas: HTMLCanvasElement): void {
        this._canvas = canvas;
        const gl = canvas.getContext('webgl2');

        if (!gl) 
            throw new Error('Could not get WebGL2 context from canvas.');

        this._gl = gl;
        this._setupWebGL();
        this._isInitialized = true;
    }

    public clear(backgroundColor: string): void {
        if (!this._isInitialized)
            return;

        const gl = this._gl;
        const hex = backgroundColor.replace('#', '');
        const red = parseInt(hex.substring(0, 2), 16) / 255;
        const green = parseInt(hex.substring(2, 4), 16) / 255;
        const blue = parseInt(hex.substring(4, 6), 16) / 255;

        gl.clearColor(red, green, blue, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    public render(_characters: CharacterData[], _region: RenderRegion): void {
        if (!this._isInitialized)
            return;

        // TODO:
        // 1. Create texture atlas for characters.
        // 2. Use instanced rendering for better performance.
        // 3. Implement proper batching.
        console.warn('WebGL renderer is not implemented, falling back to 2D canvas');
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

        if (this._program) 
            gl.deleteProgram(this._program);

        this._isInitialized = false;
    }

    private _setupWebGL(): void {
        const gl = this._gl;

        const vertexShaderSource = `#version 300 es
            precision mediump float;
            
            in vec2 a_position;
            in vec2 a_texCoord;
            in float a_opacity;
            
            uniform vec2 u_resolution;
            uniform mat3 u_transform;
            
            out vec2 v_texCoord;
            out float v_opacity;
            
            void main() {
                vec3 position = u_transform * vec3(a_position, 1.0);
                vec2 clipSpace = ((position.xy / u_resolution) * 2.0 - 1.0) * vec2(1, -1);
                gl_Position = vec4(clipSpace, 0, 1);
                v_texCoord = a_texCoord;
                v_opacity = a_opacity;
            }
        `;

        const fragmentShaderSource = `#version 300 es
            precision mediump float;
            
            in vec2 v_texCoord;
            in float v_opacity;
            
            uniform sampler2D u_texture;
            uniform vec3 u_color;
            
            out vec4 fragColor;
            
            void main() {
                float alpha = texture(u_texture, v_texCoord).r;
                fragColor = vec4(u_color, alpha * v_opacity);
            }
        `;

        // Create and compile shaders
        const vertexShader = this._createShader(gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this._createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

        // Create program
        this._program = gl.createProgram()!;
        gl.attachShader(this._program, vertexShader);
        gl.attachShader(this._program, fragmentShader);
        gl.linkProgram(this._program);

        if (!gl.getProgramParameter(this._program, gl.LINK_STATUS)) 
            throw new Error('Failed to link WebGL program: ' + gl.getProgramInfoLog(this._program));

        // Enable blending for transparency
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
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
