import {
  Keyword,
  Length,
  type Parser as CSSParser,
  Token,
} from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Iterable } from "@siteimprove/alfa-iterable";
import * as json from "@siteimprove/alfa-json";
import { Serializable } from "@siteimprove/alfa-json";
import { None, Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Result } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import type { Matchable } from "../matchable";
import { Value } from "../value";

import { Comparison } from "./comparison";

const { delimited, either, filter, map, mapResult, option, pair, separated } =
  Parser;

/**
 * {@link https://drafts.csswg.org/mediaqueries-5/#mq-features}
 */
export abstract class Feature<N extends string = string, T = unknown>
  implements
    Matchable,
    Iterable<Feature<N, T>>,
    Equatable,
    Serializable<Feature.JSON>
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
      value instanceof Feature &&
      value.name === this.name &&
      value._value.equals(this._value)
    );
  }

  public *iterator(): Iterator<Feature<N, T>> {
    yield this;
  }

  public [Symbol.iterator](): Iterator<Feature<N, T>> {
    return this.iterator();
  }

  public toJSON(): Feature.JSON<N> {
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

export namespace Feature {
  export interface JSON<N extends string = string> {
    [key: string]: json.JSON;

    type: "feature";
    name: N;
    value: Value.JSON | null;
  }

  export function isFeature(value: unknown): value is Feature {
    return value instanceof Feature;
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
   * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-mf-value}
   *
   * @remarks
   * We currently do not support calculations in media queries
   */
  const parseValue = either<Slice<Token>, Keyword | Length.Fixed, string>(
    map(Token.parseIdent(), (ident) => Keyword.of(ident.value.toLowerCase())),
    filter(
      Length.parse,
      (length): length is Length.Fixed => !length.hasCalculation(),
      () => "Calculations no supported in media queries",
    ),
  );

  /**
   * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-mf-plain}
   */
  function parsePlain<N extends string = string>(
    name: N,
    withRange: boolean,
    tryFrom: (value: Option<Value<any>>) => Result<Feature<N>, string>,
  ): CSSParser<Feature> {
    return mapResult(
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

          return tryFrom(
            Option.of(range(Value.bound(value, /* isInclusive */ true))),
          );
        } else {
          return tryFrom(Option.of(Value.discrete(value)));
        }
      },
    );
  }

  /**
   * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-mf-boolean}
   */
  function parseBoolean<N extends string = string>(
    name: N,
    tryFrom: (value: Option<Value<any>>) => Result<Feature<N>, string>,
  ): CSSParser<Feature> {
    return mapResult(parseName(name), (name) => tryFrom(None));
  }

  /**
   * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-mf-range}
   */
  function parseRange<N extends string = string>(
    name: N,
    tryFrom: (value: Option<Value<any>>) => Result<Feature<N>, string>,
  ): CSSParser<Feature> {
    return either(
      // <mf-value> <mf-lt> <mf-name> <mf-lt> <mf-value>
      mapResult(
        pair(
          map(
            pair(parseValue, Comparison.parseLessThan),
            ([value, comparison]) =>
              Value.bound(
                value,
                /* isInclusive */ comparison === Comparison.LessThanOrEqual,
              ),
          ),
          pair(
            delimited(option(Token.parseWhitespace), parseName(name)),
            map(
              pair(Comparison.parseLessThan, parseValue),
              ([comparison, value]) =>
                Value.bound(
                  value,
                  /* isInclusive */ comparison === Comparison.LessThanOrEqual,
                ),
            ),
          ),
        ),
        ([minimum, [name, maximum]]) =>
          tryFrom(Option.of(Value.range(minimum, maximum))),
      ),

      // <mf-value> <mf-gt> <mf-name> <mf-gt> <mf-value>
      mapResult(
        pair(
          map(
            pair(parseValue, Comparison.parseGreaterThan),
            ([value, comparison]) =>
              Value.bound(
                value,
                /* isInclusive */ comparison === Comparison.GreaterThanOrEqual,
              ),
          ),
          pair(
            delimited(option(Token.parseWhitespace), parseName(name)),
            map(
              pair(Comparison.parseGreaterThan, parseValue),
              ([comparison, value]) =>
                Value.bound(
                  value,
                  /* isInclusive */ comparison ===
                    Comparison.GreaterThanOrEqual,
                ),
            ),
          ),
        ),
        ([maximum, [name, minimum]]) =>
          tryFrom(Option.of(Value.range(minimum, maximum))),
      ),

      // <mf-name> <mf-comparison> <mf-value>
      mapResult(
        pair(parseName(name), pair(Comparison.parse, parseValue)),
        ([name, [comparison, value]]) => {
          switch (comparison) {
            case Comparison.Equal:
              return tryFrom(
                Option.of(
                  Value.range(
                    Value.bound(value, /* isInclude */ true),
                    Value.bound(value, /* isInclude */ true),
                  ),
                ),
              );

            case Comparison.LessThan:
            case Comparison.LessThanOrEqual:
              return tryFrom(
                Option.of(
                  Value.maximumRange(
                    Value.bound(
                      value,
                      /* isInclusive */ comparison ===
                        Comparison.LessThanOrEqual,
                    ),
                  ),
                ),
              );

            case Comparison.GreaterThan:
            case Comparison.GreaterThanOrEqual:
              return tryFrom(
                Option.of(
                  Value.minimumRange(
                    Value.bound(
                      value,
                      /* isInclusive */ comparison ===
                        Comparison.GreaterThanOrEqual,
                    ),
                  ),
                ),
              );
          }
        },
      ),

      // <mf-value> <mf-comparison> <mf-name>
      mapResult(
        pair(parseValue, pair(Comparison.parse, parseName(name))),
        ([value, [comparison, name]]) => {
          switch (comparison) {
            case Comparison.Equal:
              return tryFrom(
                Option.of(
                  Value.range(
                    Value.bound(value, /* isInclude */ true),
                    Value.bound(value, /* isInclude */ true),
                  ),
                ),
              );

            case Comparison.LessThan:
            case Comparison.LessThanOrEqual:
              return tryFrom(
                Option.of(
                  Value.minimumRange(
                    Value.bound(
                      value,
                      /* isInclusive */ comparison ===
                        Comparison.LessThanOrEqual,
                    ),
                  ),
                ),
              );

            case Comparison.GreaterThan:
            case Comparison.GreaterThanOrEqual:
              return tryFrom(
                Option.of(
                  Value.maximumRange(
                    Value.bound(
                      value,
                      /* isInclusive */ comparison ===
                        Comparison.GreaterThanOrEqual,
                    ),
                  ),
                ),
              );
          }
        },
      ),
    );
  }

  /**
   * @internal
   */
  export function parseFeature<N extends string = string>(
    name: N,
    withRange: boolean,
    tryFrom: (value: Option<Value<any>>) => Result<Feature<N>, string>,
  ): CSSParser<Feature> {
    return either(
      withRange
        ? parseRange(name, tryFrom)
        : () => Err.of(`${name} not allowed in range context`),
      parsePlain(name, withRange, tryFrom),
      parseBoolean(name, tryFrom),
    );
  }
}
