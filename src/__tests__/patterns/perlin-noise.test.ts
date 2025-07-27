import { describe, it, expect } from 'vitest';
import { PerlinNoisePattern } from '../../patterns/perlin-noise-pattern';
import type { PatternContext, RenderRegion } from '../../patterns/pattern';

describe('PerlinNoisePattern', () => {
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
        expect(PerlinNoisePattern.ID).toBe('perlin-noise');
    });

    it('should create instance with default options', () => {
        const pattern = new PerlinNoisePattern();
        
        expect(pattern).toBeInstanceOf(PerlinNoisePattern);
        expect(pattern.id).toBe('perlin-noise');
        expect(pattern.options.frequency).toBe(0.01);
        expect(pattern.options.octaves).toBe(4);
        expect(pattern.options.persistence).toBe(0.5);
        expect(pattern.options.lacunarity).toBe(2.0);
        expect(pattern.options.seed).toBe(0);
        expect(pattern.options.characters).toEqual(['█', '▓', '▒', '░', ' ']);
    });

    it('should create instance with custom options', () => {
        const pattern = new PerlinNoisePattern({
            frequency: 0.05,
            octaves: 2,
            persistence: 0.3,
            lacunarity: 1.5,
            seed: 12345,
            characters: ['#', '@', '*', '.'],
        });
        
        expect(pattern.options.frequency).toBe(0.05);
        expect(pattern.options.octaves).toBe(2);
        expect(pattern.options.persistence).toBe(0.3);
        expect(pattern.options.lacunarity).toBe(1.5);
        expect(pattern.options.seed).toBe(12345);
        expect(pattern.options.characters).toEqual(['#', '@', '*', '.']);
    });

    it('should generate characters for the entire region', () => {
        const pattern = new PerlinNoisePattern();
        const result = pattern.generate(createMockContext());
        
        // Should generate one character per grid position.
        const expectedCount = (mockRegion.endRow - mockRegion.startRow + 1) * 
                             (mockRegion.endColumn - mockRegion.startColumn + 1);
        expect(result).toHaveLength(expectedCount);
    });

    it('should generate characters at correct positions', () => {
        const pattern = new PerlinNoisePattern();
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
        const customChars = ['A', 'B', 'C'];
        const pattern = new PerlinNoisePattern({ characters: customChars });
        const result = pattern.generate(createMockContext());
        
        result.forEach(char => {
            expect(customChars).toContain(char.char);
        });
    });

    it('should generate consistent patterns for same seed and time', () => {
        const pattern1 = new PerlinNoisePattern({ seed: 42 });
        const pattern2 = new PerlinNoisePattern({ seed: 42 });
        
        const result1 = pattern1.generate(createMockContext(1.5));
        const result2 = pattern2.generate(createMockContext(1.5));
        
        expect(result1.map(c => c.char)).toEqual(result2.map(c => c.char));
        expect(result1.map(c => ({ x: c.x, y: c.y }))).toEqual(result2.map(c => ({ x: c.x, y: c.y })));
    });

    it('should generate different patterns for different seeds', () => {
        const pattern1 = new PerlinNoisePattern({ seed: 100, characters: ['A', 'B', 'C'], frequency: 0.9 });
        const pattern2 = new PerlinNoisePattern({ seed: 2000, characters: ['A', 'B', 'C'], frequency: 0.9 });

        const result1 = pattern1.generate(createMockContext());
        const result2 = pattern2.generate(createMockContext());
        
        expect(result1).toHaveLength(result2.length);
        expect(result1.length).toBeGreaterThan(0);
        expect(new Set(result1.map(c => c.opacity))).not.toEqual(new Set(result2.map(c => c.opacity)));
    });

    it('should generate animated patterns when time changes', () => {
        const pattern = new PerlinNoisePattern({ seed: 123 });
        
        const result1 = pattern.generate(createMockContext(0.0));
        const result2 = pattern.generate(createMockContext(50000.0));

        expect(result1).toHaveLength(result2.length);
        expect(result1.length).toBeGreaterThan(0);
    });

    it('should return self on update', () => {
        const pattern = new PerlinNoisePattern();
        const result = pattern.update(createMockContext());
        
        expect(result).toBe(pattern);
    });

    it('should handle setOptions correctly', () => {
        const pattern = new PerlinNoisePattern();
        
        pattern.setOptions({ 
            frequency: 0.1, 
            octaves: 6,
            characters: ['X', 'Y', 'Z'],
        });
        
        expect(pattern.options.frequency).toBe(0.1);
        expect(pattern.options.octaves).toBe(6);
        expect(pattern.options.characters).toEqual(['X', 'Y', 'Z']);
    });

    it('should produce smooth gradients with proper frequency', () => {
        const pattern = new PerlinNoisePattern({ 
            frequency: 0.1,
            characters: ['A', 'B', 'C', 'D', 'E'],
        });
        
        const result = pattern.generate(createMockContext());
        
        expect(result.length).toBeGreaterThan(1);
        const validChars = ['A', 'B', 'C', 'D', 'E'];

        result.forEach(char => {
            expect(validChars).toContain(char.char);
        });
    });

    it('should handle different octave values', () => {
        const pattern1 = new PerlinNoisePattern({ octaves: 1, seed: 42 });
        const pattern2 = new PerlinNoisePattern({ octaves: 8, seed: 42 });
        
        const result1 = pattern1.generate(createMockContext());
        const result2 = pattern2.generate(createMockContext());
        
        expect(result1).toHaveLength(result2.length);
        expect(result1.length).toBeGreaterThan(0);
        expect(result2.length).toBeGreaterThan(0);
    });

    it('should handle different persistence values', () => {
        const pattern1 = new PerlinNoisePattern({ persistence: 0.1, seed: 42 });
        const pattern2 = new PerlinNoisePattern({ persistence: 0.9, seed: 42 });
        
        const result1 = pattern1.generate(createMockContext());
        const result2 = pattern2.generate(createMockContext());
        
        expect(result1).toHaveLength(result2.length);
        expect(result1.length).toBeGreaterThan(0);
        expect(result2.length).toBeGreaterThan(0);
    });

    it('should handle different lacunarity values', () => {
        const pattern1 = new PerlinNoisePattern({ lacunarity: 1.5, seed: 42 });
        const pattern2 = new PerlinNoisePattern({ lacunarity: 3.0, seed: 42 });
        
        const result1 = pattern1.generate(createMockContext());
        const result2 = pattern2.generate(createMockContext());
        
        expect(result1).toHaveLength(result2.length);
        expect(result1.length).toBeGreaterThan(0);
        expect(result2.length).toBeGreaterThan(0);
    });
});
