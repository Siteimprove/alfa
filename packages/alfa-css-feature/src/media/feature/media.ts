import {
  Keyword,
  Length,
  type Parser as CSSParser,
  Token,
} from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import * as json from "@siteimprove/alfa-json";
import { None, Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";

import type { Feature } from "../../feature";

import { Value } from "./value";

import { Comparison } from "./comparison";

const { delimited, either, filter, left, map, option, pair, right, separated } =
  Parser;

/**
 * {@link https://drafts.csswg.org/mediaqueries-5/#mq-features}
 *
 * @remarks
 * Media features all have a name and a value.
 *
 * @public
 */
export abstract class Media<N extends string = string, T = unknown>
  implements Feature<Media<N, T>>
{
  private readonly _name: N;
  protected readonly _value: Option<Value<T>>;

  protected constructor(name: N, value: Option<Value<T>>) {
    this._name = name;
    this._value = value;
  }

  public get name(): string {
    return this._name;
  }

  public get value(): Option<Value<T>> {
    return this._value;
  }

  public abstract matches(device: Device): boolean;

  public equals(value: unknown): value is this {
    return (
      value instanceof Media &&
      value.name === this.name &&
      value._value.equals(this._value)
    );
  }

  private *iterator(): Iterator<Media<N, T>> {
    yield this;
  }

  /** @public (knip) */
  public [Symbol.iterator](): Iterator<Media<N, T>> {
    return this.iterator();
  }

  public toJSON(): Media.JSON<N> {
    return {
      type: "feature",
      name: this._name,
      value: this._value.map((value) => value.toJSON()).getOr(null),
    };
  }

  public toString(): string {
    return `${this.name}${this._value.map((value) => `: ${value}`).getOr("")}`;
  }
}

export namespace Media {
  export interface JSON<N extends string = string> {
    [key: string]: json.JSON;

    type: "feature";
    name: N;
    value: Value.JSON | null;
  }

  export function isMedia(value: unknown): value is Media {
    return value instanceof Media;
  }

  /**
   * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-mf-name}
   */
  function parseName<N extends string = string>(
    name: N,
    withRange: boolean = false,
  ): CSSParser<N | `min-${N}` | `max-${N}`> {
    return filter(
      map(Token.parseIdent(), (ident) => ident.value.toLowerCase()),
      (parsed): parsed is N | `min-${N}` | `max-${N}` =>
        parsed === name ||
        (withRange && (parsed === `min-${name}` || parsed === `max-${name}`)),
      (parsed) => `Unknown feature ${parsed}`,
    );
  }

  /**
   * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-mf-plain}
   */
  function parsePlain<
    N extends string = string,
    T extends Keyword | Length.Fixed = Keyword | Length.Fixed,
  >(
    name: N,
    parseValue: CSSParser<T>,
    withRange: boolean,
    from: (value: Option<Value<T>>) => Media<N, T>,
  ): CSSParser<Media<N, T>> {
    return map(
      separated(
        parseName(name, withRange),
        delimited(option(Token.parseWhitespace), Token.parseColon),
        parseValue,
      ),
      ([name, value]) => {
        if (withRange && (name.startsWith("min-") || name.startsWith("max-"))) {
          const range = name.startsWith("min-")
            ? Value.minimumRange
            : Value.maximumRange;

          return from(
            Option.of(range(Value.bound(value, /* isInclusive */ true))),
          );
        } else {
          return from(Option.of(Value.discrete(value)));
        }
      },
    );
  }

  /**
   * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-mf-boolean}
   */
  function parseBoolean<N extends string = string, T = unknown>(
    name: N,
    from: (value: None) => Media<N, T>,
  ): CSSParser<Media<N, T>> {
    return map(parseName(name), () => from(None));
  }

  /**
   * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-mf-value}
   *
   * @remarks
   * We currently do not support calculations in media queries
   * We currently only support media features whose value is keyword
   * or length, keyword parsing uses the `@siteimprove/alfa-css` parser.
   */
  const parseLength = filter(
    Length.parse,
    (length): length is Length.Fixed => !length.hasCalculation(),
    () => "Calculations no supported in media queries",
  );

  function parseComparisonLengthBound<C extends Comparison = Comparison>(
    parseComparison: CSSParser<C>,
  ): CSSParser<[Value.Bound<Length.Fixed>, C]> {
    return map(pair(parseComparison, parseLength), ([comparison, value]) => [
      Value.bound(value, Comparison.isInclusive(comparison)),
      comparison,
    ]);
  }

  function parseLengthComparisonBound<C extends Comparison = Comparison>(
    parseComparison: CSSParser<C>,
  ): CSSParser<[Value.Bound<Length.Fixed>, C]> {
    return map(pair(parseLength, parseComparison), ([value, comparison]) => [
      Value.bound(value, Comparison.isInclusive(comparison)),
      comparison,
    ]);
  }

  /**
   * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-mf-range}
   */
  function parseRange<N extends string = string>(
    name: N,
    from: (value: Option<Value<Length.Fixed>>) => Media<N, Length.Fixed>,
  ): CSSParser<Media<N, Length.Fixed>> {
    return either(
      // <mf-value> <mf-lt> <mf-name> <mf-lt> <mf-value>
      map(
        pair(
          parseLengthComparisonBound(Comparison.parseLessThan),
          right(
            delimited(option(Token.parseWhitespace), parseName(name)),
            parseComparisonLengthBound(Comparison.parseLessThan),
          ),
        ),
        ([[minimum], [maximum]]) =>
          from(Option.of(Value.range(minimum, maximum))),
      ),

      // <mf-value> <mf-gt> <mf-name> <mf-gt> <mf-value>
      map(
        pair(
          parseLengthComparisonBound(Comparison.parseGreaterThan),
          right(
            delimited(option(Token.parseWhitespace), parseName(name)),
            parseComparisonLengthBound(Comparison.parseGreaterThan),
          ),
        ),
        ([[maximum], [minimum]]) =>
          from(Option.of(Value.range(minimum, maximum))),
      ),

      // <mf-name> <mf-comparison> <mf-value>
      map(
        right(parseName(name), parseComparisonLengthBound(Comparison.parse)),
        ([bound, comparison]) => {
          switch (comparison) {
            case Comparison.Equal:
              return from(Option.of(Value.range(bound, bound)));

            case Comparison.LessThan:
            case Comparison.LessThanOrEqual:
              return from(Option.of(Value.maximumRange(bound)));

            case Comparison.GreaterThan:
            case Comparison.GreaterThanOrEqual:
              return from(Option.of(Value.minimumRange(bound)));
          }
        },
      ),

      // <mf-value> <mf-comparison> <mf-name>
      map(
        left(parseLengthComparisonBound(Comparison.parse), parseName(name)),
        ([bound, comparison]) => {
          switch (comparison) {
            case Comparison.Equal:
              return from(Option.of(Value.range(bound, bound)));

            case Comparison.LessThan:
            case Comparison.LessThanOrEqual:
              return from(Option.of(Value.minimumRange(bound)));

            case Comparison.GreaterThan:
            case Comparison.GreaterThanOrEqual:
              return from(Option.of(Value.maximumRange(bound)));
          }
        },
      ),
    );
  }

  /**
   * @internal
   */
  export function parseContinuous<N extends string = string>(
    name: N,
    from: (value: Option<Value<Length.Fixed>>) => Media<N, Length.Fixed>,
  ): CSSParser<Media<N, Length.Fixed>> {
    return either(
      parseRange(name, from),
      parsePlain(name, parseLength, true, from),
      parseBoolean(name, from),
    );
  }

  /**
   * @internal
   */
  export function parseDiscrete<N extends string = string>(
    name: N,
    from: (value: Option<Value<Keyword>>) => Media<N, Keyword>,
    ...values: Array<string>
  ): CSSParser<Media<N, Keyword>> {
    return either(
      parsePlain(name, Keyword.parse(...values), false, from),
      parseBoolean(name, from),
    );
  }
}
