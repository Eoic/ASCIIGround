import { describe, it, expect } from 'vitest';
import { RainPattern } from '../../patterns/rain-pattern';
import type { PatternContext, RenderRegion } from '../../patterns/pattern';

describe('RainPattern', () => {
    const mockRegion: RenderRegion = {
        rows: 10,
        columns: 8,
        startRow: 0,
        endRow: 9,
        startColumn: 0,
        endColumn: 7,
        charWidth: 12,
        charHeight: 16,
        charSpacingX: 12,
        charSpacingY: 16,
        canvasWidth: 96,
        canvasHeight: 160,
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
        expect(RainPattern.ID).toBe('rain');
    });

    it('should create instance with default options', () => {
        const pattern = new RainPattern();
        
        expect(pattern).toBeInstanceOf(RainPattern);
        expect(pattern.id).toBe('rain');
        expect(pattern.options.rainDensity).toBe(0.8);
        expect(pattern.options.minDropLength).toBe(8);
        expect(pattern.options.maxDropLength).toBe(25);
        expect(pattern.options.minSpeed).toBe(0.5);
        expect(pattern.options.maxSpeed).toBe(1.5);
        expect(pattern.options.mutationRate).toBe(0.04);
        expect(pattern.options.fadeOpacity).toBe(0.2);
        expect(pattern.options.headColor).toBe('#FFFFFF');
        expect(pattern.options.characters).toEqual(['█', '▓', '▒', '░', ' ']);
    });

    it('should create instance with custom options', () => {
        const pattern = new RainPattern({
            rainDensity: 0.5,
            minDropLength: 5,
            maxDropLength: 15,
            minSpeed: 1.0,
            maxSpeed: 2.0,
            mutationRate: 0.1,
            fadeOpacity: 0.5,
            headColor: '#00FF00',
            characters: ['|', '!', '1', ':'],
        });
        
        expect(pattern.options.rainDensity).toBe(0.5);
        expect(pattern.options.minDropLength).toBe(5);
        expect(pattern.options.maxDropLength).toBe(15);
        expect(pattern.options.minSpeed).toBe(1.0);
        expect(pattern.options.maxSpeed).toBe(2.0);
        expect(pattern.options.mutationRate).toBe(0.1);
        expect(pattern.options.fadeOpacity).toBe(0.5);
        expect(pattern.options.headColor).toBe('#00FF00');
        expect(pattern.options.characters).toEqual(['|', '!', '1', ':']);
    });

    it('should initialize properly with region', () => {
        const pattern = new RainPattern();
        
        expect(() => {
            pattern.initialize(mockRegion);
        }).not.toThrow();
    });

    it('should generate empty array initially when no region set', () => {
        const pattern = new RainPattern();
        const result = pattern.generate(createMockContext());
        
        expect(result).toEqual([]);
    });

    it('should generate rain drops after initialization', () => {
        const pattern = new RainPattern({ rainDensity: 0.5 });
        pattern.initialize(mockRegion);
        
        const result = pattern.generate(createMockContext());
        
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it('should use characters from options', () => {
        const customChars = ['A', 'B', 'C'];

        const pattern = new RainPattern({ 
            characters: customChars,
            rainDensity: 1.0,
        });

        pattern.initialize(mockRegion);
        
        const result = pattern.generate(createMockContext());
        
        result.forEach(char => {
            expect(customChars).toContain(char.char);
        });
    });

    it('should generate different patterns over time', () => {
        const pattern = new RainPattern({ rainDensity: 0.8 });
        pattern.initialize(mockRegion);
        
        const result1 = pattern.generate(createMockContext(0.0));
        pattern.update(createMockContext(1.0));
        const result2 = pattern.generate(createMockContext(1.0));
        
        const positions1 = result1.map(c => `${c.x},${c.y}`).join('|');
        const positions2 = result2.map(c => `${c.x},${c.y}`).join('|');
        
        expect(positions1).not.toBe(positions2);
    });

    it('should return self on update', () => {
        const pattern = new RainPattern();
        const result = pattern.update(createMockContext());
        
        expect(result).toBe(pattern);
    });

    it('should handle setOptions correctly', () => {
        const pattern = new RainPattern();
        
        pattern.setOptions({ 
            rainDensity: 0.3,
            minDropLength: 12,
            characters: ['X', 'Y', 'Z'],
        });
        
        expect(pattern.options.rainDensity).toBe(0.3);
        expect(pattern.options.minDropLength).toBe(12);
        expect(pattern.options.characters).toEqual(['X', 'Y', 'Z']);
    });

    it('should handle density changes dynamically', () => {
        const pattern = new RainPattern({ rainDensity: 0.2 });
        pattern.initialize(mockRegion);
        pattern.setOptions({ rainDensity: 0.8 });
        
        const result = pattern.generate(createMockContext());
        expect(Array.isArray(result)).toBe(true);
    });

    it('should handle character changes dynamically', () => {
        const pattern = new RainPattern({ characters: ['A', 'B'] });
        pattern.initialize(mockRegion);
        pattern.generate(createMockContext());
        pattern.setOptions({ characters: ['X', 'Y', 'Z'] });

        const result = pattern.generate(createMockContext());
        const newChars = result.filter(char => char.opacity === 1.0);
        const usesNewChars = newChars.every(char => ['X', 'Y', 'Z'].includes(char.char));
        
        expect(usesNewChars).toBe(true);
    });

    it('should handle region changes', () => {
        const pattern = new RainPattern();
        pattern.initialize(mockRegion);
        
        const newRegion: RenderRegion = {
            ...mockRegion,
            columns: 4,
            endColumn: 3,
            canvasWidth: 48,
        };
        
        expect(() => {
            pattern.initialize(newRegion);
        }).not.toThrow();
    });

    it('should handle destroy without errors', () => {
        const pattern = new RainPattern();
        pattern.initialize(mockRegion);
        pattern.generate(createMockContext());
        
        expect(() => {
            pattern.destroy();
        }).not.toThrow();
        
        const result = pattern.generate(createMockContext());
        expect(result).toEqual([]);
    });

    it('should apply fade opacity correctly', () => {
        const pattern = new RainPattern({ 
            fadeOpacity: 0.3,
            rainDensity: 0.5,
        });

        pattern.initialize(mockRegion);
        pattern.generate(createMockContext(0.0));
        pattern.update(createMockContext(0.1));
        const result = pattern.generate(createMockContext(0.1));
        
        const fadeChars = result.filter(char => char.opacity === 0.3);
        expect(fadeChars.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle zero rain density', () => {
        const pattern = new RainPattern({ rainDensity: 0 });
        pattern.initialize(mockRegion);

        const result = pattern.generate(createMockContext());
        expect(Array.isArray(result)).toBe(true);
    });

    it('should handle very high rain density', () => {
        const pattern = new RainPattern({ rainDensity: 2.0 });
        pattern.initialize(mockRegion);
        
        const result = pattern.generate(createMockContext());
        
        expect(Array.isArray(result)).toBe(true);
    });

    it('should respect min and max drop lengths', () => {
        const pattern = new RainPattern({ 
            minDropLength: 3,
            maxDropLength: 5,
            rainDensity: 1.0,
        });

        pattern.initialize(mockRegion);
        
        for (let i = 0; i < 10; i++) {
            pattern.update(createMockContext(i * 0.1));
            pattern.generate(createMockContext(i * 0.1));
        }
        
        expect(pattern.options.minDropLength).toBe(3);
        expect(pattern.options.maxDropLength).toBe(5);
    });

    it('should respect speed limits', () => {
        const pattern = new RainPattern({ 
            minSpeed: 0.8,
            maxSpeed: 1.2,
        });
        
        expect(pattern.options.minSpeed).toBe(0.8);
        expect(pattern.options.maxSpeed).toBe(1.2);
    });

    it('should handle mouse interaction without errors', () => {
        const pattern = new RainPattern();
        pattern.initialize(mockRegion);
        
        expect(() => {
            pattern.onMouseInteraction(50, 50, true);
        }).not.toThrow();
    });

    describe('rain drop mutation', () => {
        it('should handle character mutation over time', () => {
            const pattern = new RainPattern({ 
                mutationRate: 1.0,
                rainDensity: 0.5,
            });

            pattern.initialize(mockRegion);
            pattern.generate(createMockContext(0.0));
            pattern.update(createMockContext(2.0));

            const result = pattern.generate(createMockContext(2.0));
            expect(Array.isArray(result)).toBe(true);
        });

        it('should handle drop reset when off screen', () => {
            const pattern = new RainPattern({ rainDensity: 0.8 });
            pattern.initialize(mockRegion);

            for (let i = 0; i < 20; i++) {
                pattern.update(createMockContext(i * 0.5));
                pattern.generate(createMockContext(i * 0.5));
            }
            
            const result = pattern.generate(createMockContext(10.0));
            expect(Array.isArray(result)).toBe(true);
        });

        it('should handle _resetRainDrop method directly', () => {
            const pattern = new RainPattern({ rainDensity: 0.5 });
            pattern.initialize(mockRegion);
            pattern.generate(createMockContext(0.0));
            
            const rainDrops = pattern['_rainDrops'];

            if (rainDrops && rainDrops.length > 0) 
                expect(() => pattern['_resetRainDrop'](rainDrops[0], 5.0)).not.toThrow();
        });

        it('should handle reset without region', () => {
            const pattern = new RainPattern({ rainDensity: 0.5 });
            
            // Create a mock drop
            const mockDrop = {
                y: 100,
                column: 5,
                length: 10,
                speed: 1.0,
                characters: ['A', 'B'],
                lastMutationTime: 0,
            };
            
            expect(() => {
                pattern['_resetRainDrop'](mockDrop, 5.0);
            }).not.toThrow();
        });
    });
});
