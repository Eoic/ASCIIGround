import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PatternProxy } from '../../demo/ui/pattern-proxy';
import { ASCIIRenderer } from '../../rendering/ascii-renderer';
import { DummyPattern } from '../../patterns/dummy-pattern';

const createMockCanvas = () => {
    const canvas = {
        width: 800,
        height: 600,
        style: {},
        getBoundingClientRect: vi.fn(() => ({
            left: 0,
            top: 0,
            right: 800,
            bottom: 600,
            width: 800,
            height: 600,
            x: 0,
            y: 0,
            toJSON: () => ({}),
        })),
        getContext: vi.fn(() => ({
            save: vi.fn(),
            restore: vi.fn(),
            clearRect: vi.fn(),
            beginPath: vi.fn(),
            rect: vi.fn(),
            clip: vi.fn(),
            fillText: vi.fn(),
            fillRect: vi.fn(),
            measureText: vi.fn(() => ({ width: 10 })),
            fillStyle: '#000000',
            font: '12px monospace',
            textBaseline: 'top',
        })),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        setAttribute: vi.fn(),
        getAttribute: vi.fn(),
        removeAttribute: vi.fn(),
        hasAttribute: vi.fn(),
    } as unknown as HTMLCanvasElement;
    
    return canvas;
};

describe('PatternProxy Extended Tests', () => {
    let patternProxy: PatternProxy;
    let renderer: ASCIIRenderer;
    let mockCanvas: HTMLCanvasElement;
    let mockRequestAnimationFrame: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();
        mockCanvas = createMockCanvas();
        mockRequestAnimationFrame = vi.fn((_callback: FrameRequestCallback) => 123);
        
        Object.assign(globalThis, {
            requestAnimationFrame: mockRequestAnimationFrame,
            clearTimeout: vi.fn(),
            setTimeout: vi.fn((callback: () => void) => {
                callback();
                return 123;
            }),
            setInterval: vi.fn(),
            clearInterval: vi.fn(),
            window: {
                setTimeout: vi.fn((callback: () => void) => {
                    callback();
                    return 123;
                }),
            },
        });

        const pattern = new DummyPattern();
        renderer = new ASCIIRenderer({ canvas: mockCanvas, pattern });
        patternProxy = new PatternProxy(renderer);
    });

    afterEach(() => {
        if (patternProxy)
            patternProxy.destroy();
        
        vi.restoreAllMocks();
    });

    describe('advanced pattern switching', () => {
        it('should handle rapid pattern switches', () => {
            expect(() => {
                patternProxy.switchPattern('rain');
                patternProxy.switchPattern('perlin-noise');
                patternProxy.switchPattern('static');
                patternProxy.switchPattern('dummy');
            }).not.toThrow();
        });

        it('should maintain current pattern when switching to same pattern', () => {
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const currentPattern = patternProxy.getCurrentPatternId();
            
            patternProxy.switchPattern(currentPattern);
            
            expect(consoleSpy).toHaveBeenCalledWith(`Pattern "${currentPattern}" is already active.`);
            consoleSpy.mockRestore();
        });
    });

    describe('control value handling', () => {
        it('should handle pattern control changes', () => {
            expect(() => {
                patternProxy.handleControlChange('pattern', 'frequency', 0.1);
                patternProxy.handleControlChange('pattern', 'characters', 'ABC');
                patternProxy.handleControlChange('pattern', 'density', 0.5);
            }).not.toThrow();
        });

        it('should handle renderer control changes', () => {
            expect(() => {
                patternProxy.handleControlChange('renderer', 'fontSize', 12);
                patternProxy.handleControlChange('renderer', 'color', '#ff0000');
                patternProxy.handleControlChange('renderer', 'enableMouseInteraction', true);
            }).not.toThrow();
        });

        it('should handle unknown control categories gracefully', () => {
            expect(() => {
                patternProxy.handleControlChange('unknown', 'someControl', 'value');
            }).not.toThrow();
        });
    });

    describe('options retrieval', () => {
        it('should return renderer options', () => {
            const options = patternProxy.getRendererOptions();
            expect(options).toBeDefined();
            expect(typeof options).toBe('object');
        });

        it('should return pattern options', () => {
            const options = patternProxy.getPatternOptions();
            expect(options).toBeDefined();
            expect(typeof options).toBe('object');
        });

        it('should return current pattern id', () => {
            const patternId = patternProxy.getCurrentPatternId();
            expect(patternId).toBeDefined();
            expect(typeof patternId).toBe('string');
        });
    });

    describe('error handling', () => {
        it('should handle invalid pattern types gracefully', () => {
            expect(() => {
                patternProxy.switchPattern('invalid-pattern');
            }).toThrow();
        });

        it('should handle null renderer gracefully', () => {
            const nullRenderer = null as unknown as ASCIIRenderer;
            
            expect(() => {
                new PatternProxy(nullRenderer);
            }).toThrow();
        });
    });

    describe('destroy and dispose cleanup', () => {
        it('should handle destroy without errors', () => {
            expect(() => {
                patternProxy.destroy();
            }).not.toThrow();
        });

        it('should handle dispose without errors', () => {
            expect(() => {
                patternProxy.dispose();
            }).not.toThrow();
        });

        it('should handle multiple destroy calls gracefully', () => {
            expect(() => {
                patternProxy.destroy();
                patternProxy.destroy();
                patternProxy.destroy();
            }).not.toThrow();
        });

        it('should handle multiple dispose calls gracefully', () => {
            expect(() => {
                patternProxy.dispose();
                patternProxy.dispose();
                patternProxy.dispose();
            }).not.toThrow();
        });
    });

    describe('control value types', () => {
        it('should handle string control values', () => {
            expect(() => {
                patternProxy.handleControlChange('pattern', 'characters', 'ABC123');
            }).not.toThrow();
        });

        it('should handle number control values', () => {
            expect(() => {
                patternProxy.handleControlChange('pattern', 'frequency', 0.75);
            }).not.toThrow();
        });

        it('should handle boolean control values', () => {
            expect(() => {
                patternProxy.handleControlChange('renderer', 'enableMouseInteraction', true);
            }).not.toThrow();
        });

        it('should handle array control values', () => {
            expect(() => {
                patternProxy.handleControlChange('pattern', 'characters', ['A', 'B', 'C']);
            }).not.toThrow();
        });
    });

    describe('pattern options synchronization', () => {
        it('should preserve pattern options when switching patterns', () => {
            patternProxy.handleControlChange('pattern', 'frequency', 0.5);

            const currentPatternId = patternProxy.getCurrentPatternId();
            patternProxy.switchPattern('rain');
            patternProxy.switchPattern(currentPatternId);

            // Pattern should be recreated but proxy should maintain state
            expect(patternProxy.getCurrentPatternId()).toBe(currentPatternId);
        });

        it('should apply renderer options to new patterns', () => {
            patternProxy.handleControlChange('renderer', 'fontSize', 16);

            const renderSpy = vi.spyOn(renderer, 'render');
            patternProxy.switchPattern('rain');

            expect(renderSpy).toHaveBeenCalled();
        });

        it('should handle pattern switching with different options', () => {
            const currentPattern = patternProxy.getCurrentPatternId();
            
            // Switch to different patterns and back
            patternProxy.switchPattern('perlin-noise');
            patternProxy.handleControlChange('pattern', 'frequency', 0.3);
            
            patternProxy.switchPattern('rain');
            patternProxy.handleControlChange('pattern', 'rainDensity', 0.8);
            
            patternProxy.switchPattern(currentPattern);
            
            expect(patternProxy.getCurrentPatternId()).toBe(currentPattern);
        });
    });

    describe('debouncing behavior', () => {
        it('should handle rapid control changes', () => {
            const mockSetTimeout = vi.fn();
            const mockClearTimeout = vi.fn();
            
            Object.assign(globalThis, {
                window: {
                    setTimeout: mockSetTimeout,
                    clearTimeout: mockClearTimeout,
                },
            });

            expect(() => {
                patternProxy.handleControlChange('pattern', 'frequency', 0.1);
                patternProxy.handleControlChange('pattern', 'frequency', 0.2);
                patternProxy.handleControlChange('pattern', 'frequency', 0.3);
            }).not.toThrow();
        });
    });
});
