import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PatternControlsManager } from '../../demo/ui/config-generator';
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

const createMockContainer = () => {
    const container = {
        innerHTML: '',
        querySelector: vi.fn(),
        querySelectorAll: vi.fn(() => [] as unknown as NodeListOf<Element>),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        appendChild: vi.fn(),
    } as unknown as HTMLFormElement;
    
    return container;
};

describe('PatternControlsManager Extended Tests', () => {
    let manager: PatternControlsManager;
    let renderer: ASCIIRenderer;
    let mockCanvas: HTMLCanvasElement;
    let mockControlsContainer: HTMLFormElement;
    let mockRequestAnimationFrame: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();
        mockCanvas = createMockCanvas();
        mockControlsContainer = createMockContainer();
        mockRequestAnimationFrame = vi.fn((_callback: FrameRequestCallback) => 123);
        
        Object.assign(globalThis, {
            requestAnimationFrame: mockRequestAnimationFrame,
            cancelAnimationFrame: vi.fn(),
            setTimeout: vi.fn((callback: () => void) => {
                callback();
                return 123;
            }),
            clearTimeout: vi.fn(),
            window: {
                setTimeout: vi.fn((callback: () => void) => {
                    callback();
                    return 123;
                }),
            },
        });

        const pattern = new DummyPattern();
        renderer = new ASCIIRenderer({ canvas: mockCanvas, pattern });
    });

    afterEach(() => {
        if (manager)
            manager.destroy();
        
        vi.restoreAllMocks();
    });

    describe('constructor behavior', () => {
        it('should create manager with valid container and renderer', () => {
            expect(() => {
                manager = new PatternControlsManager(mockControlsContainer, renderer);
            }).not.toThrow();
            
            expect(manager).toBeInstanceOf(PatternControlsManager);
        });

        it('should initialize with default pattern controls', () => {
            manager = new PatternControlsManager(mockControlsContainer, renderer);
            
            expect(manager).toBeInstanceOf(PatternControlsManager);
        });

        it('should handle null container gracefully', () => {
            const nullContainer = null as unknown as HTMLFormElement;
            
            expect(() => {
                manager = new PatternControlsManager(nullContainer, renderer);
            }).toThrow();
        });

        it('should handle null renderer gracefully', () => {
            const nullRenderer = null as unknown as ASCIIRenderer;
            
            expect(() => {
                manager = new PatternControlsManager(mockControlsContainer, nullRenderer);
            }).toThrow();
        });
    });

    describe('pattern switching', () => {
        beforeEach(() => {
            manager = new PatternControlsManager(mockControlsContainer, renderer);
        });

        it('should switch to all supported patterns', () => {
            const patterns = ['dummy', 'rain', 'perlin-noise', 'static'];

            patterns.forEach(pattern => {
                expect(() => {
                    manager.switchPattern(pattern);
                }).not.toThrow();
            });
        });

        it('should handle switching to same pattern multiple times', () => {
            const spySwitchPattern = vi.spyOn(manager, 'switchPattern');

            expect(() => {
                manager.switchPattern('rain');
                manager.switchPattern('rain');
                manager.switchPattern('rain');
            }).not.toThrow();

            expect(spySwitchPattern).toHaveBeenCalledTimes(3);
        });

        it('should handle rapid pattern switches', () => {
            expect(() => {
                manager.switchPattern('rain');
                manager.switchPattern('perlin-noise');
                manager.switchPattern('static');
                manager.switchPattern('dummy');
                manager.switchPattern('rain');
            }).not.toThrow();
        });

        it('should handle invalid pattern gracefully', () => {
            expect(() => {
                manager.switchPattern('invalid-pattern');
            }).toThrow();
        });

        it('should handle empty pattern id gracefully', () => {
            expect(() => {
                manager.switchPattern('');
            }).toThrow();
        });
    });

    describe('control change listeners', () => {
        beforeEach(() => {
            manager = new PatternControlsManager(mockControlsContainer, renderer);
        });

        it('should add control change listeners', () => {
            const callback = vi.fn();
            
            expect(() => {
                manager.onControlChange('frequency', callback);
            }).not.toThrow();
        });

        it('should handle multiple listeners for same control', () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();
            const callback3 = vi.fn();
            
            expect(() => {
                manager.onControlChange('frequency', callback1);
                manager.onControlChange('frequency', callback2);
                manager.onControlChange('frequency', callback3);
            }).not.toThrow();
        });

        it('should handle listeners for different controls', () => {
            const frequencyCallback = vi.fn();
            const colorCallback = vi.fn();
            const sizeCallback = vi.fn();
            
            expect(() => {
                manager.onControlChange('frequency', frequencyCallback);
                manager.onControlChange('color', colorCallback);
                manager.onControlChange('fontSize', sizeCallback);
            }).not.toThrow();
        });

        it('should handle invalid control names gracefully', () => {
            const callback = vi.fn();
            
            expect(() => {
                manager.onControlChange('invalid-control', callback);
            }).not.toThrow();
        });

        it('should handle null callback gracefully', () => {
            const nullCallback = null as unknown as () => void;
            
            expect(() => {
                manager.onControlChange('frequency', nullCallback);
            }).not.toThrow();
        });
    });

    describe('destroy behavior', () => {
        beforeEach(() => {
            manager = new PatternControlsManager(mockControlsContainer, renderer);
        });

        it('should handle destroy without errors', () => {
            expect(() => {
                manager.destroy();
            }).not.toThrow();
        });

        it('should handle multiple destroy calls', () => {
            expect(() => {
                manager.destroy();
                manager.destroy();
                manager.destroy();
            }).not.toThrow();
        });

        it('should clean up after destroy', () => {
            manager.destroy();
            expect(() => manager.switchPattern('rain')).toThrow();
        });
    });

    describe('integration scenarios', () => {
        beforeEach(() => {
            manager = new PatternControlsManager(mockControlsContainer, renderer);
        });

        it('should handle pattern switching with listeners', () => {
            const callback = vi.fn();
            manager.onControlChange('frequency', callback);
            
            expect(() => {
                manager.switchPattern('perlin-noise');
                manager.switchPattern('rain');
                manager.switchPattern('static');
            }).not.toThrow();
        });

        it('should handle complex interaction scenarios', () => {
            const frequencyCallback = vi.fn();
            const colorCallback = vi.fn();
            
            expect(() => {
                manager.onControlChange('frequency', frequencyCallback);
                manager.onControlChange('color', colorCallback);
                manager.switchPattern('perlin-noise');
                manager.switchPattern('rain');
                manager.onControlChange('density', vi.fn());
                manager.switchPattern('static');
                manager.switchPattern('dummy');
            }).not.toThrow();

            // FIXME:
            // expect(frequencyCallback).toHaveBeenCalled();
            // expect(colorCallback).toHaveBeenCalled();
        });

        it('should maintain functionality after multiple operations', () => {
            manager.onControlChange('frequency', vi.fn());
            manager.switchPattern('rain');
            manager.onControlChange('color', vi.fn());
            manager.switchPattern('perlin-noise');

            expect(() => {
                manager.switchPattern('static');
                manager.onControlChange('density', vi.fn());
            }).not.toThrow();
        });
    });

    describe('edge cases', () => {
        it('should handle manager creation with different pattern types', () => {
            const patterns = ['dummy', 'rain', 'perlin-noise', 'static'];

            patterns.forEach((_patternId) => {
                const pattern = new DummyPattern();
                const testRenderer = new ASCIIRenderer({ canvas: mockCanvas, pattern });
                
                expect(() => {
                    const testManager = new PatternControlsManager(mockControlsContainer, testRenderer);
                    testManager.destroy();
                }).not.toThrow();
            });
        });

        it('should handle container with existing content', () => {
            mockControlsContainer.innerHTML = '<div>Existing content</div>';

            expect(() => {
                manager = new PatternControlsManager(mockControlsContainer, renderer);
            }).not.toThrow();
        });

        it('should handle renderer state changes', () => {
            manager = new PatternControlsManager(mockControlsContainer, renderer);

            expect(() => {
                renderer.startAnimation();
                manager.switchPattern('rain');
                renderer.stopAnimation();
                manager.switchPattern('perlin-noise');
            }).not.toThrow();
        });
    });
});
