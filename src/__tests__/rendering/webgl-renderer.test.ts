import { afterEach, describe, expect, it, vi } from 'vitest';
import { createWebGLFixture, readGlyphInstance, renderRegion, webglOptions } from './helpers/webgl-fixture';

afterEach(() => vi.restoreAllMocks());

describe('WebGLRenderer', () => {
    it('batches visible glyphs with color precedence, CSS alpha, and transforms about character centers', () => {
        const { renderer, initialize, gl, uploads, glyphContext } = createWebGLFixture();
        initialize();

        renderer.render([
            { x: -1, y: 0, char: 'outside' },
            { x: 100, y: 0, char: 'outside' },
            { x: 0, y: -1, char: 'outside' },
            { x: 0, y: 160, char: 'outside' },
            { x: 10, y: 20, char: 'A' },
            { x: 20, y: 20, char: 'A', color: 'rgba(255, 0, 0, 0.5)', opacity: 0.5, scale: 2,
                rotation: Math.PI / 2 },
            { x: 30, y: 20, char: 'B' }
        ], renderRegion);

        expect(gl.drawArraysInstanced).toHaveBeenCalledExactlyOnceWith(gl.TRIANGLES, 0, 6, 3);
        expect(glyphContext.fillText).toHaveBeenCalledTimes(2);
        expect(glyphContext.fillText).toHaveBeenCalledWith('A', 3, -2);
        const mappedGlyph = readGlyphInstance(uploads[0], 0);
        const transformedGlyph = readGlyphInstance(uploads[0], 1);
        const defaultGlyph = readGlyphInstance(uploads[0], 2);

        expect(mappedGlyph).toMatchObject({
            rect: [7, 22, 14, 14], color: [0, 1, 0], opacity: 1,
            center: [15, 28], rotationScale: [1, 0],
        });

        expect(transformedGlyph.color).toEqual([1, 0, 0]);
        expect(transformedGlyph.opacity).toBeCloseTo(128 / 255 * 0.5);
        expect(transformedGlyph.center).toEqual([25, 28]);
        expect(transformedGlyph.rotationScale[0]).toBeCloseTo(0);
        expect(transformedGlyph.rotationScale[1]).toBe(2);
        expect(defaultGlyph).toMatchObject({ color: [1, 1, 1], opacity: 1 });

        expect(gl.blendFuncSeparate).toHaveBeenCalledWith(
            gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA
        );
    });

    it('toggles pattern opacity while retaining CSS color alpha and cached glyphs', () => {
        const { renderer, initialize, gl, uploads } = createWebGLFixture();
        initialize();

        const characters = [{ x: 10, y: 20, char: 'A', color: 'rgba(255, 0, 0, 0.5)', opacity: 0.25 }];
        renderer.render(characters, renderRegion);
        renderer.options = { ...webglOptions, enableOpacity: false };
        renderer.render(characters, renderRegion);
        renderer.options = { ...webglOptions, enableOpacity: true };
        renderer.render(characters, renderRegion);

        expect(readGlyphInstance(uploads[0]).opacity).toBeCloseTo(128 / 255 * 0.25);
        expect(readGlyphInstance(uploads[1]).opacity).toBeCloseTo(128 / 255);
        expect(readGlyphInstance(uploads[2]).opacity).toBeCloseTo(128 / 255 * 0.25);
        expect(gl.texSubImage2D).toHaveBeenCalledTimes(1);
        expect(characters[0].opacity).toBe(0.25);
    });

    it('reuses glyphs across frames and colors, and rebuilds them only for font changes', () => {
        const { renderer, initialize, gl, glyphContext, colorContext } = createWebGLFixture();
        initialize();

        const characters = [{ x: 0, y: 0, char: 'B' }];
        renderer.render(characters, renderRegion);
        renderer.render(characters, renderRegion);
        expect(gl.texSubImage2D).toHaveBeenCalledTimes(1);
        expect(colorContext.getImageData).toHaveBeenCalledTimes(1);
        renderer.options = { ...webglOptions, color: 'rebeccapurple' };
        renderer.render(characters, renderRegion);
        expect(gl.texSubImage2D).toHaveBeenCalledTimes(1);
        renderer.options = { ...webglOptions, fontSize: 24, fontFamily: 'serif' };
        expect(gl.deleteTexture).toHaveBeenCalledTimes(1);
        renderer.clear('#1234');
        renderer.render(characters, renderRegion);
        expect(gl.texSubImage2D).toHaveBeenCalledTimes(2);
        expect(glyphContext.font).toBe('24px serif');
        expect(renderer.options.fontSize).toBe(24);
    });

    it('clips partial regions in framebuffer coordinates and updates dimensions on resize', () => {
        const { renderer, initialize, canvas, gl } = createWebGLFixture();
        initialize();

        renderer.render([{ x: 20, y: 32, char: 'A' }], {
            ...renderRegion, startColumn: 2, endColumn: 8, startRow: 2, endRow: 8,
        });

        expect(gl.scissor).toHaveBeenCalledWith(20, 32, 60, 96);
        expect(gl.disable).toHaveBeenLastCalledWith(gl.SCISSOR_TEST);
        renderer.resize(200, 300);

        expect([canvas.width, canvas.height]).toEqual([200, 300]);
        expect(gl.viewport).toHaveBeenLastCalledWith(0, 0, 200, 300);
        renderer.render([{ x: 0, y: 0, char: 'A' }], renderRegion);
        expect(gl.uniform2f).toHaveBeenLastCalledWith({ name: 'u_resolution' }, 200, 300);
    });

    it('resets the framebuffer on repeated same-size resizes like assigning Canvas2D dimensions', () => {
        const { renderer, initialize, canvas, gl } = createWebGLFixture();
        initialize();
        renderer.clear('rebeccapurple');
        renderer.resize(canvas.width, canvas.height);
        expect(gl.clearColor).toHaveBeenLastCalledWith(0, 0, 0, 0);
        expect(gl.clear).toHaveBeenLastCalledWith(gl.COLOR_BUFFER_BIT);
        expect(gl.disable).toHaveBeenLastCalledWith(gl.SCISSOR_TEST);
        renderer.clear('#1234');
        renderer.resize(canvas.width, canvas.height);
        expect(gl.clearColor).toHaveBeenLastCalledWith(0, 0, 0, 0);
        expect(gl.clear).toHaveBeenCalledTimes(3);
    });

    it('preserves fractional clip bounds and covers their enclosing framebuffer pixels', () => {
        const { renderer, initialize, gl } = createWebGLFixture();
        initialize();

        renderer.render([{ x: 20, y: 32, char: 'A' }], {
            ...renderRegion, startColumn: 2.025, endColumn: 8.025, startRow: 2.046875, endRow: 8.046875,
        });

        expect(gl.scissor).toHaveBeenCalledWith(20, 31, 61, 97);
        expect(gl.uniform4f).toHaveBeenLastCalledWith({ name: 'u_clip' }, 20.25, 31.25, 80.25, 127.25);
        renderer.render([{ x: 0, y: 0, char: 'A' }], renderRegion);
        expect(gl.uniform4f).toHaveBeenLastCalledWith({ name: 'u_clip' }, 0, 0, 100, 160);
    });

    it('reports a lost WebGL context before clearing so the caller can fall back', () => {
        const { renderer, initialize, gl, colorContext } = createWebGLFixture();
        initialize();
        gl.isContextLost.mockReturnValue(true);
        expect(() => renderer.clear('white')).toThrow('WebGL context was lost');
        expect(gl.clear).not.toHaveBeenCalled();
        expect(colorContext.getImageData).not.toHaveBeenCalled();
        expect(() => renderer.destroy()).not.toThrow();
    });

    it('clears opaque CSS colors and blends translucent backgrounds without erasing preceding frames', () => {
        const { renderer, initialize, gl, uploads, getContext } = createWebGLFixture();
        initialize();
        expect(getContext).toHaveBeenCalledWith('webgl2', { alpha: true, preserveDrawingBuffer: true });
        renderer.clear('rebeccapurple');
        expect(gl.clearColor).toHaveBeenCalledWith(102 / 255, 51 / 255, 153 / 255, 1);
        expect(gl.clear).toHaveBeenCalledOnce();
        renderer.clear('#1234');
        expect(gl.clear).toHaveBeenCalledOnce();
        expect(gl.drawArraysInstanced).toHaveBeenCalledOnce();
        expect(readGlyphInstance(uploads[0]).rect).toEqual([0, 0, 100, 160]);
        expect(readGlyphInstance(uploads[0]).opacity).toBeCloseTo(68 / 255);
        renderer.clear('transparent');
        expect(gl.drawArraysInstanced).toHaveBeenCalledOnce();
    });

    it('pages large character sets while preserving painter order across textures', () => {
        const { renderer, initialize, gl } = createWebGLFixture(16);
        initialize();

        renderer.render([
            { x: 0, y: 0, char: 'A' },
            { x: 0, y: 0, char: 'B' },
            { x: 0, y: 0, char: 'A' }
        ], renderRegion);

        expect(gl.createTexture).toHaveBeenCalledTimes(2);
        expect(gl.drawArraysInstanced).toHaveBeenCalledTimes(3);

        const textures = gl.createTexture.mock.results.map(result => result.value as object);
        expect(gl.bindTexture).toHaveBeenLastCalledWith(gl.TEXTURE_2D, textures[0]);
        renderer.destroy();
        expect(gl.deleteTexture).toHaveBeenCalledWith(textures[0]);
        expect(gl.deleteTexture).toHaveBeenCalledWith(textures[1]);
    });

    it('splits large frames into bounded instance buffers', () => {
        const { renderer, initialize, gl, uploads } = createWebGLFixture();
        initialize();
        renderer.render(Array.from({ length: 4097 }, () => ({ x: 0, y: 0, char: 'A' })), renderRegion);
        expect(gl.drawArraysInstanced).toHaveBeenNthCalledWith(1, gl.TRIANGLES, 0, 6, 4096);
        expect(gl.drawArraysInstanced).toHaveBeenNthCalledWith(2, gl.TRIANGLES, 0, 6, 1);
        expect(uploads.map(upload => upload.length)).toEqual([4096 * 16, 16]);
    });

    it('releases all allocated resources once and makes calls after destruction harmless', () => {
        const { renderer, initialize, gl, glyphCanvas, colorCanvas, loseContext } = createWebGLFixture();
        initialize();

        renderer.destroy();
        renderer.destroy();
        renderer.clear('white');
        renderer.render([{ x: 0, y: 0, char: 'A' }], renderRegion);
        renderer.resize(10, 10);

        expect(gl.deleteShader).toHaveBeenCalledTimes(2);
        expect(gl.deleteProgram).toHaveBeenCalledOnce();
        expect(gl.deleteBuffer).toHaveBeenCalledOnce();
        expect(gl.deleteVertexArray).toHaveBeenCalledOnce();
        expect(gl.deleteTexture).toHaveBeenCalledOnce();
        expect(gl.getExtension).toHaveBeenCalledWith('WEBGL_lose_context');
        expect(loseContext).toHaveBeenCalledOnce();
        expect(gl.drawArraysInstanced).not.toHaveBeenCalled();
        expect([glyphCanvas.width, glyphCanvas.height, colorCanvas.width, colorCanvas.height]).toEqual([1, 1, 1, 1]);
    });

    it('releases both shaders when fragment compilation fails', () => {
        const { renderer, initialize, gl } = createWebGLFixture();
        gl.getShaderParameter.mockReturnValueOnce(true).mockReturnValueOnce(false);

        expect(initialize).toThrow('compile failure');
        expect(gl.deleteShader).toHaveBeenCalledTimes(2);

        renderer.destroy();
        expect(gl.deleteShader).toHaveBeenCalledTimes(2);
    });

    it('releases shaders and the program when linking fails', () => {
        const { renderer, initialize, gl } = createWebGLFixture();
        gl.getProgramParameter.mockReturnValueOnce(false);

        expect(initialize).toThrow('link failure');
        expect(gl.deleteShader).toHaveBeenCalledTimes(2);
        expect(gl.deleteProgram).toHaveBeenCalledWith(gl.createProgram.mock.results[0].value);

        renderer.destroy();
        expect(gl.deleteShader).toHaveBeenCalledTimes(2);
    });

    it('releases the program, buffers, and texture when atlas allocation fails', () => {
        const { renderer, initialize, gl } = createWebGLFixture();
        gl.texImage2D.mockImplementationOnce(() => { throw new Error('texture failure'); });

        expect(initialize).toThrow('texture failure');
        expect(gl.deleteShader).toHaveBeenCalledTimes(2);
        expect(gl.deleteProgram).toHaveBeenCalledWith(gl.createProgram.mock.results[0].value);
        expect(gl.deleteTexture).toHaveBeenCalledOnce();
        expect(gl.deleteBuffer).toHaveBeenCalledWith(gl.createBuffer.mock.results[0].value);
        expect(gl.deleteVertexArray).toHaveBeenCalledWith(gl.createVertexArray.mock.results[0].value);

        renderer.destroy();
        expect(gl.deleteShader).toHaveBeenCalledTimes(2);
    });
});
