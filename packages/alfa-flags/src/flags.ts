import { Array } from "@siteimprove/alfa-array";
import type { Equatable } from "@siteimprove/alfa-equatable";

import type * as json from "@siteimprove/alfa-json";
import { Map } from "@siteimprove/alfa-map";

/**
 * Class for modelling set of boolean flags.
 * Prefer using `Flags.named` where possible.
 *
 * @remarks
 * Flags are stored as bits in a single number. Due to Javascript limitation
 * on bitwise operations, this means that a maximum of 32 flags can be handled.
 * We currently limit the class at a maximum of 8 flags since it fits our needs.
 *
 * @public
 */
export class Flags<
    K extends string = string,
    F extends Flags.allFlags = Flags.allFlags,
  >
  implements Equatable, json.Serializable<Flags.JSON<K>>
{
  /**
   * A compact representation of the set of flags as a number
   *
   * @privateRemarks
   * We usually have protected fields and getters for these cases. However,
   * this makes TS unhappy about the class factory `named`.
   * {@link https://github.com/microsoft/TypeScript/issues/17744}
   * We could (should?) craft the correct type of the class for the factory to
   * return. However, given the dynamic nature of it (with the named fields),
   * this gets very tricky. Given that this field is just a number, it is easier
   * to make it public and forgo the getter.
   */
  public readonly value: number;
  // Same here, should be `protected`, with a getter.
  public readonly kind: K;

  protected constructor(kind: K, value: number) {
    this.kind = kind;
    this.value = value;
  }

  /**
   * Test whether a given flag is present (or set) in the set of flags
   */
  public has(flag: F): boolean {
    // If the flag is 0, we are testing for the absence of any flag.
    // Otherwise, we are testing for the presence of the flag.
    return flag === 0 ? this.value === 0 : (this.value & flag) === flag;
  }

  /**
   * Test whether a given flag is present (or set) in the set of flags
   */
  public isSet = this.has;

  /**
   * Adds a list of flags to the set, and return a new one.
   */
  public add(...flags: Array<F>): this {
    return new (<typeof Flags>this.constructor)(
      this.kind,
      this.value | Flags.reduce(...flags),
    ) as this;
  }

  /**
   * Adds a list of flags to the set (aka sets the flags), and return a new one.
   */
  public set = this.add;

  /**
   * Removes a list of flags from the set, and return a new one.
   */
  public remove(...flags: Array<F>): this {
    return new (<typeof Flags>this.constructor)(
      this.kind,
      this.value & ~Flags.reduce(...flags),
    ) as this;
  }

  /**
   * Removes a list of flags to the set (aka unsets the flags), and return a
   * new one.
   */
  public unset = this.remove;

  /**
   * Test whether a set of flags exactly contains the listed flags.
   */
  public is(...flags: Array<F>): boolean {
    return this.value === Flags.reduce(...flags);
  }

  public equals(value: Flags): boolean;
  public equals(value: unknown): value is this;
  public equals(value: unknown): boolean {
    return (
      value instanceof Flags &&
      this.kind === value.kind &&
      this.value === value.value
    );
  }

  public toJSON(): Flags.JSON<K> {
    return { type: "flags", kind: this.kind, value: this.value };
  }
}

/**
 * @public
 */
export namespace Flags {
  /**
   * Reduces a list of flags into a single number representing all of them
   * (with only the corresponding bits set to 1).
   *
   * @internal
   */
  export function reduce(...flags: Array<number>): number {
    return Array.reduce(flags, (prev: number, cur) => prev | cur, 0);
  }

  export interface JSON<K extends string = string> {
    [key: string]: json.JSON;
    type: "flags";
    kind: K;
    value: number;
  }

  /**
   * Individual flags are numbers with at most one bit set to 1, i.e. powers of
   * two.
   * Since we do not currently need more than 8 flags, we can safely restrict
   * this union.
   */
  const allFlagsArray = [1, 2, 4, 8, 16, 32, 64, 128] as const;
  // this should be `typeof allFlagsArray` but TS struggles with it, probably
  // due to it appearing not static enough for deep inference.
  type NonZeroFlags = [1, 2, 4, 8, 16, 32, 64, 128];

  /**
   * @internal
   */
  export type allFlags = 0 | (typeof allFlagsArray)[number];

  const maxFlag = allFlagsArray.length;

  /**
   * Turns ["a", "b", "c"] into \{ a: X; b: X; c: X \}
   */
  type KeyedByArray<A extends Array<string>, X> = { [key in A[number]]: X };

  /**
   * Keep the first Bound.length types in A (or all if less).
   * Using an array for the bound just makes the type easier since there is no
   * arithmetic on the `number` type.
   * This effectively treats Bound as a unary number.
   */
  type Shorten<
    T,
    A extends ReadonlyArray<T>,
    Bound extends ReadonlyArray<any>,
  > = A extends [infer AHead, ...infer ATail extends ReadonlyArray<T>]
    ? Bound extends [any, ...infer BTail extends ReadonlyArray<any>]
      ? [AHead, ...Shorten<T, ATail, BTail>]
      : []
    : [];

  /**
   * Only keep the first 8 elements of the array (or all if less).
   *
   * @remarks
   * The actual numbers are not used, but keeping powers of 2 stays in line with
   * how flags are actually implemented, so it is easier to reason about.
   *
   * We actually want to keep the first `maxFlag` values, but can't use that
   * directly. Hence, these two must be kept in sync!
   */
  type FirstEight<T, A extends ReadonlyArray<T>> = Shorten<T, A, NonZeroFlags>;

  // This replaces the type of `of` in its argument. We cannot just use `&` because
  // it would instead create an overload with the original `of` signature (without
  // the getters).
  type ReplaceFactories<
    T extends { of: any; empty: any },
    Name extends string,
    F extends allFlags,
    Instance,
  > = {
    [key in keyof T]: key extends "of"
      ? (...flags: Array<F | Name>) => Instance
      : key extends "empty"
        ? Instance
        : T[key];
  };

  export function named<K extends string, A extends Array<string>>(
    kind: K,
    ...flags: A
  ) {
    /************* Prepping the flags *************/
    /* It is sheer serendipity that maxFlag and FirstEight have the same `8` magic number */
    // How many flags do we actually have?
    const totalFlags = Math.min(flags.length, maxFlag);
    const lastFlag = 2 ** (totalFlags - 1);
    // Only keep the allowed number of flags
    type MyNames = FirstEight<string, A>;
    type Name = MyNames[number];
    type MyFlags = Shorten<allFlags, NonZeroFlags, MyNames>;
    type NonEmptyFlag = MyFlags[number];
    type Flag = 0 | NonEmptyFlag;
    /********************** ***********************/

    /************** Prepping the (flag -> value) map */
    const flagValues = allFlagsArray
      .slice(0, totalFlags)
      .map((_, i): [Name, NonEmptyFlag] => [
        flags[i],
        allFlagsArray[i] as NonEmptyFlag,
      ]);
    const namesMap = Map.of(...flagValues);
    const flagsMap = Map.of(...flagValues.map(([k, v]) => [v, k] as const));

    function toFlag(flag: Name | Flag): Flag {
      return typeof flag === "string"
        ? namesMap.get(flag).getOr(0)
        : flag > lastFlag
          ? 0
          : flag;
    }
    /********************** ***********************/

    function reduceNamed(...flags: Array<Flag | Name>): number {
      return reduce(...flags.map(toFlag));
    }

    /**
     * A set of named flags.
     *
     * @remarks
     * The flags are accessible both by name and by number.
     */
    class Named extends Flags<K, Flag> {
      public static of(...flags: Array<Flag | Name>): Named {
        return new Named(kind, reduceNamed(...flags));
      }

      // Every flags set always has 0 for the "no flag" value.
      // Again, these should be private, with a getter.
      public static readonly none = 0;
      public static readonly empty = new Named(kind, Named.none);
      public static readonly allFlags = allFlagsArray.slice(
        0,
        totalFlags,
      ) as MyFlags;

      /**
       * Returns the name of a flag.
       */
      public static nameOf(flag: NonEmptyFlag): Name {
        return flagsMap
          .get(flag)
          .getUnsafe(`Flag ${flag} not found in ${kind} / ${flags}`);
      }

      /* Rewrite the base clas methods to allow for names in addition of values. */
      /**
       * Test whether a given flag is present (or set) in the set of flags
       */
      public has(flag: Flag | Name): boolean {
        return super.has(toFlag(flag));
      }
      /**
       * Test whether a given flag is present (or set) in the set of flags
       */
      public isSet = this.has;

      /**
       * Adds a list of flags to the set, and return a new one.
       */
      public add(...flags: Array<Flag | Name>): this {
        return new Named(kind, this.value | reduceNamed(...flags)) as this;
      }
      /**
       * Adds a list of flags to the set (aka sets the flags), and return a new one.
       */
      public set = this.add;

      /**
       * Removes a list of flags from the set, and return a new one.
       */
      public remove(...flags: Array<Flag | Name>): this {
        return new Named(kind, this.value & ~reduceNamed(...flags)) as this;
      }
      /**
       * Removes a list of flags to the set (aka unsets the flags), and return a
       * new one.
       */
      public unset = this.remove;

      /**
       * Test whether a set of flags exactly contains the listed flags.
       */
      public is(...flags: Array<Flag | Name>): boolean {
        return super.is(...flags.map(toFlag));
      }

      public equals(value: Named): boolean;
      public equals(value: unknown): value is this;
      public equals(value: unknown): boolean {
        return value instanceof Named && super.equals(value);
      }

      public toJSON(): Flags.JSON<K> & KeyedByArray<A, boolean> {
        let res = super.toJSON();

        for (let i = 0; i < totalFlags; i++) {
          res[flags[i]] = this.has(flags[i]);
        }

        return res as Flags.JSON<K> & KeyedByArray<A, boolean>;
      }
    }

    /* Now we start to do some dark magic to add direct accessors by the names */
    // This adds static Named.x, Named.y, etc. for each name in `flags`.
    // The value is the corresponding flag, i.e. a power of 2.
    for (let i = 0; i < totalFlags; i++) {
      Object.defineProperty(Named, flags[i], {
        value: allFlagsArray[i],
        writable: false,
      });
    }

    // This adds instance getters Named#x, Named#y, etc. for each name in `flags`.
    // The value is a boolean, whether the flag is set on that specific instance.
    for (let i = 0; i < totalFlags; i++) {
      Object.defineProperty(Named.prototype, flags[i], {
        get: function () {
          return this.has(flags[i]);
        },
      });
    }

    /* Now, we also to do some TypeScript dark magic to explain the previous steps */
    // This is the real type of an instance: the class + the flag names as boolean getters.
    type Instance = Named & KeyedByArray<MyNames, boolean>;

    // We can at last build the type of the class, we need to add the type of the
    // static Named.x, … and then replace the type of `of`. Since there is no other
    // factory (and `new` is private), this is enough.
    type Class = ReplaceFactories<
      typeof Named & KeyedByArray<MyNames, NonEmptyFlag>,
      Name,
      Flag,
      Instance
    >;
    /* Dark magic ends here */

    return Named as Class;
  }
}
