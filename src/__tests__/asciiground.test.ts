import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ASCIIGround } from '../index';
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

describe('ASCIIGround', () => {
    let canvas: HTMLCanvasElement;
    let pattern: DummyPattern;

    beforeEach(() => {
        vi.clearAllMocks();
        mockRequestAnimationFrame.mockImplementation((_callback: FrameRequestCallback) => 123);
        canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        pattern = new DummyPattern();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('constructor', () => {
        it('should create ASCIIGround instance', () => {
            const asciiGround = new ASCIIGround();
            expect(asciiGround).toBeInstanceOf(ASCIIGround);
        });
    });

    describe('initialization', () => {
        it('should initialize with canvas and pattern', () => {
            const asciiGround = new ASCIIGround();
            const result = asciiGround.init(canvas, pattern);

            expect(result).toBe(asciiGround);
            expect(result).toBeInstanceOf(ASCIIGround);
        });

        it('should initialize with custom options', () => {
            const asciiGround = new ASCIIGround();

            const options = {
                fontSize: 16,
                color: '#ff0000',
                backgroundColor: '#ffffff',
            };
            
            const result = asciiGround.init(canvas, pattern, options);
            expect(result).toBe(asciiGround);
        });

        it('should throw error when accessing renderer before init', () => {
            const asciiGround = new ASCIIGround();
            
            expect(() => {
                asciiGround.startAnimation();
            }).toThrow('Renderer is not initialized - call init() first.');
        });
    });

    describe('animation control', () => {
        it('should start animation', () => {
            const asciiGround = new ASCIIGround();
            asciiGround.init(canvas, pattern);
            
            const result = asciiGround.startAnimation();
            
            expect(result).toBe(asciiGround);
            expect(mockRequestAnimationFrame).toHaveBeenCalled();
        });

        it('should stop animation', () => {
            const asciiGround = new ASCIIGround();
            asciiGround.init(canvas, pattern);
            
            asciiGround.startAnimation();
            const result = asciiGround.stopAnimation();
            
            expect(result).toBe(asciiGround);
            expect(mockCancelAnimationFrame).toHaveBeenCalledWith(123);
        });

        it('should handle start animation when already running', () => {
            const asciiGround = new ASCIIGround();
            asciiGround.init(canvas, pattern);
            
            asciiGround.startAnimation();
            
            expect(() => {
                asciiGround.startAnimation();
            }).toThrow('Animation is already running!');
        });
    });

    describe('pattern management', () => {
        it('should set pattern', () => {
            const asciiGround = new ASCIIGround();
            asciiGround.init(canvas, pattern);
            
            const newPattern = new PerlinNoisePattern();
            const result = asciiGround.setPattern(newPattern);
            
            expect(result).toBe(asciiGround);
        });

        it('should work with different pattern types', () => {
            const asciiGround = new ASCIIGround();
            asciiGround.init(canvas, pattern);
            
            const patterns = [
                new PerlinNoisePattern(),
                new RainPattern(),
                new StaticNoisePattern(),
                new DummyPattern()
            ];
            
            patterns.forEach(p => {
                expect(() => {
                    asciiGround.setPattern(p);
                }).not.toThrow();
            });
        });
    });

    describe('options management', () => {
        it('should set options', () => {
            const asciiGround = new ASCIIGround();
            asciiGround.init(canvas, pattern);
            
            const result = asciiGround.setOptions({
                fontSize: 20,
                color: '#00ff00',
            });
            
            expect(result).toBe(asciiGround);
        });

        it('should handle various option combinations', () => {
            const asciiGround = new ASCIIGround();
            asciiGround.init(canvas, pattern);
            
            const optionSets = [
                { fontSize: 12 },
                { color: '#ff0000' },
                { backgroundColor: '#000000' },
                { fontFamily: 'courier' },
                { padding: 10 },
                { animationSpeed: 2.0 },
                { enableMouseInteraction: true }
            ];
            
            optionSets.forEach(options => {
                expect(() => {
                    asciiGround.setOptions(options);
                }).not.toThrow();
            });
        });
    });

    describe('destruction', () => {
        it('should destroy properly', () => {
            const asciiGround = new ASCIIGround();
            asciiGround.init(canvas, pattern);
            asciiGround.startAnimation();
            
            expect(() => {
                asciiGround.destroy();
            }).not.toThrow();
            
            expect(mockCancelAnimationFrame).toHaveBeenCalled();
        });

        it('should handle access after destroy', () => {
            const asciiGround = new ASCIIGround();
            asciiGround.init(canvas, pattern);
            asciiGround.destroy();

            expect(() => {
                asciiGround.startAnimation();
            }).toThrow('Renderer is not initialized - call init() first.');
        });
    });

    describe('method chaining', () => {
        it('should support method chaining', () => {
            const asciiGround = new ASCIIGround();

            expect(() => {
                asciiGround
                    .init(canvas, pattern)
                    .setOptions({ fontSize: 16 })
                    .setPattern(new PerlinNoisePattern())
                    .startAnimation()
                    .stopAnimation();
            }).not.toThrow();
        });
    });

    describe('edge cases', () => {
        it('should handle canvas context unavailable', () => {
            vi.spyOn(canvas, 'getContext').mockReturnValue(null);
            const asciiGround = new ASCIIGround();

            expect(() => asciiGround.init(canvas, pattern)).toThrow('Could not get 2D context from canvas');
        });

        it('should handle very small canvas', () => {
            canvas.width = 10;
            canvas.height = 10;
            const asciiGround = new ASCIIGround();

            expect(() => asciiGround.init(canvas, pattern)).not.toThrow();
        });

        it('should handle very large canvas', () => {
            canvas.width = 4000;
            canvas.height = 3000;

            const asciiGround = new ASCIIGround();
            expect(() => asciiGround.init(canvas, pattern)).not.toThrow();
            expect(canvas.width).toBe(4000);
            expect(canvas.height).toBe(3000);
        });
    });

    describe('integration with patterns', () => {
        it('should work with PerlinNoisePattern', () => {
            const asciiGround = new ASCIIGround();

            const perlinPattern = new PerlinNoisePattern({
                frequency: 0.02,
                octaves: 3,
            });

            asciiGround.init(canvas, perlinPattern);
            expect(asciiGround.pattern).toBeInstanceOf(PerlinNoisePattern);
            expect(() => asciiGround.startAnimation()).not.toThrow();
            expect(asciiGround.options.animated).toBe(true);
        });

        it('should work with RainPattern', () => {
            const asciiGround = new ASCIIGround();

            const rainPattern = new RainPattern({
                rainDensity: 0.5,
                minDropLength: 5,
                maxDropLength: 15,
            });

            asciiGround.init(canvas, rainPattern);

            expect(asciiGround.pattern).toBeInstanceOf(RainPattern);
            expect(() => asciiGround.startAnimation()).not.toThrow();
            expect(asciiGround.options.animated).toBe(true);
        });

        it('should work with StaticNoisePattern', () => {
            const asciiGround = new ASCIIGround();
            const staticPattern = new StaticNoisePattern({ seed: 42 });
            asciiGround.init(canvas, staticPattern);

            expect(asciiGround.pattern).toBeInstanceOf(StaticNoisePattern);
            expect(() => asciiGround.startAnimation()).not.toThrow();
            expect(asciiGround.options.animated).toBe(true);
        });

        it('should work with DummyPattern', () => {
            const asciiGround = new ASCIIGround();
            const dummyPattern = new DummyPattern();
            asciiGround.init(canvas, dummyPattern);

            expect(asciiGround.pattern).toBeInstanceOf(DummyPattern);
            expect(() => asciiGround.startAnimation()).not.toThrow();
            expect(asciiGround.options.animated).toBe(true);
        });
    });

    describe('rendering integration', () => {
        it('should handle different renderer types', () => {
            const asciiGround = new ASCIIGround();
            const rendererTypes: Array<'2D' | 'WebGL'> = ['2D', 'WebGL'];
            
            rendererTypes.forEach(rendererType => {
                expect(() => {
                    asciiGround.init(canvas, pattern, { rendererType });
                }).not.toThrow();
            });
        });

        it('should handle animation with different speeds', () => {
            const asciiGround = new ASCIIGround();
            asciiGround.init(canvas, pattern);
            
            const speeds = [0.1, 0.5, 1.0, 2.0, 5.0];
            
            speeds.forEach(animationSpeed => {
                expect(() => {
                    asciiGround.setOptions({ animationSpeed });
                }).not.toThrow();
            });
        });
    });
});
