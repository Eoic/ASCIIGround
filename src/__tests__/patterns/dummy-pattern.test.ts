import { describe, it, expect } from 'vitest';
import { DummyPattern } from '../../patterns/dummy-pattern';
import type { PatternContext, RenderRegion } from '../../patterns/pattern';

describe('DummyPattern', () => {
    const mockRegion: RenderRegion = {
        rows: 10,
        columns: 20,
        startRow: 0,
        endRow: 10,
        startColumn: 0,
        endColumn: 20,
        charWidth: 12,
        charHeight: 16,
        charSpacingX: 12,
        charSpacingY: 16,
        canvasWidth: 240,
        canvasHeight: 160,
    };

    const mockContext: PatternContext = {
        time: 1.0,
        deltaTime: 0.016,
        animationTime: 1.0,
        mouseX: 0,
        mouseY: 0,
        clicked: false,
        isAnimating: true,
        animationSpeed: 1.0,
        region: mockRegion,
    };

    it('should have correct ID', () => {
        expect(DummyPattern.ID).toBe('dummy');
    });

    it('should create instance with default options', () => {
        const pattern = new DummyPattern();
        
        expect(pattern).toBeInstanceOf(DummyPattern);
        expect(pattern.id).toBe('dummy');
        expect(pattern.options.characters).toEqual(['█', '▓', '▒', '░', ' ']);
    });

    it('should create instance with custom options', () => {
        const pattern = new DummyPattern({
            characters: ['A', 'B', 'C'],
        });
        
        expect(pattern.options.characters).toEqual(['A', 'B', 'C']);
    });

    it('should generate empty character array', () => {
        const pattern = new DummyPattern();
        const result = pattern.generate(mockContext);
        
        expect(result).toEqual([]);
        expect(Array.isArray(result)).toBe(true);
    });

    it('should return self on update', () => {
        const pattern = new DummyPattern();
        const result = pattern.update(mockContext);
        
        expect(result).toBe(pattern);
    });

    it('should handle setOptions correctly', () => {
        const pattern = new DummyPattern();
        
        pattern.setOptions({ characters: ['X', 'Y', 'Z'] });
        
        expect(pattern.options.characters).toEqual(['X', 'Y', 'Z']);
    });

    it('should manage isDirty flag', () => {
        const pattern = new DummyPattern();
        
        expect(pattern.isDirty).toBe(false);
        
        pattern.setOptions({ characters: ['1', '2', '3'] });
        expect(pattern.isDirty).toBe(true);
        
        pattern.isDirty = false;
        expect(pattern.isDirty).toBe(false);
    });

    it('should handle mouse interaction without errors', () => {
        const pattern = new DummyPattern();
        
        expect(() => {
            pattern.onMouseInteraction(10, 20, true);
        }).not.toThrow();
    });

    it('should handle initialization without errors', () => {
        const pattern = new DummyPattern();
        
        expect(() => {
            pattern.initialize(mockRegion);
        }).not.toThrow();
    });

    it('should handle destruction without errors', () => {
        const pattern = new DummyPattern();
        
        expect(() => {
            pattern.destroy();
        }).not.toThrow();
    });
});
