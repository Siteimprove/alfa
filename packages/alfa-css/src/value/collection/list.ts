import { Equatable } from "@siteimprove/alfa-equatable";
import { Functor } from "@siteimprove/alfa-functor";
import { Hash } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Token } from "../../syntax";
import { Value } from "../../value";

const { delimited, option, map, separatedList } = Parser;

/**
 * @public
 */
export class List<T>
  extends Value<"list", false>
  implements Iterable<T>, Functor<T>
{
  public static of<T>(values: Iterable<T>, separator = " "): List<T> {
    return new List(Array.from(values), separator);
  }

  private readonly _values: Array<T>;
  private readonly _separator: string;

  private constructor(values: Array<T>, separator: string) {
    super("list", false);
    this._values = values;
    this._separator = separator;
  }

  public get values(): ReadonlyArray<T> {
    return this._values;
  }

  public resolve<U>(valueResolver: List.Resolver<T, U>): List<U> {
    return this.map(valueResolver);
  }

  public map<U>(mapper: Mapper<T, U>): List<U> {
    return new List(this._values.map(mapper), this._separator);
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
      ...super.toJSON(),
      values: this._values.map((value) => Serializable.toJSON(value)),
      separator: this._separator,
    };
  }

  public toString(): string {
    return this._values.join(this._separator);
  }
}

/**
 * @public
 */
export namespace List {
  export interface JSON<T> extends Value.JSON<"list"> {
    values: Array<Serializable.ToJSON<T>>;
    separator: string;
  }

  export type Resolver<T, U> = Mapper<T, U>;

  export function isList<T>(value: Iterable<T>): value is List<T>;

  export function isList<T>(value: unknown): value is List<T>;

  export function isList<T>(value: unknown): value is List<T> {
    return value instanceof List;
  }

  function parse(
    separator: string,
    parseSeparator: Parser<Slice<Token>, any, string>
  ): <T>(
    parseValue: Parser<Slice<Token>, T, string>
  ) => Parser<Slice<Token>, List<T>, string> {
    return (parseValue) =>
      map(separatedList(parseValue, parseSeparator), (values) =>
        List.of(values, separator)
      );
  }

  const parseComma = delimited(option(Token.parseWhitespace), Token.parseComma);

  export const parseCommaSeparated = parse(", ", parseComma);
  export const parseSpaceSeparated = parse(" ", Token.parseWhitespace);
}
