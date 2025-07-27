import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PatternProxy } from '../../demo/ui/pattern-proxy';
import { ASCIIRenderer } from '../../rendering/ascii-renderer';
import { DummyPattern } from '../../patterns/dummy-pattern';
import type { PatternConstructor } from '../../demo/ui/controls/controls-registry';

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

describe('PatternProxy', () => {
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
        });

        const pattern = new DummyPattern();
        renderer = new ASCIIRenderer(mockCanvas, pattern);
        patternProxy = new PatternProxy(renderer);
    });

    afterEach(() => {
        if (patternProxy)
            patternProxy.destroy();
        vi.restoreAllMocks();
    });

    describe('constructor', () => {
        it('should create instance with renderer', () => {
            expect(patternProxy).toBeInstanceOf(PatternProxy);
        });
    });

    describe('getCurrentPatternId', () => {
        it('should return current pattern ID', () => {
            const patternId = patternProxy.getCurrentPatternId();
            expect(patternId).toBe('dummy');
        });
    });

    describe('switchPattern', () => {
        it('should switch to different pattern', () => {
            expect(() => {
                patternProxy.switchPattern('perlin-noise');
            }).not.toThrow();

            expect(patternProxy.getCurrentPatternId()).toBe('perlin-noise');
        });

        it('should handle switching to same pattern', () => {
            patternProxy.switchPattern('dummy');
            expect(patternProxy.getCurrentPatternId()).toBe('dummy');
        });

        it('should throw error for invalid pattern', () => {
            expect(() => {
                patternProxy.switchPattern('invalid-pattern');
            }).toThrow();
        });
    });

    describe('getRendererOptions', () => {
        it('should return renderer options', () => {
            const options = patternProxy.getRendererOptions();
            expect(options).toBeDefined();
            expect(typeof options).toBe('object');
        });
    });

    describe('getPatternOptions', () => {
        it('should return pattern options', () => {
            const options = patternProxy.getPatternOptions();
            expect(options).toBeDefined();
            expect(typeof options).toBe('object');
        });
    });

    describe('handleControlChange', () => {
        it('should handle pattern control changes', () => {
            expect(() => {
                patternProxy.handleControlChange('pattern', 'characters', ['A', 'B', 'C']);
            }).not.toThrow();
        });

        it('should handle renderer control changes', () => {
            expect(() => {
                patternProxy.handleControlChange('renderer', 'fontSize', 16);
            }).not.toThrow();
        });

        it('should handle unknown control category', () => {
            expect(() => {
                patternProxy.handleControlChange('unknown', 'test', 'value');
            }).not.toThrow();
        });

        it('should handle string characters conversion to array', () => {
            expect(() => {
                patternProxy.handleControlChange('pattern', 'characters', 'ABC');
            }).not.toThrow();
        });
    });

    describe('animation handling', () => {
        it('should trigger render when animation is stopped', () => {
            renderer.stopAnimation();
            patternProxy.handleControlChange('pattern', 'characters', ['1', '2', '3']);
            expect(mockRequestAnimationFrame).toHaveBeenCalled();
        });
    });

    describe('pattern update fallback', () => {
        it('should handle patterns without setOptions method', () => {
            const patternWithoutSetOptions = {
                id: 'dummy',
                options: { characters: ['A'] },
            };

            Object.defineProperty(renderer, 'pattern', {
                get: () => patternWithoutSetOptions,
                set: () => {},
            });
            
            expect(() => {
                patternProxy.handleControlChange('pattern', 'characters', 'TEST');
            }).not.toThrow();
        });

        it('should handle pattern constructor not found', () => {
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            
            const invalidPattern = {
                id: 'non-existent-pattern',
                options: { characters: ['A'] },
            };
            
            Object.defineProperty(renderer, 'pattern', {
                get: () => invalidPattern,
                set: () => {},
            });
            
            const originalGetPattern = patternProxy['_getPattern'];
            patternProxy['_getPattern'] = () => [null as unknown as PatternConstructor, {} as Record<string, unknown>];
            patternProxy.handleControlChange('pattern', 'characters', 'TEST');
            expect(consoleSpy).toHaveBeenCalledWith('Cannot update pattern "non-existent-pattern".');

            patternProxy['_getPattern'] = originalGetPattern;
            consoleSpy.mockRestore();
        });
    });

    describe('update optimization', () => {
        it('should not process updates when no changes pending', () => {
            const renderSpy = vi.spyOn(renderer, 'render');
            
            // Call _processPendingUpdates directly without any pending changes
            patternProxy['_processPendingUpdates']();
            
            expect(renderSpy).not.toHaveBeenCalled();
            expect(mockRequestAnimationFrame).not.toHaveBeenCalled();
        });

        it('should handle only pattern updates', () => {
            renderer.stopAnimation();
            
            // Directly set pending pattern updates
            patternProxy['_pendingPatternUpdates'] = { characters: 'ABC' };
            patternProxy['_processPendingUpdates']();
            
            // Should schedule render via requestAnimationFrame
            expect(mockRequestAnimationFrame).toHaveBeenCalled();
        });

        it('should handle only renderer updates', () => {
            renderer.stopAnimation();
            
            // Directly set pending renderer updates
            patternProxy['_pendingRendererUpdates'] = { fontSize: 20 };
            patternProxy['_processPendingUpdates']();
            
            // Should schedule render via requestAnimationFrame
            expect(mockRequestAnimationFrame).toHaveBeenCalled();
        });
    });

    describe('emit change listeners', () => {
        it('should notify listeners of changes', () => {
            const callback = vi.fn();
            
            // Add listener directly to internal map
            patternProxy['_listeners'].set('testControl', [callback]);
            
            patternProxy.handleControlChange('pattern', 'testControl', 'newValue');
            
            expect(callback).toHaveBeenCalledWith('newValue');
        });

        it('should handle controls with no listeners', () => {
            expect(() => {
                patternProxy.handleControlChange('pattern', 'noListeners', 'value');
            }).not.toThrow();
        });
    });

    describe('dispose', () => {
        it('should clean up resources', () => {
            const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
            
            // Trigger pending update
            patternProxy.handleControlChange('pattern', 'test', 'value');
            
            patternProxy.dispose();
            
            expect(clearTimeoutSpy).toHaveBeenCalled();
        });

        it('should clear all internal state', () => {
            patternProxy['_pendingPatternUpdates'] = { test: 'value' };
            patternProxy['_pendingRendererUpdates'] = { test2: 'value2' };
            patternProxy['_listeners'].set('test', [() => {}]);
            
            patternProxy.dispose();
            
            expect(Object.keys(patternProxy['_pendingPatternUpdates'])).toHaveLength(0);
            expect(Object.keys(patternProxy['_pendingRendererUpdates'])).toHaveLength(0);
            expect(patternProxy['_listeners'].size).toBe(0);
        });
    });

    describe('destroy', () => {
        it('should handle destroy call', () => {
            expect(() => {
                patternProxy.destroy();
            }).not.toThrow();
        });

        it('should clean up renderer', () => {
            const destroySpy = vi.spyOn(renderer, 'destroy');
            
            patternProxy.destroy();
            
            expect(destroySpy).toHaveBeenCalled();
        });
    });
});
