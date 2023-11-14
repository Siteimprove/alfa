import { Hash } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";

import type { PartiallyResolvable, Resolvable } from "../resolvable";
import { Value } from "../value";

/**
 * @public
 */
export class Tuple<T extends Array<Value>>
  extends Value<"tuple", Value.HasCalculation<T>>
  implements
    Resolvable<Tuple<Tuple.Resolved<T>>, Tuple.Resolver<T>>,
    PartiallyResolvable<
      Tuple<Tuple.PartiallyResolved<T>>,
      Tuple.PartialResolver<T>
    >
{
  public static of<T extends Array<Value>>(...values: Readonly<T>): Tuple<T> {
    return new Tuple(values);
  }

  private readonly _values: Readonly<T>;

  private constructor(values: Readonly<T>) {
    super("tuple", Value.hasCalculation(...values));
    this._values = values;
  }

  public get values(): Readonly<T> {
    return this._values;
  }

  public resolve(resolver?: Tuple.Resolver<T>): Tuple<Tuple.Resolved<T>> {
    return new Tuple<Tuple.Resolved<T>>(
      this._values.map((value) => value.resolve(resolver)) as Tuple.Resolved<T>,
    );
  }

  public partiallyResolve(
    resolver?: Tuple.PartialResolver<T>,
  ): Tuple<Tuple.PartiallyResolved<T>> {
    return new Tuple<Tuple.PartiallyResolved<T>>(
      this._values.map((value) =>
        value.resolve(resolver),
      ) as Tuple.PartiallyResolved<T>,
    );
  }

  public equals<T extends Array<Value>>(value: Tuple<T>): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      Tuple.isTuple(value) &&
      value._values.length === this._values.length &&
      value._values.every((value, i) => value.equals(this._values[i]))
    );
  }

  public hash(hash: Hash): void {
    for (const value of this._values) {
      value.hash(hash);
    }

    hash.writeUint32(this._values.length);
  }

  public toJSON(): Tuple.JSON<T> {
    return {
      ...super.toJSON(),
      values: this._values.map((value) =>
        value.toJSON(),
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
    value: unknown,
  ): value is Tuple<T> {
    return value instanceof Tuple;
  }

  /**
   * Applying Resolved<T> to all members of a tuple, keeping size and order.
   *
   * {@link https://levelup.gitconnected.com/crazy-powerful-typescript-tuple-types-9b121e0a690c}
   *
   * @internal
   */
  export type Resolved<T extends Array<Value>> = T extends [
    infer Head extends Value,
    ...infer Tail extends Array<Value>,
  ]
    ? [Resolvable.Resolved<Head>, ...Resolved<Tail>]
    : [];

  export type PartiallyResolved<T extends Array<Value>> = T extends [
    infer Head extends Value,
    ...infer Tail extends Array<Value>,
  ]
    ? [Resolvable.PartiallyResolved<Head>, ...PartiallyResolved<Tail>]
    : [];

  /**
   * Applying Resolver<T> to all members of a tuple, collapsing them into
   * a single union
   *
   * @internal
   */
  export type Resolver<T extends Array<Value>> = T extends Array<
    infer V extends Value
  >
    ? Resolvable.Resolver<V>
    : never;

  export type PartialResolver<T extends Array<Value>> = T extends Array<
    infer V extends Value
  >
    ? Resolvable.PartialResolver<V>
    : never;
}
