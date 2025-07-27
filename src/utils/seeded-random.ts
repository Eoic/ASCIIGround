/**
 * Creates a seeded random number generator.
 * @param seed - initial seed value for the generator
 * @returns A function that generates pseudo-random numbers between 0 and 1
 */
export const createSeededRandom = (seed: number) => {
    let state = seed === 0 ? 1 : seed;

    return () => {
        state = (state * 16807) % 2147483647;
        return state / 2147483647;
    };
};
