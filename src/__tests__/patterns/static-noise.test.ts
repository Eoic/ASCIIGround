import { describe, it, expect } from 'vitest';
import { StaticNoisePattern } from '../../patterns/static-noise-pattern';
import type { PatternContext, RenderRegion } from '../../patterns/pattern';

describe('StaticNoisePattern', () => {
    const mockRegion: RenderRegion = {
        rows: 3,
        columns: 4,
        startRow: 0,
        endRow: 2,
        startColumn: 0,
        endColumn: 3,
        charWidth: 12,
        charHeight: 16,
        charSpacingX: 12,
        charSpacingY: 16,
        canvasWidth: 48,
        canvasHeight: 48,
    };

    const createMockContext = (animationTime = 1.0): PatternContext => ({
        time: animationTime,
        deltaTime: 0.016,
        animationTime,
        mouseX: 0,
        mouseY: 0,
        clicked: false,
        isAnimating: true,
        animationSpeed: 1.0,
        region: mockRegion,
    });

    it('should have correct ID', () => {
        expect(StaticNoisePattern.ID).toBe('static');
    });

    it('should create instance with default options', () => {
        const pattern = new StaticNoisePattern();
        
        expect(pattern).toBeInstanceOf(StaticNoisePattern);
        expect(pattern.id).toBe('static');
        expect(pattern.options.seed).toBe(0);
        expect(pattern.options.characters).toEqual(['█', '▓', '▒', '░', ' ']);
    });

    it('should create instance with custom options', () => {
        const pattern = new StaticNoisePattern({
            seed: 12345,
            characters: ['#', '@', '*', '.'],
        });
        
        expect(pattern.options.seed).toBe(12345);
        expect(pattern.options.characters).toEqual(['#', '@', '*', '.']);
    });

    it('should generate characters for the entire region', () => {
        const pattern = new StaticNoisePattern();
        const result = pattern.generate(createMockContext());
        
        const expectedCount = (mockRegion.endRow - mockRegion.startRow + 1) * 
                             (mockRegion.endColumn - mockRegion.startColumn + 1);
        expect(result).toHaveLength(expectedCount);
    });

    it('should generate characters at correct positions', () => {
        const pattern = new StaticNoisePattern();
        const result = pattern.generate(createMockContext());
        
        expect(result[0].x).toBe(0);
        expect(result[0].y).toBe(0);
        
        result.forEach((char, index) => {
            const row = Math.floor(index / (mockRegion.endColumn - mockRegion.startColumn + 1));
            const col = index % (mockRegion.endColumn - mockRegion.startColumn + 1);
            
            expect(char.x).toBe(col * mockRegion.charSpacingX);
            expect(char.y).toBe(row * mockRegion.charSpacingY);
        });
    });

    it('should use characters from options', () => {
        const customChars = ['A', 'B'];
        const pattern = new StaticNoisePattern({ characters: customChars });
        const result = pattern.generate(createMockContext());
        
        result.forEach(char => {
            expect(customChars.includes(char.char) || char.char === ' ').toBe(true);
        });
    });

    it('should generate different patterns for different animation times', () => {
        const pattern = new StaticNoisePattern({ seed: 42 });
        const result1 = pattern.generate(createMockContext(0.0));
        const result2 = pattern.generate(createMockContext(1.0));
        const chars1 = result1.map(c => c.char).join('');
        const chars2 = result2.map(c => c.char).join('');
        
        expect(chars1).not.toBe(chars2);
    });

    it('should generate consistent patterns for same animation time and seed', () => {
        const pattern1 = new StaticNoisePattern({ seed: 123 });
        const pattern2 = new StaticNoisePattern({ seed: 123 });
        const result1 = pattern1.generate(createMockContext(2.5));
        const result2 = pattern2.generate(createMockContext(2.5));
        
        expect(result1.map(c => c.char)).toEqual(result2.map(c => c.char));
    });

    it('should return self on update', () => {
        const pattern = new StaticNoisePattern();
        const result = pattern.update(createMockContext());
        
        expect(result).toBe(pattern);
    });

    it('should handle setOptions correctly', () => {
        const pattern = new StaticNoisePattern();
        
        pattern.setOptions({ seed: 999, characters: ['X', 'Y'] });
        
        expect(pattern.options.seed).toBe(999);
        expect(pattern.options.characters).toEqual(['X', 'Y']);
    });

    it('should handle empty characters array gracefully', () => {
        const pattern = new StaticNoisePattern({ characters: [] });
        const result = pattern.generate(createMockContext());
        
        result.forEach(char => {
            expect(char.char).toBe(' ');
        });
    });

    it('should use time-based seed variation', () => {
        const pattern = new StaticNoisePattern({ seed: 100 });
        const result1 = pattern.generate(createMockContext(1.05));
        const result2 = pattern.generate(createMockContext(1.05));
        
        expect(result1.map(c => c.char)).toEqual(result2.map(c => c.char));

        const result3 = pattern.generate(createMockContext(1.15));
        const chars1 = result1.map(c => c.char).join('');
        const chars3 = result3.map(c => c.char).join('');

        expect(chars1).not.toBe(chars3);
    });
});
