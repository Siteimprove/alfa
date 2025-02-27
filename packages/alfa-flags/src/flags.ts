import { Array } from "@siteimprove/alfa-array";
import type { Equatable } from "@siteimprove/alfa-equatable";
import { Map } from "@siteimprove/alfa-map";

import type * as json from "@siteimprove/alfa-json";

/**
 * Class for modelling set of boolean flags.
 * Flags are stored as bits in a single number. Due to Javascript limitation
 * on bitwise operations, this means that a maximum of 32 flags can be handled.
 * We currently limit the class at a maximum of 8 flags since it fits our needs.
 *
 * @public
 */
export class Flags<F extends Flags.allFlags = Flags.allFlags>
  implements Equatable, json.Serializable<Flags.JSON>
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

  protected constructor(value: number) {
    this.value = value;
  }

  /**
   * Test whether a given flag is present (or set) in the set of flags
   */
  public has(flag: F): boolean {
    return (this.value & flag) === flag;
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
      this.value & ~Flags.reduce(...flags),
    ) as this;
  }

  /**
   * Removes a list of flags to the set (aka unsets the flags), and return a new one.
   */
  public unset = this.remove;

  public equals(value: Flags): boolean;
  public equals(value: unknown): value is this;
  public equals(value: unknown): boolean {
    return value instanceof Flags && this.value === value.value;
  }

  public toJSON(): Flags.JSON {
    return {};
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

  export interface JSON {
    [key: string]: boolean;
  }

  /**
   * Individual flags are numbers with at most one bit set to 1, i.e. powers of
   * two.
   * Since we do not currently need more than 8 flags, we can safely restrict this
   * union.
   */
  const allFlagsArray = [1, 2, 4, 8, 16, 32, 64, 128] as const;

  /**
   * @internal
   */
  export type allFlags = 0 | (typeof allFlagsArray)[number];

  const maxFlag = allFlagsArray.length;

  /**
   * Turns ["a", "b", "c"] into { a: X; b: X; c: X }
   */
  type KeyedByArray<A extends Array<string>, X> = { [key in A[number]]: X };

  /**
   * Keep the first Bound.length types in A (or all if less).
   * Using an array for the bound just makes the type easier since there is no
   * arithmetic on the `number` type.
   * This effectively treats Bound as a unary number.
   */
  type Shorten<
    A extends ReadonlyArray<string>,
    Bound extends ReadonlyArray<any>,
  > = A extends [infer AHead, ...infer ATail extends ReadonlyArray<string>]
    ? Bound extends [any, ...infer BTail extends ReadonlyArray<any>]
      ? [AHead, ...Shorten<ATail, BTail>]
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
  type FirstEight<A extends ReadonlyArray<string>> = Shorten<
    A,
    // this should be `typeof allFlagsArray` but TS struggles with it, probably
    // due to it appearing not static enough for deep inference.
    [1, 2, 4, 8, 16, 32, 64, 128]
  >;

  // This replaces the type of `of` in its argument. We cannot just use `&` because
  // it would instead create an overload with the original `of` signature (without
  // the getters).
  type ReplaceOf<T extends { of: any }, Name extends string, Replaced> = {
    [key in keyof T]: key extends "of"
      ? (...flags: Array<allFlags | Name>) => Replaced
      : T[key];
  };

  export function named<A extends Array<string>>(...flags: A) {
    /************* Prepping the flags *************/
    /* It is sheer serendipity that maxFlag and FirstEight have the same `8` magic number */
    // How many flags do we actually have?
    const totalFlags = Math.min(flags.length, maxFlag);
    // Only keep the allowed number of flags
    type MyNames = FirstEight<A>;
    type Name = MyNames[number];
    /********************** ***********************/

    /************** Prepping the (flag -> value) map */
    const flagValues = allFlagsArray
      .slice(0, totalFlags)
      .map((_, i): [string, Flags.allFlags] => [flags[i], allFlagsArray[i]]);
    const namesMap = Map.of<Name, Flags.allFlags>(...flagValues);

    function toFlag(flag: Name | allFlags): Flags.allFlags {
      return typeof flag === "string" ? namesMap.get(flag).getOr(0) : flag;
    }
    /********************** ***********************/

    function reduceNamed(...flags: Array<allFlags | Name>): number {
      return reduce(...flags.map(toFlag));
    }

    /**
     * A set of named flags.
     *
     * @remarks
     * The flags are accessible both by name and by number.
     */
    class Named extends Flags {
      public static of(...flags: Array<Flags.allFlags | Name>) {
        return new Named(reduceNamed(...flags));
      }

      // Every flags set always has 0 for the "no flag" value.
      public static none = 0;

      /* Rewrite the base clas methods to allow for names in addition of values. */
      public has(flag: Flags.allFlags | Name): boolean {
        return super.has(toFlag(flag));
      }
      public isSet = this.has;

      public add(...flags: Array<Flags.allFlags | Name>): this {
        return new Named(this.value | reduceNamed(...flags)) as this;
      }
      public set = this.add;

      public remove(...flags: Array<Flags.allFlags | Name>): this {
        return new Named(this.value & ~reduceNamed(...flags)) as this;
      }
      public unset = this.remove;

      public equals(value: Named): boolean;
      public equals(value: unknown): value is this;
      public equals(value: unknown): boolean {
        return value instanceof Named && super.equals(value);
      }

      public toJSON(): Flags.JSON & KeyedByArray<A, boolean> {
        let res = super.toJSON();

        for (let i = 0; i < totalFlags; i++) {
          res[flags[i]] = this.has(flags[i]);
        }

        return res as Flags.JSON & KeyedByArray<A, boolean>;
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
    type Class = ReplaceOf<
      typeof Named & KeyedByArray<MyNames, allFlags>,
      Name,
      Instance
    >;
    /* Dark magic ends here */

    return Named as Class;
  }
}
