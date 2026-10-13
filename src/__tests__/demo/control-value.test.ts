import { describe, it, expect } from 'vitest';
import { formatControlValue } from '../../demo/ui/control-value';

describe('control value formatting', () => {
    it('preserves scalar and array values for form controls', () => {
        expect(formatControlValue('rain')).toBe('rain');
        expect(formatControlValue(12)).toBe('12');
        expect(formatControlValue(false)).toBe('false');
        expect(formatControlValue(['A', 'B'])).toBe('A,B');
    });

    it('serializes color maps without losing their contents', () => {
        expect(JSON.parse(formatControlValue({ A: '#ffffff' }))).toEqual({ A: '#ffffff' });
    });
});
