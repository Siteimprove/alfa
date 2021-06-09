import { Value } from "@siteimprove/alfa-css";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";

/**
 * @internal
 */
export class List<T> extends Value<"list"> implements Iterable<T> {
  public static of<T>(values: Iterable<T>, separator = " "): List<T> {
    return new List(Array.from(values), separator);
  }

  private readonly _values: Array<T>;
  private readonly _separator: string;

  private constructor(values: Array<T>, separator: string) {
    super();
    this._values = values;
    this._separator = separator;
  }

  public get type(): "list" {
    return "list";
  }

  public get values(): ReadonlyArray<T> {
    return this._values;
  }

  public equals<T>(value: List<T>): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
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
      hash.writeUnknown(value);
    }

    hash.writeUint32(this._values.length).writeString(this._separator);
  }

  public *[Symbol.iterator](): Iterator<T> {
    yield* this._values;
  }

  public toJSON(): List.JSON<T> {
    return {
      type: "list",
      values: this._values.map((value) => Serializable.toJSON(value)),
      separator: this._separator,
    };
  }

  public toString(): string {
    return this._values.join(this._separator);
  }
}

/**
 * @internal
 */
export namespace List {
  export interface JSON<T> extends Value.JSON<"list"> {
    values: Array<Serializable.ToJSON<T>>;
    separator: string;
  }

  export function isList<T>(value: Iterable<T>): value is List<T>;

  export function isList<T>(value: unknown): value is List<T>;

  export function isList<T>(value: unknown): value is List<T> {
    return value instanceof List;
  }
}
