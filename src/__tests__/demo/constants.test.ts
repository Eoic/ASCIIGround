import { describe, it, expect } from 'vitest';
import { DEBOUNCE_INTERVAL_MS, DEBUG_INFO_UPDATE_INTERVAL_MS } from '../../demo/ui/constants';

describe('Demo Constants', () => {
    it('should have expected debounce interval', () => {
        expect(DEBOUNCE_INTERVAL_MS).toBe(50);
        expect(typeof DEBOUNCE_INTERVAL_MS).toBe('number');
    });

    it('should have expected debug info update interval', () => {
        expect(DEBUG_INFO_UPDATE_INTERVAL_MS).toBe(100);
        expect(typeof DEBUG_INFO_UPDATE_INTERVAL_MS).toBe('number');
    });
});
