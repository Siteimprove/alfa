import { Value } from "@siteimprove/alfa-css";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";

import * as json from "@siteimprove/alfa-json";

export class List<T> extends Value<"list"> implements Iterable<T> {
  public static of<T>(values: Iterable<T>, separator = " "): List<T> {
    return new List(values, separator);
  }

  private readonly _values: Array<T>;
  private readonly _separator: string;

  private constructor(values: Iterable<T>, separator: string) {
    super();
    this._values = [...values];
    this._separator = separator;
  }

  public get type(): "list" {
    return "list";
  }

  public get values(): Iterable<T> {
    return this._values;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof List &&
      value._values.length === this._values.length &&
      value._values.every((value, i) =>
        Equatable.equals(value, this._values[i])
      )
    );
  }

  public hash(hash: Hash): void {
    for (const value of this._values) {
      Hashable.hash(hash, value);
    }

    Hash.writeUint32(hash, this._values.length);
    Hash.writeString(hash, this._separator);
  }

  public *[Symbol.iterator](): Iterator<T> {
    yield* this._values;
  }

  public toJSON(): List.JSON {
    return {
      type: "list",
      values: this._values.map(Serializable.toJSON),
      separator: this._separator,
    };
  }

  public toString(): string {
    return this._values.join(this._separator);
  }
}

export namespace List {
  export interface JSON extends Value.JSON {
    type: "list";
    values: Array<json.JSON>;
    separator: string;
  }
}
