import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";

import * as json from "@siteimprove/alfa-json";

// The number of bits to use for every component of the specificity computation.
// As bitwise operations in JavaScript are limited to 32 bits, we can only use
// at most 10 bits per component as 3 components are used.
const componentBits = 10;

// The maximum value that any given component can have. Since we can only use 10
// bits for every component, this in effect means that any given component count
// must be strictly less than 1024.
const componentMax = (1 << componentBits) - 1;

/**
 * {@link https://www.w3.org/TR/selectors/#specificity}
 *
 * @remarks
 * Specificities are triplet (a, b, c), ordered lexicographically.
 * We also store a 32 bits integer representing the specificity with 10 bits
 * per components (and 2 wasted bits). This allows for quick lexicographic
 * comparison, which is the frequent operation on specificities. Components are
 * therefore limited to 1024 values (10 bits).
 *
 * @privateRemarks
 * This class purposefully doesn't implement the Comparable interface. The
 * interface introduce a tiny overhead in converting the native comparison into
 * the Comparison enum. While this price is gladly payed for more readable code
 * in general, specificity comparison is a hot-path in cascading style which
 * we try to keep as efficient as possible.
 */
export class Specificity
  implements Serializable<Specificity.JSON>, Equatable, Hashable
{
  public static of(a: number, b: number, c: number): Specificity {
    return new Specificity(a, b, c);
  }

  private readonly _a: number;
  private readonly _b: number;
  private readonly _c: number;
  private readonly _value: number;

  private constructor(a: number, b: number, c: number) {
    this._a = a;
    this._b = b;
    this._c = c;

    this._value =
      (Math.min(a, componentMax) << (componentBits * 2)) |
      (Math.min(b, componentMax) << (componentBits * 1)) |
      Math.min(c, componentMax);
  }

  public get a(): number {
    return this._a;
  }

  public get b(): number {
    return this._b;
  }

  public get c(): number {
    return this._c;
  }

  public get value(): number {
    return this._value;
  }

  public equals(value: Specificity): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof Specificity && value._value === this._value;
  }

  public hash(hash: Hash) {
    hash.writeInt32(this._value);
  }

  public toJSON(): Specificity.JSON {
    return { a: this._a, b: this._b, c: this._c };
  }

  public toString(): string {
    return `(${this._a}, ${this._b}, ${this._c})`;
  }
}

export namespace Specificity {
  export interface JSON {
    [key: string]: json.JSON;
    a: number;
    b: number;
    c: number;
  }

  /** public (knip) */
  export function isSpecificity(value: unknown): value is Specificity {
    return value instanceof Specificity;
  }
}
