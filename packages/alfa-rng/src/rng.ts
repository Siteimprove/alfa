/// <reference lib="dom" />
/**
 * @public
 */
export class RNG<T = number> {
  public static of(seed: number): RNG<number> {
    return new RNG(seedableRNG(seed));
  }

  private _rng: () => T;

  protected constructor(rng: () => T) {
    this._rng = rng;
  }

  public get rng(): () => T {
    return this._rng;
  }
}

/**
 * PRNG taken from
 * {@link https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript}
 */
function seedableRNG(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const foo = RNG.of(1);
console.log(foo.rng());
