import { describe, it, expect } from 'vitest';
import { createSeededRandom } from '../../utils/seeded-random';

describe('createSeededRandom', () => {
    it('should create a deterministic random number generator', () => {
        const random1 = createSeededRandom(12345);
        const random2 = createSeededRandom(12345);
        const sequence1 = [random1(), random1(), random1()];
        const sequence2 = [random2(), random2(), random2()];

        expect(sequence1).toEqual(sequence2);
    });

    it('should produce different sequences for different seeds', () => {
        const random1 = createSeededRandom(12345);
        const random2 = createSeededRandom(54321);
        const sequence1 = [random1(), random1(), random1()];
        const sequence2 = [random2(), random2(), random2()];

        expect(sequence1).not.toEqual(sequence2);
    });

    it('should generate numbers between 0 and 1', () => {
        const random = createSeededRandom(42);

        for (let i = 0; i < 100; i++) {
            const value = random();
            expect(value).toBeGreaterThanOrEqual(0);
            expect(value).toBeLessThanOrEqual(1);
        }
    });

    it('should handle seed value of 0 by converting to 1', () => {
        const random = createSeededRandom(0);
        const value = random();
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThanOrEqual(1);
    });

    it('should produce consistent sequences across multiple calls', () => {
        const random = createSeededRandom(999);
        const firstCall = random();
        const secondCall = random();
        const thirdCall = random();
        const randomReset = createSeededRandom(999);

        expect(randomReset()).toBe(firstCall);
        expect(randomReset()).toBe(secondCall);
        expect(randomReset()).toBe(thirdCall);
    });

    it('should generate different values in sequence', () => {
        const random = createSeededRandom(777);
        const values = [];

        for (let i = 0; i < 10; i++)
            values.push(random());

        const uniqueValues = new Set(values);
        expect(uniqueValues.size).toBe(values.length);
    });
});
