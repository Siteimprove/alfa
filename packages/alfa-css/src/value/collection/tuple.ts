import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";

import type { Resolvable } from "../resolvable";
import { Value } from "../value";

/**
 * @public
 */
export class Tuple<T extends Array<Value>, CALC extends boolean = boolean>
  extends Value<"tuple", CALC>
  implements Resolvable<Tuple<Tuple.Resolved<T>, false>, Tuple.Resolver<T>>
{
  public static of<T extends Array<Value>>(
    ...values: Readonly<T>
  ): Tuple<
    T,
    T extends Array<infer V extends Value<string, false>> ? false : true
  > {
    const calculation = values.some((value) =>
      value.hasCalculation()
    ) as T extends Array<infer V extends Value<string, false>> ? false : true;
    return new Tuple(values, calculation);
  }

  private readonly _values: Readonly<T>;

  private constructor(values: Readonly<T>, calculation: CALC) {
    super("tuple", calculation);
    this._values = values;
  }

  public get values(): Readonly<T> {
    return this._values;
  }

  public resolve(
    resolver?: Tuple.Resolver<T>
  ): Tuple<Tuple.Resolved<T>, false> {
    return new Tuple<Tuple.Resolved<T>, false>(
      this._values.map((value) => value.resolve(resolver)) as Tuple.Resolved<T>,
      false
    );
  }

  public equals<T extends Array<Value>>(value: Tuple<T>): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      Tuple.isTuple(value) &&
      value._values.length === this._values.length &&
      value._values.every((value, i) =>
        Equatable.equals(value, this._values[i])
      )
    );
  }

  public hash(hash: Hash): void {
    for (const value of this._values) {
      hash.writeUnknown(value);
    }

    hash.writeUint32(this._values.length);
  }

  public toJSON(): Tuple.JSON<T> {
    return {
      ...super.toJSON(),
      values: this._values.map((value) =>
        Serializable.toJSON(value)
      ) as Serializable.ToJSON<T>,
    };
  }

  public toString(): string {
    return `${this._values.join(" ")}`.trim();
  }
}

/**
 * @public
 */
export namespace Tuple {
  export interface JSON<T extends Array<Value>> extends Value.JSON<"tuple"> {
    values: Serializable.ToJSON<T>;
  }

  export function isTuple<T extends Array<Value>>(
    value: unknown
  ): value is Tuple<T> {
    return value instanceof Tuple;
  }

  /**
   * Applying the Resolved<T> to all members of a tuple, keeping size and order.
   *
   * {@link https://levelup.gitconnected.com/crazy-powerful-typescript-tuple-types-9b121e0a690c}
   *
   * @internal
   */
  export type Resolved<T extends Array<Value>> = T extends [
    infer Head extends Value,
    ...infer Tail extends Array<Value>
  ]
    ? [Resolvable.Resolved<Head>, ...Resolved<Tail>]
    : [];

  /**
   * Applying the Resolver<T> to all members of a tuple, collapsing them into
   * a single union
   *
   * @internal
   */
  export type Resolver<T extends Array<Value>> = T extends Array<
    infer V extends Value
  >
    ? Resolvable.Resolver<V>
    : never;
}
