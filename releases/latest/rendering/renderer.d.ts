import { ASCIIRendererOptions } from './ascii-renderer';
import { CharacterData, RenderRegion } from '../patterns/pattern';
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
export declare class Canvas2DRenderer implements Renderer {
    private _canvas;
    private _context;
    private _options;
    get options(): ASCIIRendererOptions;
    set options(options: ASCIIRendererOptions);
    initialize(canvas: HTMLCanvasElement, options: ASCIIRendererOptions): void;
    clear(backgroundColor: string): void;
    render(characters: CharacterData[], region: RenderRegion): void;
    resize(width: number, height: number): void;
    destroy(): void;
    private _setupContext;
}
/**
 * WebGL renderer for ASCII characters with enhanced performance.
 * @category Rendering
 */
export declare class WebGLRenderer implements Renderer {
    private _gl;
    private _canvas;
    private _program;
    private _options;
    private _isInitialized;
    get options(): ASCIIRendererOptions;
    set options(_options: ASCIIRendererOptions);
    initialize(canvas: HTMLCanvasElement): void;
    clear(backgroundColor: string): void;
    render(_characters: CharacterData[], _region: RenderRegion): void;
    resize(width: number, height: number): void;
    destroy(): void;
    private _setupWebGL;
    private _createShader;
}
/**
 * Factory function to create appropriate renderer based on preference.
 */
export declare const createRenderer: (rendererType: "2D" | "WebGL") => Renderer;
