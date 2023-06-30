import { Equatable } from "@siteimprove/alfa-equatable";
import { Functor } from "@siteimprove/alfa-functor";
import { Hash } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Token } from "../../syntax";
import { Value } from "../value";

const { delimited, option, map, separatedList } = Parser;

/**
 * @public
 */
export class List<T extends Value, CALC extends boolean = boolean>
  extends Value<"list", CALC>
  implements Iterable<T>
{
  public static of<T extends Value>(
    values: Iterable<T>,
    separator = " "
  ): List<T, T extends Value<string, false> ? false : true> {
    const array = Array.from(values);
    const calculation = array.some((value) =>
      value.hasCalculation()
    ) as T extends Value<string, false> ? false : true;

    return new List(array, separator, calculation);
  }

  private readonly _values: Array<T>;
  private readonly _separator: string;

  private constructor(values: Array<T>, separator: string, calculation: CALC) {
    super("list", calculation);
    this._values = values;
    this._separator = separator;
  }

  public get values(): ReadonlyArray<T> {
    return this._values;
  }

  public resolve(
    resolver?: unknown
  ): List<Value<Value.Resolved<T>, false>, false> {
    const array = this._values.map(
      (value) => value.resolve(resolver) as Value<Value.Resolved<T>, false>
    );

    return new List(array, this._separator, false);
  }

  public map<U extends Value>(
    mapper: Mapper<T, U>
  ): List<U, U extends Value<string, false> ? false : true> {
    const array = this._values.map(mapper);
    const calculation = array.some((value) =>
      value.hasCalculation()
    ) as U extends Value<string, false> ? false : true;

    return new List(array, this._separator, calculation);
  }

  public equals<T extends Value>(value: List<T>): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof List &&
      value._values.length === this._values.length &&
      value._values.every((value, i) => value.equals(this._values[i]))
    );
  }

  public hash(hash: Hash): void {
    for (const value of this._values) {
      value.hash(hash);
    }

    hash.writeUint32(this._values.length).writeString(this._separator);
  }

  public *[Symbol.iterator](): Iterator<T> {
    yield* this._values;
  }

  public toJSON(): List.JSON<T> {
    return {
      ...super.toJSON(),
      values: this._values.map((value) => value.toJSON()),
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
  export interface JSON<T extends Value> extends Value.JSON<"list"> {
    values: Array<Value.JSON>;
    separator: string;
  }

  export function isList<T extends Value>(value: Iterable<T>): value is List<T>;

  export function isList<T extends Value>(value: unknown): value is List<T>;

  export function isList<T extends Value>(value: unknown): value is List<T> {
    return value instanceof List;
  }

  function parse(
    separator: string,
    parseSeparator: Parser<Slice<Token>, any, string>
  ): <T extends Value>(
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
