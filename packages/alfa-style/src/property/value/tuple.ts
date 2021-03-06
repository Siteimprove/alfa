import { Value } from "@siteimprove/alfa-css";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";

/**
 * @internal
 */
export class Tuple<T extends Array<unknown>> extends Value<"tuple"> {
  public static of<T extends Array<unknown>>(...values: Readonly<T>): Tuple<T> {
    return new Tuple(values);
  }

  private readonly _values: Readonly<T>;

  private constructor(values: Readonly<T>) {
    super();
    this._values = values;
  }

  public get type(): "tuple" {
    return "tuple";
  }

  public get values(): Readonly<T> {
    return this._values;
  }

  public equals<T extends Array<unknown>>(value: Tuple<T>): boolean;

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
      type: "tuple",
      values: this._values.map((value) =>
        Serializable.toJSON(value)
      ) as Serializable.ToJSON<T>,
    };
  }

  public toString(): string {
    return this._values.join(" ");
  }
}

/**
 * @internal
 */
export namespace Tuple {
  export interface JSON<T extends Array<unknown>> extends Value.JSON<"tuple"> {
    values: Serializable.ToJSON<T>;
  }

  export function isTuple<T extends Array<unknown>>(
    value: unknown
  ): value is Tuple<T> {
    return value instanceof Tuple;
  }
}
