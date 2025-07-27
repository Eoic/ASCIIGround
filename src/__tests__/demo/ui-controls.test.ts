import { describe, it, expect } from 'vitest';
import { ControlsRegistry } from '../../demo/ui/controls/controls-registry';

describe('UI Controls', () => {
    describe('ControlsRegistry', () => {
        it('should provide pattern controls', () => {
            const patternControls = ControlsRegistry.getPatternControls('perlin-noise');
            
            expect(patternControls).toBeDefined();
            expect(patternControls.label).toBeDefined();
            expect(patternControls.controls).toBeDefined();
            expect(Array.isArray(patternControls.controls)).toBe(true);
        });

        it('should provide renderer controls', () => {
            const rendererControls = ControlsRegistry.getRendererControls();
            
            expect(rendererControls).toBeDefined();
            expect(rendererControls.label).toBeDefined();
            expect(rendererControls.controls).toBeDefined();
            expect(Array.isArray(rendererControls.controls)).toBe(true);
        });

        it('should provide pattern options', () => {
            expect(() => {
                ControlsRegistry.getPatternControls('perlin-noise');
            }).not.toThrow();
        });

        it('should handle different pattern types', () => {
            const patternTypes = ['perlin-noise', 'rain', 'static', 'dummy'];
            
            patternTypes.forEach(patternType => {
                expect(() => {
                    ControlsRegistry.getPatternControls(patternType);
                }).not.toThrow();
            });
        });

        it('should handle invalid pattern type gracefully', () => {
            expect(() => {
                ControlsRegistry.getPatternControls('invalid-pattern');
            }).toThrow('Pattern controls for "invalid-pattern" not found.');
        });
    });

    describe('Registry integration', () => {
        it('should provide consistent pattern IDs', () => {
            const validPatterns = ['perlin-noise', 'rain', 'static', 'dummy'];
            
            validPatterns.forEach(patternId => {
                const controls = ControlsRegistry.getPatternControls(patternId);
                expect(controls).toBeDefined();
                expect(controls.pattern).toBeDefined();
                expect(typeof controls.pattern).toBe('function');
            });
        });

        it('should provide renderer controls with expected structure', () => {
            const rendererControls = ControlsRegistry.getRendererControls();
            expect(rendererControls.controls.length).toBeGreaterThan(0);
            
            rendererControls.controls.forEach(control => {
                expect(control.id).toBeDefined();
                expect(control.label).toBeDefined();
                expect(control.type).toBeDefined();
                expect(control.category).toBe('renderer');
            });
        });

        it('should provide pattern controls with expected structure', () => {
            const patternControls = ControlsRegistry.getPatternControls('perlin-noise');
            expect(patternControls.controls.length).toBeGreaterThan(0);
            
            patternControls.controls.forEach(control => {
                expect(control.id).toBeDefined();
                expect(control.label).toBeDefined();
                expect(control.type).toBeDefined();
                expect(['pattern', 'renderer']).toContain(control.category);
            });
        });
    });

    describe('Control specifications', () => {
        it('should have valid control types', () => {
            const validTypes = ['number', 'text', 'color', 'select', 'range', 'checkbox', 'textarea'];
            const rendererControls = ControlsRegistry.getRendererControls();
            
            rendererControls.controls.forEach(control => {
                expect(validTypes).toContain(control.type);
            });
        });

        it('should have valid output types', () => {
            const validOutTypes = ['string', 'number', 'boolean', 'array'];
            const rendererControls = ControlsRegistry.getRendererControls();
            
            rendererControls.controls.forEach(control => {
                expect(validOutTypes).toContain(control.outType);
            });
        });

        it('should provide default values for all controls', () => {
            const rendererControls = ControlsRegistry.getRendererControls();
            
            rendererControls.controls.forEach(control => {
                expect(control.value).toBeDefined();
            });
        });
    });

    describe('Pattern-specific controls', () => {
        it('should provide rain pattern controls', () => {
            const rainControls = ControlsRegistry.getPatternControls('rain');
            
            expect(rainControls.label).toBeDefined();
            expect(rainControls.controls.length).toBeGreaterThan(0);
            
            const densityControl = rainControls.controls.find(c => c.id === 'rainDensity');
            expect(densityControl).toBeDefined();
        });

        it('should provide perlin noise pattern controls', () => {
            const perlinControls = ControlsRegistry.getPatternControls('perlin-noise');
            
            expect(perlinControls.label).toBeDefined();
            expect(perlinControls.controls.length).toBeGreaterThan(0);
            
            const frequencyControl = perlinControls.controls.find(c => c.id === 'frequency');
            expect(frequencyControl).toBeDefined();
        });

        it('should provide static pattern controls', () => {
            const staticControls = ControlsRegistry.getPatternControls('static');
            
            expect(staticControls.label).toBeDefined();
            expect(staticControls.controls.length).toBeGreaterThan(0);
            
            const charactersControl = staticControls.controls.find(c => c.id === 'characters');
            expect(charactersControl).toBeDefined();
        });

        it('should provide dummy pattern controls', () => {
            const dummyControls = ControlsRegistry.getPatternControls('dummy');
            
            expect(dummyControls.label).toBeDefined();
            expect(dummyControls.controls).toBeDefined();
            expect(Array.isArray(dummyControls.controls)).toBe(true);
        });
    });
});
