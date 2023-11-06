import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";

import * as json from "@siteimprove/alfa-json";

import type { PartiallyResolvable, Resolvable } from "./resolvable";

/**
 * Representation of a CSS Value
 *
 * @remarks
 * * T: a string representation of the type stored in the value,
 *      e.g. "length", "color", …
 * * CALC: whether the numeric values in this may include calculation or not.
 *         When CALC is true, the value hasn't been resolved. It does not
 *         necessarily contain calculation; when CALC is false, the value has
 *         been fully resolved and is guaranteed without calculations.
 * * R: a string representation of the type stored in the resolved value.
 *      This differs from T, typically, for dimension-percentage values that
 *      are resolved as dimensions only.
 * * PR: a string representation of the type stored in the partially resolved value.
 *
 * @public
 */
export abstract class Value<
    T extends string = string,
    CALC extends boolean = boolean,
    R extends string = T,
    PR extends string = R,
  >
  implements
    Equatable,
    Hashable,
    Serializable<Value.JSON<T>>,
    Resolvable<Value<R, false>, Resolvable.Resolver<Value>>,
    PartiallyResolvable<Value<PR>, Resolvable.PartialResolver<Value>>
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

  public hasCalculation(): this is Value<T, true, R, PR> {
    return this._hasCalculation;
  }

  public abstract resolve(resolver?: unknown): Value<R, false>;

  public partiallyResolve(resolver?: unknown): Value<PR> {
    return this.resolve(resolver) as unknown as Value<PR>;
  }

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
