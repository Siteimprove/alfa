/**
 * @public
 */
export type RNG = () => number;

/**
 * PRNG taken from
 * {@link https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript}
 *
 * @internal
 */

export function seedableRNG(seed: number): RNG {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * @public
 */
export interface Controller {
  iterations: number;
  wrapper: (iteration: number, rng: RNG) => RNG;
  seed?: number;
}

/**
 * @internal
 */
export const defaultController: Controller = {
  iterations: 1,
  wrapper: (iteration: number, rng) => rng,
};
