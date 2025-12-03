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

  public zip<U, V>(
    this: RNGFactory<Array<U>>,
    other: RNGFactory<Array<V>>,
  ): RNGFactory<Array<[U, V]>> {
    return new RNGFactory(this._seed, () => {
      const arrayA = this._rng();
      const arrayB = other._rng();

      const result: Array<[U, V]> = [];

      // We can't use Array.zip here as it would prevent us from using the RNG
      // in alfa-array tests…
      for (let i = 0; i < Math.min(arrayA.length, arrayB.length); i++) {
        result.push([arrayA[i], arrayB[i]]);
      }

      return result;
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

  private readonly _rand: () => T;
  private readonly _seed: number;
  private _iterations: number;

  protected constructor(seed: number, rng: () => T) {
    this._seed = seed;
    this._iterations = 0;

    this._rand = () => {
      this._iterations++;
      return rng();
    };
  }

  /**
   * Generate a random number.
   *
   * @privateRemarks
   * This is a getter return a 0-arity function. So, it is used as `rng.rand()`
   * which matches the syntax of usual `rand()` functions.
   */
  public get rand(): () => T {
    return this._rand;
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

/**
 * @public
 */
export namespace RNG {
  /**
   * Seedable RNG returning a number between 0 (included) and 1 (excluded).
   *
   * @remarks
   * This RNG is decent but not crypto-safe.
   */
  export function standard(seed?: number): RNGFactory<number> {
    return RNGFactory.of(seed);
  }

  /**
   * @remarks
   * Must have 0 ⩽ value \< 1.
   * Result will be 0 ⩽ value \< max.
   *
   * @internal
   */
  function toInteger(
    max: number = Number.MAX_SAFE_INTEGER,
  ): (value: number) => number {
    return (value) => Math.floor(value * max);
  }

  /**
   * Seedable RNG returning an integer between 0 (included) and max (excluded).
   *
   * @remarks
   * This RNG is decent but not crypto-safe.
   */
  export function integer(
    max: number = Number.MAX_SAFE_INTEGER,
    seed?: number,
  ): RNGFactory<number> {
    return RNGFactory.of(seed).map(toInteger(max));
  }

  function toHex(value: number): string {
    return value.toString(16);
  }

  /**
   * Seedable RNG returning a hex string of a given length.
   *
   * @remarks
   * This RNG is decent but not crypto-safe.
   */
  export function hexString(length: number, seed?: number): RNGFactory<string> {
    return RNGFactory.of(seed)
      .map(toInteger(16))
      .map(toHex)
      .group(length)
      .map((group) => group.join(""));
  }
}
