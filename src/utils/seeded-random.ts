/**
 * Creates a seeded random number generator.
 * @param seed - initial seed value for the generator
 * @returns A function that generates pseudo-random numbers between 0 and 1
 */
export const createSeededRandom = (seed: number) => {
    let state = Math.floor(seed) % 2147483647;
    if (state <= 0)
        state += 2147483646;

    return () => {
        state = (state * 16807) % 2147483647;
        return state / 2147483647;
    };
};
