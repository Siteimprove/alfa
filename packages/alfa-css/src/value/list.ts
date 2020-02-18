import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";

import * as json from "@siteimprove/alfa-json";

/**
 * The list value type is used for consistency with the rest of the value types
 * when representing lists of things, namely by providing a `type` property and
 * implementing the `equals()` and `toJSON()` methods. It also provides a means
 * of configuring the value separator used in the `toString()` method.
 */
export class List<T> implements Iterable<T>, Equatable, Serializable {
  public static of<T>(values: Iterable<T>, separator = " "): List<T> {
    return new List(values, separator);
  }

  private readonly _values: Array<T>;
  private readonly _separator: string;

  private constructor(values: Iterable<T>, separator: string) {
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

  public *[Symbol.iterator](): Iterator<T> {
    yield* this._values;
  }

  public toJSON(): List.JSON {
    return {
      type: "list",
      values: this._values.map(Serializable.toJSON),
      separator: this._separator
    };
  }

  public toString(): string {
    return this._values.join(this._separator);
  }
}

export namespace List {
  export interface JSON {
    [key: string]: json.JSON;
    type: "list";
    values: Array<json.JSON>;
    separator: string;
  }
}
