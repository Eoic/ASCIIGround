import { describe, it, expect } from 'vitest';
import { ControlsRegistry } from '../../demo/ui/controls/controls-registry';

describe('ControlsRegistry additional', () => {
    it('should get control spec by id', () => {
        const spec = ControlsRegistry.getControlSpec('colorMap');
        expect(spec).not.toBeNull();
        expect(spec?.id).toBe('colorMap');
    });

    it('should return combined control specs', () => {
        const specs = ControlsRegistry.getAllControlsSpecs();
        const ids = specs.map(s => s.id);
        expect(ids).toContain('colorMap');
        expect(ids).toContain('rainDensity');
    });

    it('should parse out types correctly', () => {
        expect(ControlsRegistry.parseOutType('true', 'boolean')).toBe(true);
        expect(ControlsRegistry.parseOutType('42', 'number')).toBe(42);
        expect(ControlsRegistry.parseOutType('ab', 'array')).toEqual(['a', 'b']);
        const record = { a: '1' };
        expect(ControlsRegistry.parseOutType(record, 'record')).toEqual(record);
        expect(ControlsRegistry.parseOutType('foo', 'string')).toBe('foo');
    });

    it('should get pattern options with parsed types', () => {
        const options = ControlsRegistry.getPatternOptions('perlin-noise');
        expect(typeof options.frequency).toBe('number');
        expect(options).toHaveProperty('frequency');
    });

    it('should get renderer options with defaults', () => {
        const options = ControlsRegistry.getRendererOptions();
        expect(options).toHaveProperty('fontSize');
        expect(options).toHaveProperty('colorMap');
        expect(options.colorMap).toEqual({});
    });

    it('should list available patterns', () => {
        const patterns = ControlsRegistry.getAvailablePatterns().map(p => p.value);
        ['perlin-noise', 'rain', 'static', 'dummy'].forEach(id => expect(patterns).toContain(id));
    });
});
