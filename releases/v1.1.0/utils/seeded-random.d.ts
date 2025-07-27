/**
 * Creates a seeded random number generator.
 * @param seed - initial seed value for the generator
 * @returns A function that generates pseudo-random numbers between 0 and 1
 */
export declare const createSeededRandom: (seed: number) => () => number;
