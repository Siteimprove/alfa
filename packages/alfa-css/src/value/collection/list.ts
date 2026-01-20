import type { Hash } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import type { Serializable } from "@siteimprove/alfa-json";
import type { Mapper } from "@siteimprove/alfa-mapper";
import { Parser } from "@siteimprove/alfa-parser";
import type { Predicate } from "@siteimprove/alfa-predicate";

import { type Parser as CSSParser, Token } from "../../syntax/index.js";

import type { PartiallyResolvable, Resolvable } from "../resolvable.js";
import { Value } from "../value.js";

const { delimited, option, map, separatedList } = Parser;

/**
 * @public
 */
export class List<V extends Value>
  extends Value<"list", Value.HasCalculation<[V]>>
  implements
    Iterable<V>,
    Resolvable<List<Resolvable.Resolved<V>>, Resolvable.Resolver<V>>,
    PartiallyResolvable<
      List<Resolvable.PartiallyResolved<V>>,
      Resolvable.PartialResolver<V>
    >
{
  public static of<V extends Value>(
    values: Iterable<V>,
    separator = " ",
  ): List<V> {
    return new List(Array.from(values), separator);
  }

  private readonly _values: Array<V>;
  private readonly _separator: string;

  protected constructor(values: Array<V>, separator: string) {
    super("list", Value.hasCalculation(...values));
    this._values = values;
    this._separator = separator;
  }

  public get values(): ReadonlyArray<V> {
    return this._values;
  }

  public get size(): number {
    return this._values.length;
  }

  public some(predicate: Predicate<V, [index: number]>) {
    return Iterable.some(this._values, predicate);
  }

  public none(predicate: Predicate<V, [index: number]>) {
    return Iterable.none(this._values, predicate);
  }

  public resolve(
    resolver?: Resolvable.Resolver<V>,
  ): List<Resolvable.Resolved<V>> {
    return this.map(
      (value) => value.resolve(resolver) as Resolvable.Resolved<V>,
    );
  }

  public partiallyResolve(
    resolver?: Resolvable.PartialResolver<V>,
  ): List<Resolvable.PartiallyResolved<V>> {
    return this.map(
      (value) =>
        value.partiallyResolve(resolver) as Resolvable.PartiallyResolved<V>,
    );
  }

  public map<U extends Value>(mapper: Mapper<V, U>): List<U> {
    return new List(this._values.map(mapper), this._separator);
  }

  /**
   * Returns a copy of the current instance cut off or extended with repeated values to match the given `length`.
   *
   * @example
   * List.of([1, 2, 3]).cutOrExtend(2); // returns a new List with values [1, 2]
   *
   * @example
   * List.of([1, 2, 3]).cutOrExtend(5); // returns a new List with values [1, 2, 3, 1, 2]
   */
  public cutOrExtend(length: number): List<V> {
    if (this.size === length) {
      return new List(this._values, this._separator);
    }

    if (length < this.size) {
      return new List(this._values.slice(0, length), this._separator);
    }

    const extended: Array<V> = [];
    for (let i = 0; i < length; ++i) {
      // Cyclically repeat the values until the result has the desired length.
      extended.push(this._values[i % this.size]);
    }

    return new List(extended, this._separator);
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
        (value) => value.toJSON() as Serializable.ToJSON<V>,
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

  function parse<V extends Value>(
    parseValue: CSSParser<V>,
    separator: string,
    parseSeparator: CSSParser<any>,
    lower: number,
    upper: number,
  ): CSSParser<List<V>> {
    return map(
      separatedList(parseValue, parseSeparator, lower, upper),
      (values) => List.of(values, separator),
    );
  }

  const parseComma = delimited(option(Token.parseWhitespace), Token.parseComma);

  const parseSpace = option(Token.parseWhitespace);

  export const parseCommaSeparated = <V extends Value>(
    parseValue: CSSParser<V>,
    lower: number = 1,
    upper: number = Infinity,
  ) => parse(parseValue, ", ", parseComma, lower, upper);

  export const parseSpaceSeparated = <V extends Value>(
    parseValue: CSSParser<V>,
    lower: number = 1,
    upper: number = Infinity,
  ) => parse(parseValue, " ", parseSpace, lower, upper);
}
