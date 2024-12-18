import type { Functor } from "@siteimprove/alfa-functor";
import { Serializable } from "@siteimprove/alfa-json";
import type { Mapper } from "@siteimprove/alfa-mapper";
import type { Refinement } from "@siteimprove/alfa-refinement";

import type * as json from "@siteimprove/alfa-json";

/**
 * A bound, either inclusive or exclusive.
 *
 * @public
 */
export class Bound<T = unknown>
  implements Functor<T>, Serializable<Bound.JSON<T>>
{
  public static of<T>(value: T, isInclusive: boolean): Bound<T> {
    return new Bound(value, isInclusive);
  }

  private readonly _value: T;
  private readonly _isInclusive: boolean;

  protected constructor(value: T, isInclusive: boolean) {
    this._value = value;
    this._isInclusive = isInclusive;
  }

  public get value(): T {
    return this._value;
  }

  public get isInclusive(): boolean {
    return this._isInclusive;
  }

  public map<U>(mapper: Mapper<T, U>): Bound<U> {
    return new Bound(mapper(this._value), this._isInclusive);
  }

  public hasValue<U extends T>(refinement: Refinement<T, U>): this is Bound<U> {
    return refinement(this._value);
  }

  public toJSON(): Bound.JSON<T> {
    return {
      value: Serializable.toJSON(this._value),
      isInclusive: this._isInclusive,
    };
  }
}

/**
 * @public
 */
export namespace Bound {
  export interface JSON<T> {
    [key: string]: json.JSON;
    value: Serializable.ToJSON<T>;
    isInclusive: boolean;
  }
}
