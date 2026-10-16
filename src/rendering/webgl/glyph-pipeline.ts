import vertexShader from './glyph.vert.glsl?raw';
import fragmentShader from './glyph.frag.glsl?raw';
import type { AtlasPage } from './glyph-atlas';

export const INSTANCE_FLOATS = 16;
export const BATCH_SIZE = 4096;

/** Owns the shader program, instance buffer, and draw bindings. */
export class GlyphPipeline {
    public readonly instances = new Float32Array(BATCH_SIZE * INSTANCE_FLOATS);
    private _gl: WebGL2RenderingContext;
    private _canvas: HTMLCanvasElement;
    private _program: WebGLProgram | null = null;
    private _buffer: WebGLBuffer | null = null;
    private _vertexArray: WebGLVertexArrayObject | null = null;
    private _shaders: WebGLShader[] = [];
    private _resolution: WebGLUniformLocation | null = null;
    private _solid: WebGLUniformLocation | null = null;
    private _clip: WebGLUniformLocation | null = null;

    public constructor(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement) {
        this._gl = gl;
        this._canvas = canvas;
    }

    public destroy(): void {
        const gl = this._gl;
        this._shaders.forEach(shader => gl.deleteShader(shader));
        gl.deleteBuffer(this._buffer);
        gl.deleteVertexArray(this._vertexArray);
        gl.deleteProgram(this._program);
        this._buffer = this._vertexArray = this._program = null;
        this._resolution = this._solid = this._clip = null;
        this._shaders = [];
    }

    public setClip(left: number, bottom: number, right: number, top: number): void {
        this._gl.uniform4f(this._clip, left, bottom, right, top);
    }

    public initialize(): void {
        const gl = this._gl;
        const vertex = this._createShader(gl.VERTEX_SHADER, vertexShader);
        const fragment = this._createShader(gl.FRAGMENT_SHADER, fragmentShader);
        this._program = gl.createProgram();

        if (!this._program)
            throw new Error('Could not create WebGL program.');

        gl.attachShader(this._program, vertex);
        gl.attachShader(this._program, fragment);
        gl.linkProgram(this._program);

        if (!gl.getProgramParameter(this._program, gl.LINK_STATUS))
            throw new Error('Failed to link WebGL program: ' + gl.getProgramInfoLog(this._program));

        this._shaders.forEach(shader => gl.deleteShader(shader));
        this._shaders = [];
        this._buffer = gl.createBuffer();
        this._vertexArray = gl.createVertexArray();

        if (!this._buffer || !this._vertexArray)
            throw new Error('Could not create WebGL character buffers.');

        gl.bindVertexArray(this._vertexArray);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.instances.byteLength, gl.DYNAMIC_DRAW);

        for (const [index, name] of ['a_rect', 'a_uv', 'a_color', 'a_transform'].entries()) {
            const location = gl.getAttribLocation(this._program, name);
            gl.enableVertexAttribArray(location);
            gl.vertexAttribPointer(location, 4, gl.FLOAT, false, INSTANCE_FLOATS * 4, index * 16);
            gl.vertexAttribDivisor(location, 1);
        }

        this._resolution = gl.getUniformLocation(this._program, 'u_resolution');
        this._solid = gl.getUniformLocation(this._program, 'u_solid');
        this._clip = gl.getUniformLocation(this._program, 'u_clip');
        gl.useProgram(this._program);
        gl.uniform1i(gl.getUniformLocation(this._program, 'u_texture'), 0);
        gl.enable(gl.BLEND);
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.activeTexture(gl.TEXTURE0);
        gl.viewport(0, 0, this._canvas.width, this._canvas.height);
    }

    public prepareDraw(solid: boolean): void {
        const gl = this._gl;
        gl.useProgram(this._program);
        gl.bindVertexArray(this._vertexArray);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._buffer);
        gl.uniform2f(this._resolution, this._canvas.width, this._canvas.height);
        gl.uniform1i(this._solid, solid ? 1 : 0);
        gl.uniform4f(this._clip, 0, 0, this._canvas.width, this._canvas.height);
    }

    public drawBatch(page: AtlasPage, count: number): void {
        if (count === 0)
            return;

        const gl = this._gl;
        gl.bindTexture(gl.TEXTURE_2D, page.texture);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.instances.subarray(0, count * INSTANCE_FLOATS));
        gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, count);
    }

    private _createShader(type: number, source: string): WebGLShader {
        const gl = this._gl;
        const shader = gl.createShader(type);

        if (!shader)
            throw new Error('Could not create WebGL shader.');

        this._shaders.push(shader);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
            throw new Error('Failed to compile WebGL shader: ' + gl.getShaderInfoLog(shader));

        return shader;
    }
}
