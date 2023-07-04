import { Hash } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { type Parser as CSSParser, Token } from "../../syntax";

import type { Resolvable } from "../resolvable";
import { Value } from "../value";

const { delimited, option, map, separatedList } = Parser;

/**
 * @public
 */
export class List<V extends Value, CALC extends boolean = boolean>
  extends Value<"list", CALC>
  implements
    Iterable<V>,
    Resolvable<List<Resolvable.Resolved<V>, false>, Resolvable.Resolver<V>>
{
  public static of<V extends Value>(
    values: Iterable<V>,
    separator = " "
  ): List<V, V extends Value<string, false> ? false : true> {
    const array = Array.from(values);
    const calculation = array.some((value) =>
      value.hasCalculation()
    ) as V extends Value<string, false> ? false : true;

    return new List(array, separator, calculation);
  }

  private readonly _values: Array<V>;
  private readonly _separator: string;

  private constructor(values: Array<V>, separator: string, calculation: CALC) {
    super("list", calculation);
    this._values = values;
    this._separator = separator;
  }

  public get values(): ReadonlyArray<V> {
    return this._values;
  }

  public resolve(
    resolver?: Resolvable.Resolver<V>
  ): List<Resolvable.Resolved<V>, false> {
    return this.map(
      (value) => value.resolve(resolver) as Resolvable.Resolved<V>
    );
  }

  public map<U extends Value>(
    mapper: Mapper<V, U>
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

  public *[Symbol.iterator](): Iterator<V> {
    yield* this._values;
  }

  public toJSON(): List.JSON<V> {
    return {
      ...super.toJSON(),
      values: this._values.map(
        (value) => value.toJSON() as Serializable.ToJSON<V>
      ),
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
  export interface JSON<V extends Value> extends Value.JSON<"list"> {
    values: Array<Serializable.ToJSON<V>>;
    separator: string;
  }

  export function isList<V extends Value>(value: Iterable<V>): value is List<V>;

  export function isList<V extends Value>(value: unknown): value is List<V>;

  export function isList<V extends Value>(value: unknown): value is List<V> {
    return value instanceof List;
  }

  function parse(
    separator: string,
    parseSeparator: CSSParser<any>
  ): <V extends Value>(parseValue: CSSParser<V>) => CSSParser<List<V>> {
    return (parseValue) =>
      map(separatedList(parseValue, parseSeparator), (values) =>
        List.of(values, separator)
      );
  }

  const parseComma = delimited(option(Token.parseWhitespace), Token.parseComma);

  export const parseCommaSeparated = parse(", ", parseComma);
}
