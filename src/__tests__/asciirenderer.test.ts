import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ASCIIRenderer } from '../rendering/ascii-renderer';
import { createRenderer } from '../rendering/renderer';
import { DummyPattern } from '../patterns/dummy-pattern';
import { PerlinNoisePattern } from '../patterns/perlin-noise-pattern';
import { RainPattern } from '../patterns/rain-pattern';
import { StaticNoisePattern } from '../patterns/static-noise-pattern';

const mockRequestAnimationFrame = vi.fn();
const mockCancelAnimationFrame = vi.fn();

Object.assign(globalThis, {
    requestAnimationFrame: mockRequestAnimationFrame,
    cancelAnimationFrame: mockCancelAnimationFrame,
    performance: {
        now: vi.fn(() => 1000),
    },
});

describe('ASCIIRenderer', () => {
    let canvas: HTMLCanvasElement;
    let mockContext: Partial<CanvasRenderingContext2D>;
    let pattern: DummyPattern;

    beforeEach(() => {
        vi.clearAllMocks();

        mockRequestAnimationFrame.mockImplementation((_callback: FrameRequestCallback) => {
            // Store the callback but don't execute it immediately to avoid infinite loops
            // Tests can manually call the callback if needed
            return 123;
        });

        canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;

        // Get the mock context that's already set up by the global mock
        mockContext = canvas.getContext('2d') as Partial<CanvasRenderingContext2D>;
        pattern = new DummyPattern();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('constructor', () => {
        it('should create ASCIIRenderer instance with default options', () => {
            const renderer = new ASCIIRenderer({ canvas, pattern });
            
            expect(renderer).toBeInstanceOf(ASCIIRenderer);
            expect(renderer.pattern).toBe(pattern);
        });

        it('should create ASCIIRenderer instance with custom options', () => {
            const options = {
                fontSize: 16,
                color: '#ff0000',
                backgroundColor: '#ffffff',
                fontFamily: 'courier',
            };
            
            const renderer = new ASCIIRenderer({ canvas, pattern, options });
            
            expect(renderer).toBeInstanceOf(ASCIIRenderer);
            expect(mockContext.font).toBe('16px courier');
        });

        it('should throw error if canvas context is not available', () => {
            vi.spyOn(canvas, 'getContext').mockReturnValue(null);
            
            expect(() => new ASCIIRenderer({ canvas, pattern })).toThrow('Could not get 2D context from canvas');
        });
    });

    describe('pattern management', () => {
        it('should set and get pattern', () => {
            const renderer = new ASCIIRenderer({ canvas, pattern });
            const newPattern = new PerlinNoisePattern();
            
            renderer.pattern = newPattern;
            expect(renderer.pattern).toBe(newPattern);
        });

        it('should initialize pattern when set', () => {
            const renderer = new ASCIIRenderer({ canvas, pattern });
            const newPattern = new PerlinNoisePattern();
            const initializeSpy = vi.spyOn(newPattern, 'initialize');
            
            renderer.pattern = newPattern;
            expect(initializeSpy).toHaveBeenCalled();
        });
    });

    describe('animation control', () => {
        it('should start animation', () => {
            const renderer = new ASCIIRenderer({ canvas, pattern });
            
            renderer.startAnimation();
            expect(mockRequestAnimationFrame).toHaveBeenCalled();
        });

        it('should stop animation', () => {
            const renderer = new ASCIIRenderer({ canvas, pattern });
            
            renderer.startAnimation();
            renderer.stopAnimation();
            expect(mockCancelAnimationFrame).toHaveBeenCalledWith(123);
        });

        it('should not start animation if already running', () => {
            const renderer = new ASCIIRenderer({ canvas, pattern });
            
            renderer.startAnimation();
            mockRequestAnimationFrame.mockClear();
            
            expect(() => renderer.startAnimation()).toThrow('Animation is already running');
        });

        it('should handle multiple stop calls gracefully', () => {
            const renderer = new ASCIIRenderer({ canvas, pattern });
            
            renderer.startAnimation();
            renderer.stopAnimation();
            
            expect(() => renderer.stopAnimation()).not.toThrow();
        });
    });

    describe('options management', () => {
        it('should update options', () => {
            const renderer = new ASCIIRenderer({ canvas, pattern });
            
            renderer.setOptions({
                fontSize: 20,
                color: '#00ff00',
            });
            
            expect(mockContext.font).toContain('20px');
        });

        it('should handle padding option', () => {
            const renderer = new ASCIIRenderer({ canvas, pattern, options: { padding: 10 } });
            expect(renderer).toBeInstanceOf(ASCIIRenderer);
        });

        it('should handle custom character spacing', () => {
            const renderer = new ASCIIRenderer({
                canvas,
                pattern,
                options: {
                    charSpacingX: 15,
                    charSpacingY: 20,
                },
            });

            expect(renderer).toBeInstanceOf(ASCIIRenderer);
        });
    });

    describe('resize functionality', () => {
        it('should resize canvas', () => {
            const renderer = new ASCIIRenderer({ canvas, pattern });
            renderer.resize();
            expect(canvas.width).toBeGreaterThan(0);
            expect(canvas.height).toBeGreaterThan(0);
            expect(canvas.width).toBe(1024);
            expect(canvas.height).toBe(768);
        });

        it('should recalculate grid on resize', () => {
            const renderer = new ASCIIRenderer({ canvas, pattern });
            const initializeSpy = vi.spyOn(pattern, 'initialize');
            
            canvas.width = 1200;
            canvas.height = 900;
            renderer.resize();
            
            expect(initializeSpy).toHaveBeenCalled();
        });
    });

    describe('mouse interaction', () => {
        it('should handle mouse events when enabled', () => {
            new ASCIIRenderer({canvas, pattern, options: { enableMouseInteraction: true }});

            const mouseEvent = new MouseEvent('mousemove', {
                clientX: 100,
                clientY: 200,
            });
            
            expect(() => {
                canvas.dispatchEvent(mouseEvent);
            }).not.toThrow();
        });

        it('should not add mouse listeners when disabled', () => {
            const addEventListenerSpy = vi.spyOn(canvas, 'addEventListener');
            new ASCIIRenderer({ canvas, pattern, options: { enableMouseInteraction: false } });
            expect(addEventListenerSpy).not.toHaveBeenCalledWith('mousemove', expect.any(Function));
        });
    });

    describe('pattern types support', () => {
        it('should work with PerlinNoisePattern', () => {
            const perlinPattern = new PerlinNoisePattern();
            
            expect(() => {
                new ASCIIRenderer({canvas, pattern: perlinPattern });
            }).not.toThrow();
        });

        it('should work with RainPattern', () => {
            const rainPattern = new RainPattern();

            expect(() => {
                new ASCIIRenderer({ canvas, pattern: rainPattern });
            }).not.toThrow();
        });

        it('should work with StaticNoisePattern', () => {
            const staticPattern = new StaticNoisePattern();
            
            expect(() => {
                new ASCIIRenderer({ canvas, pattern: staticPattern });
            }).not.toThrow();
        });
    });

    describe('rendering', () => {
        it('should render frame without errors', () => {
            const renderer = new ASCIIRenderer({ canvas, pattern });
            
            expect(() => {
                renderer.render();
            }).not.toThrow();
            
            expect(mockContext.fillRect).toHaveBeenCalled();
        });

        it('should handle different font sizes', () => {
            const fontSizes = [8, 12, 16, 24, 32];
            
            fontSizes.forEach(fontSize => {
                new ASCIIRenderer({ canvas, pattern, options: { fontSize }});
                expect(mockContext.font).toContain(`${fontSize}px`);
            });
        });

        it('should handle different colors', () => {
            const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffffff'];
            colors.forEach((color) => new ASCIIRenderer({ canvas, pattern, options: { color } }));
        });
    });

    describe('destruction', () => {
        it('should clean up resources on destroy', () => {
            const renderer = new ASCIIRenderer({
                canvas,
                pattern,
                options: { enableMouseInteraction: true },
            });

            renderer.startAnimation();

            expect(() => {
                renderer.destroy();
            }).not.toThrow();
            
            expect(mockCancelAnimationFrame).toHaveBeenCalled();
        });

        it('should remove event listeners on destroy', () => {
            const removeEventListenerSpy = vi.spyOn(canvas, 'removeEventListener');
            
            const renderer = new ASCIIRenderer({
                canvas,
                pattern, 
                options: { enableMouseInteraction: true },
            });

            renderer.destroy();

            expect(removeEventListenerSpy).toHaveBeenCalled();
        });
    });

    describe('renderer types', () => {
        it('should handle 2D renderer type', () => {
            const renderer = new ASCIIRenderer({ canvas, pattern, options: { rendererType: '2D' } });
            expect(renderer).toBeInstanceOf(ASCIIRenderer);
        });

        it('should handle WebGL renderer type', () => {
            const renderer = new ASCIIRenderer({ canvas, pattern, options: { rendererType: 'WebGL' } });
            expect(renderer).toBeInstanceOf(ASCIIRenderer);
        });
    });

    describe('animation speed', () => {
        it('should handle different animation speeds', () => {
            const speeds = [0.5, 1.0, 2.0, 5.0];

            speeds.forEach(animationSpeed => {
                const renderer = new ASCIIRenderer({ canvas, pattern, options: { animationSpeed } });
                expect(renderer).toBeInstanceOf(ASCIIRenderer);
            });
        });
    });

    describe('edge cases', () => {
        it('should handle very small canvas', () => {
            canvas.width = 10;
            canvas.height = 10;

            const renderer = new ASCIIRenderer({ canvas, pattern });
            expect(renderer).toBeInstanceOf(ASCIIRenderer);
        });

        it('should handle very large canvas', () => {
            canvas.width = 4000;
            canvas.height = 3000;
            
            const renderer = new ASCIIRenderer({ canvas, pattern });
            expect(renderer).toBeInstanceOf(ASCIIRenderer);
        });

        it('should handle zero padding', () => {
            const renderer = new ASCIIRenderer({ canvas, pattern, options: { padding: 0 } });
            expect(renderer).toBeInstanceOf(ASCIIRenderer);
        });

        it('should handle large padding', () => {
            const renderer = new ASCIIRenderer({ canvas, pattern, options: { padding: 10000 } });
            expect(renderer).toBeInstanceOf(ASCIIRenderer);
        });
    });

    describe('character transformations', () => {
        it('should handle character with opacity', () => {
            const renderer = new ASCIIRenderer({ canvas, pattern });
            
            // Test using public render method with pattern that generates characters with opacity
            pattern.generate = vi.fn(() => [
                { x: 10, y: 20, char: 'A', opacity: 0.5 }
            ]);
            
            expect(() => {
                renderer.render();
            }).not.toThrow();
        });

        it('should handle character with color', () => {
            const renderer = new ASCIIRenderer({ canvas, pattern });
            
            pattern.generate = vi.fn(() => [
                { x: 10, y: 20, char: 'A', color: '#ff0000' }
            ]);
            
            expect(() => {
                renderer.render();
            }).not.toThrow();
        });

        it('should handle character transformations', () => {
            const renderer = new ASCIIRenderer({ canvas, pattern });
            
            pattern.generate = vi.fn(() => [
                { x: 10, y: 20, char: 'A', scale: 1.5, rotation: Math.PI / 4 }
            ]);
            
            expect(() => {
                renderer.render();
            }).not.toThrow();
        });

        it('should handle out of bounds characters', () => {
            const renderer = new ASCIIRenderer({ canvas, pattern });
            
            pattern.generate = vi.fn(() => [
                { x: -10, y: 20, char: 'A' }, // Outside bounds
                { x: 1000, y: 20, char: 'B' } // Outside bounds
            ]);
            
            expect(() => {
                renderer.render();
            }).not.toThrow();
        });
    });

    describe('renderer creation', () => {
        it('should create Canvas2D renderer by default', () => {
            const renderer = createRenderer('2D');
            expect(renderer).toBeDefined();
        });

        it('should fallback to Canvas2D when WebGL fails', () => {
            const renderer = createRenderer('WebGL');
            expect(renderer).toBeDefined();
        });

        it('should throw error for unknown renderer type', () => {
            expect(() => {
                // @ts-expect-error Testing invalid input.
                createRenderer('unknown');
            }).toThrow('Unknown renderer type given!');
        });
    });

    describe('info getters', () => {
        it('should provide render info with FPS and dimensions', () => {
            const renderer = new ASCIIRenderer({ canvas, pattern });
            const renderInfo = renderer.renderInfo;
            
            expect(renderInfo).toBeDefined();
            expect(typeof renderInfo.fps).toBe('number');
            expect(typeof renderInfo.rows).toBe('number');
            expect(typeof renderInfo.columns).toBe('number');
            expect(typeof renderInfo.frameCount).toBe('number');
        });

        it('should provide mouse info with position and click state', () => {
            const renderer = new ASCIIRenderer({ canvas, pattern });
            const mouseInfo = renderer.mouseInfo;
            
            expect(mouseInfo).toBeDefined();
            expect(typeof mouseInfo.x).toBe('number');
            expect(typeof mouseInfo.y).toBe('number');
            expect(typeof mouseInfo.clicked).toBe('boolean');
        });

        it('should update FPS in render info during animation', () => {
            const renderer = new ASCIIRenderer({ canvas, pattern });
            expect(renderer.renderInfo.fps).toBe(0);
            expect(renderer.renderInfo.frameCount).toBe(0);
            renderer.render();
            renderer.render();
            expect(renderer.renderInfo.frameCount).toBeGreaterThan(0);
        });

        it('should update mouse info when interaction is enabled', () => {
            const renderer = new ASCIIRenderer({ 
                canvas,
                pattern,
                options: { enableMouseInteraction: true },
            });

            const initialMouseInfo = renderer.mouseInfo;
            expect(initialMouseInfo.x).toBe(0);
            expect(initialMouseInfo.y).toBe(0);
            expect(initialMouseInfo.clicked).toBe(false);
        });
    });
});
