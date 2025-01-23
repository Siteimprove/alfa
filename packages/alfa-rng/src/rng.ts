/// <reference lib="dom" />
import type { Functor } from "@siteimprove/alfa-functor";
import type { Mapper } from "@siteimprove/alfa-mapper";

/**
 * A factory for simple RNG. This creates a functorial factory where results can
 * be further mapped; once the #create() method is called the RNG is frozen and
 * cannot be mapped anymore; before it cannot be called.
 *
 * @remarks
 * The core of the RNG is taken from
 * {@link https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript}
 * {@link https://gist.github.com/tommyettinger/46a874533244883189143505d203312c}
 *
 * This is not a crypto-safe RNG. Use only for low-security needs.
 *
 * The RNG seed and iterations count can be inspected, this allows to reproduce
 * any sequence of random numbers by using the same seed and number of
 * iterations. This is notably intended to allow for deterministic debugging.
 *
 * Per nature of the goal we have here, the RNG class **dose not** respect
 * Alfa's Architecture Decision 6: Use pure functions, avoid hidden side effects.
 * {@link https://github.com/Siteimprove/alfa/blob/main/docs/architecture/decisions/adr-006.md}
 * The RNG has an internal state and works by side effect, it does not have referential transparency.
 *
 * @public
 */
export class RNGFactory<T = number> implements Functor<T> {
  /**
   * Create a RNG that returns a number between 0 and 1.
   */
  public static of(seed: number = (Math.random() * 2 ** 32) >>> 0): RNGFactory {
    const rng = RNGFactory.seedableRNG(seed);
    return new RNGFactory(seed, rng);
  }

  private readonly _rng: () => T;
  private readonly _seed: number;

  protected constructor(seed: number, rng: () => T) {
    this._seed = seed;
    this._rng = rng;
  }

  /**
   * What was the seed used to initialize the RNG.
   */
  public get seed(): number {
    return this._seed;
  }

  public map<U>(mapper: Mapper<T, U>): RNGFactory<U> {
    return new RNGFactory(this._seed, () => mapper(this._rng()));
  }

  public group(size: number): RNGFactory<Array<T>> {
    return new RNGFactory(this._seed, () => {
      const group: Array<T> = [];

      for (let i = 0; i < size; i++) {
        group.push(this._rng());
      }

      return group;
    });
  }

  public create(): RNG<T> {
    return RNG.of(this._seed, this._rng);
  }

  /**
   * Mulberry32 PRNG taken from
   * {@link https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript}
   */
  private static seedableRNG(seed: number): () => number {
    return function rng() {
      let t = (seed += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
}

/**
 * A simple static RNG.
 *
 * @remarks
 * Use the RNGFactory class to create the RNG, piling up any transformations
 * needed to produce the result.
 *
 * @public
 */
export class RNG<T = number> {
  /**
   * Create a RNG.
   *
   * @remarks
   * Do not use, prefer using RNGFactory#create().
   */
  public static of<T = number>(seed: number, rng: () => T): RNG<T> {
    // Burning through some iterations improves the entropy of the RNG on sparse
    // seeds and similar seeds. See linked Stack Overflow article.
    for (let i = 0; i < 20; i++) {
      rng();
    }

    return new RNG(seed, rng);
  }

  private readonly _rng: () => T;
  private readonly _seed: number;
  private _iterations: number;

  protected constructor(seed: number, rng: () => T) {
    this._seed = seed;
    this._iterations = 0;

    this._rng = () => {
      this._iterations++;
      return rng();
    };
  }

  /**
   * The RNG itself
   */
  public get rng(): () => T {
    return this._rng;
  }

  /**
   * What was the seed used to initialize the RNG.
   */
  public get seed(): number {
    return this._seed;
  }

  /**
   * How many times the RNG has been called so far
   */
  public get iterations(): number {
    return this._iterations;
  }
}

const foo = RNGFactory.of(1).group(3).create();
console.log(foo.rng());
console.log(foo.iterations);
console.log(foo.rng());
console.log(foo.iterations);
console.log(foo.rng());
console.log(foo.iterations);

const bar = RNGFactory.of(1).create().rng;
console.log(bar());
console.log(bar());
console.log(bar());
