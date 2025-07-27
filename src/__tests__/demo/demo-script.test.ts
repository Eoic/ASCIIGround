import { describe, it, expect } from 'vitest';
import { ControlsRegistry } from '../../demo/ui/controls/controls-registry';

describe('ControlsRegistry', () => {
    describe('getAllControlsSpecs', () => {
        it('should get all control specs', () => {
            const specs = ControlsRegistry.getAllControlsSpecs();
            expect(specs).toBeDefined();
            expect(Array.isArray(specs)).toBe(true);
            expect(specs.length).toBeGreaterThan(0);
        });
    });

    describe('parseOutType', () => {
        it('should parse string type', () => {
            const result = ControlsRegistry.parseOutType('test', 'string');
            expect(result).toBe('test');
        });

        it('should parse number type', () => {
            const result = ControlsRegistry.parseOutType('42', 'number');
            expect(result).toBe(42);
        });

        it('should parse boolean type - truthy', () => {
            const result = ControlsRegistry.parseOutType('true', 'boolean');
            expect(result).toBe(true);
        });

        it('should parse boolean type - falsy', () => {
            const result = ControlsRegistry.parseOutType('', 'boolean');
            expect(result).toBe(false);
        });

        it('should parse array type', () => {
            const result = ControlsRegistry.parseOutType('abc', 'array');
            expect(Array.isArray(result)).toBe(true);
            expect(result).toEqual(['a', 'b', 'c']);
        });

        it('should handle array type conversion', () => {
            const result = ControlsRegistry.parseOutType('hello', 'array');
            expect(Array.isArray(result)).toBe(true);
        });
    });

    describe('getControlSpec', () => {
        it('should get existing control spec', () => {
            const spec = ControlsRegistry.getControlSpec('fontSize');
            expect(spec).toBeDefined();
            expect(spec?.id).toBe('fontSize');
        });

        it('should return null for non-existent control', () => {
            const spec = ControlsRegistry.getControlSpec('nonexistent');
            expect(spec).toBeNull();
        });
    });

    describe('getPatternOptions', () => {
        it('should get pattern options for rain pattern', () => {
            const options = ControlsRegistry.getPatternOptions('rain');
            expect(options).toBeDefined();
            expect(typeof options).toBe('object');
        });

        it('should get pattern options for perlin pattern', () => {
            const options = ControlsRegistry.getPatternOptions('perlin-noise');
            expect(options).toBeDefined();
            expect(typeof options).toBe('object');
        });

        it('should get pattern options for static pattern', () => {
            const options = ControlsRegistry.getPatternOptions('static');
            expect(options).toBeDefined();
            expect(typeof options).toBe('object');
        });

        it('should get pattern options for dummy pattern', () => {
            const options = ControlsRegistry.getPatternOptions('dummy');
            expect(options).toBeDefined();
            expect(typeof options).toBe('object');
        });
    });

    describe('getRendererOptions', () => {
        it('should get renderer options', () => {
            const options = ControlsRegistry.getRendererOptions();
            expect(options).toBeDefined();
            expect(typeof options).toBe('object');
        });
    });

    describe('getAvailablePatterns', () => {
        it('should get available patterns', () => {
            const patterns = ControlsRegistry.getAvailablePatterns();
            expect(patterns).toBeDefined();
            expect(Array.isArray(patterns)).toBe(true);
            expect(patterns.length).toBeGreaterThan(0);
        });

        it('should include expected pattern IDs', () => {
            const patterns = ControlsRegistry.getAvailablePatterns();
            const patternIds = patterns.map(p => p.value);
            
            expect(patternIds).toContain('perlin-noise');
            expect(patternIds).toContain('rain');
            expect(patternIds).toContain('static');
            expect(patternIds).toContain('dummy');
        });
    });
});
