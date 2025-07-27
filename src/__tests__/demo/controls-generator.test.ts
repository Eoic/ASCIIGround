import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ControlsGenerator } from '../../demo/ui/controls-generator';

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

const createMockElement = () => ({
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    setAttribute: vi.fn(),
    getAttribute: vi.fn(),
    value: '',
    checked: false,
    selectedIndex: 0,
    classList: {
        toggle: vi.fn(),
        add: vi.fn(),
        remove: vi.fn(),
    },
    style: {},
    dispatchEvent: vi.fn(),
});

describe('ControlsGenerator', () => {
    let controlsGenerator: ControlsGenerator;
    let mockContainer: HTMLFormElement;

    beforeEach(() => {
        vi.clearAllMocks();
        mockContainer = createMockContainer();
        controlsGenerator = new ControlsGenerator(mockContainer);
    });

    afterEach(() => {
        if (controlsGenerator)
            controlsGenerator.destroy();
        vi.restoreAllMocks();
    });

    describe('constructor', () => {
        it('should create instance with container', () => {
            expect(controlsGenerator).toBeInstanceOf(ControlsGenerator);
        });
    });

    describe('generatePatternControls', () => {
        it('should generate controls for perlin pattern', () => {
            expect(() => {
                controlsGenerator.generatePatternControls('perlin-noise');
            }).not.toThrow();
        });

        it('should generate controls for rain pattern', () => {
            expect(() => {
                controlsGenerator.generatePatternControls('rain');
            }).not.toThrow();
        });

        it('should generate controls for static pattern', () => {
            expect(() => {
                controlsGenerator.generatePatternControls('static');
            }).not.toThrow();
        });

        it('should generate controls for dummy pattern', () => {
            expect(() => {
                controlsGenerator.generatePatternControls('dummy');
            }).not.toThrow();
        });
    });

    describe('onControlChange', () => {
        beforeEach(() => {
            controlsGenerator.generatePatternControls('perlin-noise');
        });

        it('should add control change listener', () => {
            const callback = vi.fn();
            
            expect(() => {
                controlsGenerator.onControlChange('frequency', callback);
            }).not.toThrow();
        });

        it('should handle multiple listeners for same control', () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();
            
            expect(() => {
                controlsGenerator.onControlChange('frequency', callback1);
                controlsGenerator.onControlChange('frequency', callback2);
            }).not.toThrow();
        });
    });

    describe('offControlChange', () => {
        beforeEach(() => {
            controlsGenerator.generatePatternControls('perlin-noise');
        });

        it('should remove control change listener', () => {
            const callback = vi.fn();
            
            controlsGenerator.onControlChange('frequency', callback);
            
            expect(() => {
                controlsGenerator.offControlChange('frequency');
            }).not.toThrow();
        });

        it('should handle removing non-existent listener', () => {
            expect(() => {
                controlsGenerator.offControlChange('nonexistent');
            }).not.toThrow();
        });
    });

    describe('destroy', () => {
        it('should remove event listeners and clear state', () => {
            const removeEventListenerSpy = vi.spyOn(mockContainer, 'removeEventListener');
            controlsGenerator.destroy();

            expect(removeEventListenerSpy).toHaveBeenCalledWith('input', expect.any(Function));
        });

        it('should clear listeners map', () => {
            controlsGenerator.onControlChange('test', () => {});
            controlsGenerator.destroy();

            expect(controlsGenerator['_listeners'].size).toBe(0);
        });

        it('should clear controls from container', () => {
            controlsGenerator.generatePatternControls('perlin-noise');

            controlsGenerator.destroy();
            expect(mockContainer.innerHTML).toBe('');
        });
    });

    describe('setControlValue', () => {
        beforeEach(() => {
            controlsGenerator.generatePatternControls('perlin-noise');
        });

        it('should set control value for number input', () => {
            const mockInput = createMockElement();
            mockContainer.querySelector = vi.fn(() => mockInput as unknown as Element);

            expect(() => {
                controlsGenerator.setControlValue('frequency', 0.1);
            }).not.toThrow();
        });

        it('should set control value for text input', () => {
            const mockInput = createMockElement();
            mockContainer.querySelector = vi.fn(() => mockInput as unknown as Element);

            expect(() => {
                controlsGenerator.setControlValue('characters', 'ABC');
            }).not.toThrow();
        });

        it('should set control value for select input', () => {
            const mockSelect = createMockElement();
            mockContainer.querySelector = vi.fn(() => mockSelect as unknown as Element);

            expect(() => {
                controlsGenerator.setControlValue('pattern', 'rain');
            }).not.toThrow();
        });

        it('should set control value for checkbox', () => {
            const mockCheckbox = createMockElement();
            mockContainer.querySelector = vi.fn(() => mockCheckbox as unknown as Element);
            
            expect(() => {
                controlsGenerator.setControlValue('enableMouseInteraction', true);
            }).not.toThrow();
        });

        it('should handle missing control element', () => {
            mockContainer.querySelector = vi.fn(() => null);

            expect(() => {
                controlsGenerator.setControlValue('nonexistent', 'value');
            }).not.toThrow();
        });
    });

    describe('removeControlListeners', () => {
        it('should remove control listeners for specific control', () => {
            expect(() => {
                controlsGenerator.removeControlListeners('frequency');
            }).not.toThrow();
        });
    });

    describe('getControlValue', () => {
        it('should get control value', () => {
            const mockInput = createMockElement();
            mockInput.value = 'test-value';
            mockContainer.querySelector = vi.fn(() => mockInput as unknown as Element);
            
            const value = controlsGenerator.getControlValue('test-control');
            expect(value).toBe('test-value');
        });

        it('should return null for missing control', () => {
            mockContainer.querySelector = vi.fn(() => null);
            
            const value = controlsGenerator.getControlValue('nonexistent');
            expect(value).toBeNull();
        });
    });

    describe('getAllControlValues', () => {
        beforeEach(() => {
            controlsGenerator.generatePatternControls('perlin-noise');
        });

        it('should get all control values', () => {
            const values = controlsGenerator.getAllControlValues();
            expect(values).toBeDefined();
            expect(typeof values).toBe('object');
        });
    });

    describe('destroy', () => {
        it('should destroy and clean up', () => {
            expect(() => {
                controlsGenerator.destroy();
            }).not.toThrow();
        });
    });

    describe('error handling', () => {
        it('should handle invalid pattern type', () => {
            expect(() => {
                controlsGenerator.generatePatternControls('invalid-pattern');
            }).toThrow();
        });

        it('should handle DOM manipulation errors gracefully', () => {
            const badContainer = {
                ...mockContainer,
                appendChild: vi.fn(() => { throw new Error('DOM error'); }),
            } as unknown as HTMLFormElement;

            expect(() => {
                new ControlsGenerator(badContainer);
            }).not.toThrow();
        });
    });

    describe('control types', () => {
        beforeEach(() => {
            controlsGenerator.generatePatternControls('rain');
        });

        it('should handle number controls', () => {
            const mockInput = createMockElement();
            mockContainer.querySelector = vi.fn(() => mockInput as unknown as Element);
            
            expect(() => {
                controlsGenerator.setControlValue('rainDensity', 0.5);
            }).not.toThrow();
        });

        it('should handle color controls', () => {
            const mockInput = createMockElement();
            mockContainer.querySelector = vi.fn(() => mockInput as unknown as Element);
            
            expect(() => {
                controlsGenerator.setControlValue('headColor', '#FF0000');
            }).not.toThrow();
        });

        it('should handle array controls', () => {
            const mockInput = createMockElement();
            mockContainer.querySelector = vi.fn(() => mockInput as unknown as Element);
            
            expect(() => {
                controlsGenerator.setControlValue('characters', ['A', 'B', 'C']);
            }).not.toThrow();
        });
    });
});
