import { describe, it, expect, beforeEach } from 'vitest';
import { PerlinNoisePattern } from '../../patterns/perlin-noise-pattern';
import type { PatternContext, RenderRegion } from '../../patterns/pattern';

describe('PerlinNoisePattern - Additional Coverage', () => {
    let pattern: PerlinNoisePattern;
    const mockRegion: RenderRegion = {
        rows: 10,
        columns: 20,
        startRow: 0,
        endRow: 10,
        startColumn: 0,
        endColumn: 20,
        charWidth: 12,
        charHeight: 16,
        charSpacingX: 12,
        charSpacingY: 16,
        canvasWidth: 240,
        canvasHeight: 160,
    };

    const mockContext: PatternContext = {
        time: 1.0,
        deltaTime: 0.016,
        animationTime: 1.0,
        mouseX: 0,
        mouseY: 0,
        clicked: false,
        isAnimating: true,
        animationSpeed: 1.0,
        region: mockRegion,
    };

    beforeEach(() => {
        pattern = new PerlinNoisePattern();
        pattern.initialize(mockRegion);
    });

    describe('getters test coverage', () => {
        it('should access frequency through options', () => {
            pattern.setOptions({ frequency: 0.05 });
            expect(pattern.options.frequency).toBe(0.05);
        });
    });

    describe('noise generation methods', () => {
        it('should handle different animation contexts', () => {
            // Test animated noise with time component
            const animatedContext = {
                ...mockContext,
                animationTime: 2.0,
            };
            
            expect(() => {
                pattern.generate(animatedContext);
            }).not.toThrow();
        });

        it('should handle different seeds', () => {
            pattern.setOptions({ 
                seed: 42,
            });
            
            expect(() => {
                pattern.generate(mockContext);
            }).not.toThrow();
        });

        it('should handle different animation speeds', () => {
            const speedContext = {
                ...mockContext,
                animationSpeed: 2.0,
            };
            
            expect(() => {
                pattern.generate(speedContext);
            }).not.toThrow();
        });

        it('should handle edge cases in noise generation', () => {
            pattern.setOptions({
                frequency: 0.001,
                octaves: 1,
                persistence: 0.1,
                lacunarity: 1.5,
            });
            
            const result = pattern.generate(mockContext);
            expect(Array.isArray(result)).toBe(true);
        });

        it('should handle large grid sizes', () => {
            const largeRegion: RenderRegion = {
                ...mockRegion,
                rows: 50,
                columns: 100,
                endRow: 50,
                endColumn: 100,
            };
            
            pattern.initialize(largeRegion);
            
            expect(() => {
                pattern.generate(mockContext);
            }).not.toThrow();
        });

        it('should generate consistent results for same input', () => {
            const result1 = pattern.generate(mockContext);
            const result2 = pattern.generate(mockContext);
            
            expect(result1.length).toBe(result2.length);
        });
    });

    describe('noise parameters', () => {
        it('should handle different octave counts', () => {
            const octaveCounts = [1, 2, 4, 8];
            
            octaveCounts.forEach(octaves => {
                pattern.setOptions({ octaves });
                
                expect(() => {
                    pattern.generate(mockContext);
                }).not.toThrow();
            });
        });

        it('should handle various persistence values', () => {
            const persistenceValues = [0.1, 0.5, 0.9];
            
            persistenceValues.forEach(persistence => {
                pattern.setOptions({ persistence });
                
                expect(() => {
                    pattern.generate(mockContext);
                }).not.toThrow();
            });
        });

        it('should handle different lacunarity values', () => {
            const lacunarityValues = [1.5, 2.0, 3.0];
            
            lacunarityValues.forEach(lacunarity => {
                pattern.setOptions({ lacunarity });

                expect(() => {
                    pattern.generate(mockContext);
                }).not.toThrow();
            });
        });
    });

    describe('animation handling', () => {
        it('should handle animation time changes', () => {
            const timeValues = [0, 1, 5, 10];
            
            timeValues.forEach(animationTime => {
                const timedContext = { ...mockContext, animationTime };
                
                expect(() => {
                    pattern.generate(timedContext);
                }).not.toThrow();
            });
        });

        it('should handle different seeds for randomization', () => {
            pattern.setOptions({ seed: 12345 });
            
            expect(() => {
                pattern.generate(mockContext);
            }).not.toThrow();
        });
    });

    describe('character generation edge cases', () => {
        it('should handle empty characters array', () => {
            pattern.setOptions({ characters: [] });
            
            const result = pattern.generate(mockContext);
            expect(Array.isArray(result)).toBe(true);
        });

        it('should handle single character', () => {
            pattern.setOptions({ characters: ['█'] });
            
            const result = pattern.generate(mockContext);
            expect(Array.isArray(result)).toBe(true);
        });

        it('should handle many characters', () => {
            const manyChars = Array.from({ length: 20 }, (_, i) => String.fromCharCode(65 + i));
            pattern.setOptions({ characters: manyChars });
            
            const result = pattern.generate(mockContext);
            expect(Array.isArray(result)).toBe(true);
        });
    });

    describe('internal noise functions', () => {
        it('should access _animatedNoise method', () => {
            expect(() => {
                const result = pattern['_animatedNoise'](1.0, 2.0, 5.0);
                expect(typeof result).toBe('number');
            }).not.toThrow();
        });

        it('should access _getNoiseFunction with different directions', () => {
            const directions: Array<'left' | 'right' | 'up' | 'down'> = ['left', 'right', 'up', 'down'];
            
            directions.forEach(direction => {
                expect(() => {
                    const noiseFunc = pattern['_getNoiseFunction'](direction);
                    const result = noiseFunc(1.0, 2.0, 5.0);
                    expect(typeof result).toBe('number');
                }).not.toThrow();
            });
        });

        it('should use default direction in _getNoiseFunction', () => {
            expect(() => {
                const noiseFunc = pattern['_getNoiseFunction']();
                const result = noiseFunc(1.0, 2.0, 5.0);
                expect(typeof result).toBe('number');
            }).not.toThrow();
        });

        it('should handle noise function transformations', () => {
            const noiseFunc = pattern['_getNoiseFunction']('left');
            const result1 = noiseFunc(10, 20, 0);
            const result2 = noiseFunc(10, 20, 10);

            expect(result1).not.toBe(result2);
        });

        it('should produce consistent results from _animatedNoise', () => {
            const result1 = pattern['_animatedNoise'](5, 10, 2);
            const result2 = pattern['_animatedNoise'](5, 10, 2);
            
            expect(result1).toBe(result2);
        });
    });
});
