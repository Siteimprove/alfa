import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";

import * as json from "@siteimprove/alfa-json";

import type { Resolvable } from "./resolvable";

/**
 * * T: a string representation of the type stored in the value,
 *      e.g. "length", "color", …
 * * CALC: whether the numeric values in this may include calculation or not.
 *         When CALC is true, the value hasn't been resolved. It does not
 *         necessarily contain calculation; when CALC is false, the value has
 *         been fully resolved and is guaranteed without calculations.
 * * R: a string representation of the type stored in the resolved value.
 *      This differs from T, typically, for dimension-percentage values that
 *      are resolved as dimensions only.
 *
 * @public
 */
// This is the main Value class that is implemented by all CSS values, with or
// without calculations.
export abstract class Value<
    T extends string = string,
    CALC extends boolean = boolean,
    R extends string = T,
  >
  implements
    Equatable,
    Hashable,
    Serializable<Value.JSON<T>>,
    Resolvable<Value<R, false>, Resolvable.Resolver<Value>>
{
  private readonly _type: T;
  protected readonly _hasCalculation: CALC;

  protected constructor(type: T, hasCalculation: CALC) {
    this._type = type;
    this._hasCalculation = hasCalculation;
  }

  public get type(): T {
    return this._type;
  }

  public hasCalculation(): this is Value<T, true, R> {
    return this._hasCalculation;
  }

  public abstract resolve(resolver?: unknown): Value<R, false>;

  public abstract equals(value: unknown): value is this;

  public abstract hash(hash: Hash): void;

  public toJSON(): Value.JSON<T> {
    return { type: this._type };
  }

  public abstract toString(): string;
}

/**
 * @public
 */
export namespace Value {
  export interface JSON<T extends string = string> {
    [key: string]: json.JSON;
    type: T;
  }

  export function isValue<T extends string>(
    value: unknown,
    type?: T,
  ): value is Value<T> {
    return (
      value instanceof Value && (type === undefined || value.type === type)
    );
  }

  /**
   * @internal
   */
  export type HasCalculation<V extends Array<Value>> = V extends Array<
    Value<string, false>
  >
    ? false
    : true;

  /**
   * @internal
   */
  export function hasCalculation<A extends Array<Value> = []>(
    ...values: A
  ): HasCalculation<A> {
    return values.some((value) => value.hasCalculation()) as HasCalculation<A>;
  }
}
