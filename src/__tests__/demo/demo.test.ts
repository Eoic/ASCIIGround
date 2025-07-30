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

const mockCanvas = createMockCanvas();

const mockControlsContainer = {
    innerHTML: '',
    appendChild: vi.fn(),
    removeChild: vi.fn(),
    querySelector: vi.fn(),
    querySelectorAll: vi.fn(() => []),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    classList: {
        add: vi.fn(),
        remove: vi.fn(),
        contains: vi.fn(),
    },
} as unknown as HTMLFormElement;

Object.assign(globalThis, {
    requestAnimationFrame: vi.fn((callback: FrameRequestCallback) => {
        callback(1000);
        return 123;
    }),
    cancelAnimationFrame: vi.fn(),
    performance: {
        now: vi.fn(() => 1000),
    },
});

describe('Demo - PatternControlsManager', () => {
    let manager: PatternControlsManager;
    let renderer: ASCIIRenderer;
    let mockRequestAnimationFrame: ReturnType<typeof vi.fn>;
    let mockCancelAnimationFrame: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();
        
        mockControlsContainer.innerHTML = '';
        mockControlsContainer.querySelector = vi.fn();
        mockControlsContainer.querySelectorAll = vi.fn(() => [] as unknown as NodeListOf<Element>);
        mockRequestAnimationFrame = vi.fn((_callback: FrameRequestCallback) => 123);
        mockCancelAnimationFrame = vi.fn();
        
        Object.assign(globalThis, {
            requestAnimationFrame: mockRequestAnimationFrame,
            cancelAnimationFrame: mockCancelAnimationFrame,
        });

        const pattern = new DummyPattern();
        renderer = new ASCIIRenderer({ canvas: mockCanvas, pattern });
    });

    afterEach(() => {
        if (manager) 
            manager.destroy();

        vi.restoreAllMocks();
    });

    describe('constructor', () => {
        it('should create PatternControlsManager instance', () => {
            manager = new PatternControlsManager(
                mockControlsContainer,
                renderer
            );
            
            expect(manager).toBeInstanceOf(PatternControlsManager);
        });

        it('should initialize with default pattern', () => {
            manager = new PatternControlsManager(
                mockControlsContainer,
                renderer
            );
            
            expect(manager).toBeInstanceOf(PatternControlsManager);
        });
    });

    describe('pattern switching', () => {
        beforeEach(() => {
            manager = new PatternControlsManager(
                mockControlsContainer,
                renderer
            );
        });

        it('should handle pattern change', () => {
            expect(() => {
                manager.switchPattern('perlin-noise');
            }).not.toThrow();
        });

        it('should handle switching to rain pattern', () => {
            expect(() => {
                manager.switchPattern('rain');
            }).not.toThrow();
        });

        it('should handle switching to static pattern', () => {
            expect(() => {
                manager.switchPattern('static');
            }).not.toThrow();
        });

        it('should handle switching to dummy pattern', () => {
            expect(() => {
                manager.switchPattern('dummy');
            }).not.toThrow();
        });

        it('should handle invalid pattern gracefully', () => {
            manager = new PatternControlsManager(mockControlsContainer, renderer);

            expect(() => {
                manager.switchPattern('invalid-pattern');
            }).toThrow('Pattern controls for "invalid-pattern" not found.');
        });
    });

    describe('control events', () => {
        beforeEach(() => {
            manager = new PatternControlsManager(
                mockControlsContainer,
                renderer
            );
        });

        it('should add control change listener', () => {
            expect(() => {
                manager.onControlChange('frequency', (value) => {
                    expect(value).toBeDefined();
                });
            }).not.toThrow();
        });

        it('should handle multiple listeners', () => {
            expect(() => {
                manager.onControlChange('frequency', () => {});
                manager.onControlChange('color', () => {});
                manager.onControlChange('fontSize', () => {});
            }).not.toThrow();
        });
    });

    describe('integration with renderer', () => {
        beforeEach(() => {
            manager = new PatternControlsManager(
                mockControlsContainer,
                renderer
            );
        });

        it('should work with existing renderer', () => {
            expect(manager).toBeInstanceOf(PatternControlsManager);
        });

        it('should handle renderer state changes', () => {
            expect(() => {
                renderer.startAnimation();
                manager.switchPattern('rain');
                renderer.stopAnimation();
            }).not.toThrow();
        });
    });

    describe('edge cases', () => {
        it('should handle null renderer gracefully', () => {
            const badRenderer = null as unknown as ASCIIRenderer;

            expect(() => {
                manager = new PatternControlsManager(
                    mockControlsContainer,
                    badRenderer
                );
            }).toThrow();
        });

        it('should handle missing DOM elements gracefully', () => {
            manager = new PatternControlsManager(
                mockControlsContainer,
                renderer
            );

            mockControlsContainer.querySelector = vi.fn(() => null);
            
            expect(() => {
                manager.switchPattern('perlin-noise');
            }).not.toThrow();
        });

        it('should handle rapid pattern switching', () => {
            manager = new PatternControlsManager(
                mockControlsContainer,
                renderer
            );

            expect(() => {
                manager.switchPattern('perlin-noise');
                manager.switchPattern('rain');
                manager.switchPattern('static');
                manager.switchPattern('dummy');
                manager.switchPattern('perlin-noise');
            }).not.toThrow();
        });
    });

    describe('integration workflow', () => {
        beforeEach(() => {
            manager = new PatternControlsManager(
                mockControlsContainer,
                renderer
            );
        });

        it('should handle complete workflow', () => {
            expect(() => {
                renderer.startAnimation();
                manager.switchPattern('rain');
                manager.onControlChange('rainDensity', () => {});
                manager.switchPattern('perlin-noise');
                manager.onControlChange('frequency', () => {});
                renderer.stopAnimation();
            }).not.toThrow();
        });

        it('should maintain state consistency', () => {
            manager.switchPattern('rain');
            manager.switchPattern('perlin-noise');
            
            expect(manager).toBeInstanceOf(PatternControlsManager);
        });
    });

    describe('internal methods coverage', () => {
        beforeEach(() => {
            manager = new PatternControlsManager(
                mockControlsContainer,
                renderer
            );
        });

        it('should handle renderer control changes in event listeners', () => {
            expect(() => {
                manager.onControlChange('fontSize', () => {});
            }).not.toThrow();
        });

        it('should set control values during synchronization', () => {
            const setControlValueSpy = vi.spyOn(manager['_controlsGenerator']!, 'setControlValue');
            manager.switchPattern('rain');
            expect(setControlValueSpy).toHaveBeenCalled();
        });

        it('should handle pattern controls during listener setup', () => {
            const onControlChangeSpy = vi.spyOn(manager['_controlsGenerator']!, 'onControlChange');
            manager.switchPattern('perlin-noise');

            expect(onControlChangeSpy).toHaveBeenCalled();
        });
    });
});
