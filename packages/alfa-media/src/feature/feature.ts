import {
  Keyword,
  Length,
  Number,
  Percentage,
  Token,
} from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Iterable } from "@siteimprove/alfa-iterable";
import * as json from "@siteimprove/alfa-json";
import { Serializable } from "@siteimprove/alfa-json";
import { None, Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok, Result } from "@siteimprove/alfa-result";

import type { Matchable } from "../matchable";
import { Value } from "../value";
import { Resolver } from "../resolver";

const {
  delimited,
  either,
  filter,
  map,
  mapResult,
  option,
  pair,
  right,
  separated,
} = Parser;
const { equals, property } = Predicate;

/**
 * {@link https://drafts.csswg.org/mediaqueries-5/#mq-features}
 */
export abstract class Feature<T = unknown>
  implements
    Matchable,
    Iterable<Feature<T>>,
    Equatable,
    Serializable<Feature.JSON>
{
  protected readonly _value: Option<Value<T>>;

  protected constructor(value: Option<Value<T>>) {
    this._value = value;
  }

  public abstract get name(): string;

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

  public *iterator(): Iterator<Feature<T>> {
    yield this;
  }

  public [Symbol.iterator](): Iterator<Feature<T>> {
    return this.iterator();
  }

  public toJSON(): Feature.JSON {
    return {
      type: "feature",
      name: this.name,
      value: this._value.map((value) => value.toJSON()).getOr(null),
    };
  }

  public toString(): string {
    return `${this.name}${this._value.map((value) => `: ${value}`).getOr("")}`;
  }
}

export namespace Feature {
  export interface JSON {
    [key: string]: json.JSON;
    type: "feature";
    name: string;
    value: Value.JSON | null;
  }

  export function tryFrom(
    value: Option<Value<any>>,
    name: string,
  ): Result<Feature, string> {
    switch (name) {
      case "width":
        return Width.tryFrom(value);

      case "height":
        return Height.tryFrom(value);

      case "orientation":
        return Orientation.tryFrom(value);

      case "scripting":
        return Scripting.tryFrom(value);
    }

    return Err.of(`Unknown media feature ${name}`);
  }

  /**
   * {@link https://drafts.csswg.org/mediaqueries-5/#width}
   */
  class Width extends Feature<Length.Fixed> {
    public static of(value: Value<Length.Fixed>): Width {
      return new Width(Option.of(value));
    }

    private static _boolean = new Width(None);

    public static boolean(): Width {
      return Width._boolean;
    }

    public get name(): "width" {
      return "width";
    }

    public matches(device: Device): boolean {
      const {
        viewport: { width },
      } = device;

      const value = this._value.map((value) =>
        value.map((length) => length.resolve(Resolver.length(device))),
      );

      return width > 0
        ? value.some((value) => value.matches(Length.of(width, "px")))
        : value.every((value) => value.matches(Length.of(0, "px")));
    }
  }

  namespace Width {
    export function tryFrom(value: Option<Value>): Result<Width, string> {
      return value
        .map((value) => (Value.Range.isRange(value) ? value.toLength() : value))
        .map((value) => {
          if (
            value.hasValue(Length.isLength) &&
            value.hasValue(
              (value): value is Length.Fixed => !value.hasCalculation(),
            )
          ) {
            return Ok.of(Width.of(value));
          }

          return Err.of(`Invalid value`);
        })
        .getOrElse(() => Ok.of(Width.boolean()));
    }

    export function isWidth(value: Feature): value is Width;

    export function isWidth(value: unknown): value is Width;

    export function isWidth(value: unknown): value is Width {
      return value instanceof Width;
    }
  }

  export const { isWidth } = Width;

  /**
   * {@link https://drafts.csswg.org/mediaqueries-5/#height}
   */
  class Height extends Feature<Length.Fixed> {
    public static of(value: Value<Length.Fixed>): Height {
      return new Height(Option.of(value));
    }

    private static _boolean = new Height(None);

    public static boolean(): Height {
      return Height._boolean;
    }

    public get name(): "height" {
      return "height";
    }

    public matches(device: Device): boolean {
      const {
        viewport: { height },
      } = device;

      const value = this._value.map((value) =>
        value.map((length) => length.resolve(Resolver.length(device))),
      );

      return height > 0
        ? value.some((value) => value.matches(Length.of(height, "px")))
        : value.every((value) => value.matches(Length.of(0, "px")));
    }
  }

  namespace Height {
    export function tryFrom(value: Option<Value>): Result<Height, string> {
      return value
        .map((value) => (Value.Range.isRange(value) ? value.toLength() : value))
        .map((value) => {
          if (
            value.hasValue(Length.isLength) &&
            value.hasValue(
              (value): value is Length.Fixed => !value.hasCalculation(),
            )
          ) {
            return Ok.of(Height.of(value));
          }

          return Err.of(`Invalid value`);
        })
        .getOrElse(() => Ok.of(Height.boolean()));
    }

    export function isHeight(value: Feature): value is Height;

    export function isHeight(value: unknown): value is Height;

    export function isHeight(value: unknown): value is Height {
      return value instanceof Height;
    }
  }

  export const { isHeight } = Height;

  /**
   * {@link https://drafts.csswg.org/mediaqueries-5/#orientation}
   */
  class Orientation extends Feature<Keyword> {
    public static of(value: Value<Keyword>): Orientation {
      return new Orientation(Option.of(value));
    }

    private static _boolean = new Orientation(None);

    public static boolean(): Orientation {
      return Orientation._boolean;
    }

    public get name(): "orientation" {
      return "orientation";
    }

    public matches(device: Device): boolean {
      return this._value.every((value) =>
        value.matches(Keyword.of(device.viewport.orientation)),
      );
    }
  }

  namespace Orientation {
    export function tryFrom(
      value: Option<Value<any>>,
    ): Result<Orientation, string> {
      return value
        .map((value) => {
          if (
            Value.isDiscrete(value) &&
            value.hasValue(
              Refinement.and(
                Keyword.isKeyword,
                property("value", equals("landscape", "portrait")),
              ),
            )
          ) {
            return Ok.of(Orientation.of(value));
          } else {
            return Err.of(`Invalid value`);
          }
        })
        .getOrElse(() => Ok.of(Orientation.boolean()));
    }
  }

  /**
   * {@link https://drafts.csswg.org/mediaqueries-5/#scripting}
   */
  class Scripting extends Feature<Keyword> {
    public static of(value: Value<Keyword>): Scripting {
      return new Scripting(Option.of(value));
    }

    private static _boolean = new Scripting(None);

    public static boolean(): Scripting {
      return Scripting._boolean;
    }

    public get name(): "scripting" {
      return "scripting";
    }

    public matches(device: Device): boolean {
      return device.scripting.enabled
        ? this._value.every((value) => value.matches(Keyword.of("enabled")))
        : this._value.some((value) => value.matches(Keyword.of("none")));
    }
  }

  namespace Scripting {
    export function tryFrom(
      value: Option<Value<any>>,
    ): Result<Scripting, string> {
      return value
        .map((value) => {
          if (
            Value.isDiscrete(value) &&
            value.hasValue(
              Refinement.and(
                Keyword.isKeyword,
                property("value", equals("none", "enabled", "initial-only")),
              ),
            )
          ) {
            return Ok.of(Scripting.of(value));
          } else {
            return Err.of(`Invalid value`);
          }
        })
        .getOrElse(() => Ok.of(Scripting.boolean()));
    }
  }

  export function isFeature(value: unknown): value is Feature {
    return value instanceof Feature;
  }
}

export enum Comparison {
  LessThan = "<",
  LessThanOrEqual = "<=",
  Equal = "=",
  GreaterThan = ">",
  GreaterThanOrEqual = ">=",
}

/**
 * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-mf-name}
 */
const parseFeatureName = map(Token.parseIdent(), (ident) =>
  ident.value.toLowerCase(),
);

/**
 * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-mf-value}
 *
 * @remarks
 * We currently do not support calculations in media queries
 */
const parseFeatureValue = either(
  either(
    filter(
      Number.parse,
      (number) => !number.hasCalculation(),
      () => "Calculations no supported in media queries",
    ),
    map(Token.parseIdent(), (ident) => Keyword.of(ident.value.toLowerCase())),
  ),
  either(
    map(
      separated(
        Token.parseNumber((number) => number.isInteger),
        delimited(option(Token.parseWhitespace), Token.parseDelim("/")),
        Token.parseNumber((number) => number.isInteger),
      ),
      ([left, right]) => Percentage.of(left.value / right.value),
    ),
    filter(
      Length.parse,
      (length) => !length.hasCalculation(),
      () => "Calculations no supported in media queries",
    ),
  ),
);

/**
 * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-mf-plain}
 */
const parseFeaturePlain = mapResult(
  separated(
    parseFeatureName,
    delimited(option(Token.parseWhitespace), Token.parseColon),
    parseFeatureValue,
  ),
  ([name, value]) => {
    if (name.startsWith("min-") || name.startsWith("max-")) {
      const range = name.startsWith("min-")
        ? Value.minimumRange
        : Value.maximumRange;

      name = name.slice(4);

      return Feature.tryFrom(
        Option.of(range(Value.bound(value, /* isInclusive */ true))),
        name,
      );
    } else {
      return Feature.tryFrom(Option.of(Value.discrete(value)), name);
    }
  },
);

/**
 * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-mf-boolean}
 */
const parseFeatureBoolean = mapResult(parseFeatureName, (name) =>
  Feature.tryFrom(None, name),
);

/**
 * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-mf-lt}
 */
const parseFeatureLessThan = map(
  right(Token.parseDelim("<"), option(Token.parseDelim("="))),
  (equal) =>
    equal.isNone() ? Comparison.LessThan : Comparison.LessThanOrEqual,
);

/**
 * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-mf-gt}
 */
const parseFeatureGreaterThan = map(
  right(Token.parseDelim(">"), option(Token.parseDelim("="))),
  (equal) =>
    equal.isNone() ? Comparison.GreaterThan : Comparison.GreaterThanOrEqual,
);

/**
 * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-mf-eq}
 */
const parseFeatureEqual = map(Token.parseDelim("="), () => Comparison.Equal);

/**
 * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-mf-comparison}
 */
const parseFeatureComparison = either(
  parseFeatureEqual,
  parseFeatureLessThan,
  parseFeatureGreaterThan,
);

/**
 * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-mf-range}
 */
const parseFeatureRange = either(
  // <mf-value> <mf-lt> <mf-name> <mf-lt> <mf-value>
  mapResult(
    pair(
      map(
        pair(
          parseFeatureValue,
          delimited(option(Token.parseWhitespace), parseFeatureLessThan),
        ),
        ([value, comparison]) =>
          Value.bound(
            value,
            /* isInclusive */ comparison === Comparison.LessThanOrEqual,
          ),
      ),
      pair(
        delimited(option(Token.parseWhitespace), parseFeatureName),
        map(
          pair(
            delimited(option(Token.parseWhitespace), parseFeatureLessThan),
            parseFeatureValue,
          ),
          ([comparison, value]) =>
            Value.bound(
              value,
              /* isInclusive */ comparison === Comparison.LessThanOrEqual,
            ),
        ),
      ),
    ),
    ([minimum, [name, maximum]]) =>
      Feature.tryFrom(Option.of(Value.range(minimum, maximum)), name),
  ),

  // <mf-value> <mf-gt> <mf-name> <mf-gt> <mf-value>
  mapResult(
    pair(
      map(
        pair(
          parseFeatureValue,
          delimited(option(Token.parseWhitespace), parseFeatureGreaterThan),
        ),
        ([value, comparison]) =>
          Value.bound(
            value,
            /* isInclusive */ comparison === Comparison.GreaterThanOrEqual,
          ),
      ),
      pair(
        delimited(option(Token.parseWhitespace), parseFeatureName),
        map(
          pair(
            delimited(option(Token.parseWhitespace), parseFeatureGreaterThan),
            parseFeatureValue,
          ),
          ([comparison, value]) =>
            Value.bound(
              value,
              /* isInclusive */ comparison === Comparison.GreaterThanOrEqual,
            ),
        ),
      ),
    ),
    ([maximum, [name, minimum]]) =>
      Feature.tryFrom(Option.of(Value.range(minimum, maximum)), name),
  ),

  // <mf-name> <mf-comparison> <mf-value>
  mapResult(
    pair(
      parseFeatureName,
      pair(
        delimited(option(Token.parseWhitespace), parseFeatureComparison),
        parseFeatureValue,
      ),
    ),
    ([name, [comparison, value]]) => {
      switch (comparison) {
        case Comparison.Equal:
          return Feature.tryFrom(
            Option.of(
              Value.range(
                Value.bound(value, /* isInclude */ true),
                Value.bound(value, /* isInclude */ true),
              ),
            ),
            name,
          );

        case Comparison.LessThan:
        case Comparison.LessThanOrEqual:
          return Feature.tryFrom(
            Option.of(
              Value.maximumRange(
                Value.bound(
                  value,
                  /* isInclusive */ comparison === Comparison.LessThanOrEqual,
                ),
              ),
            ),
            name,
          );

        case Comparison.GreaterThan:
        case Comparison.GreaterThanOrEqual:
          return Feature.tryFrom(
            Option.of(
              Value.minimumRange(
                Value.bound(
                  value,
                  /* isInclusive */ comparison ===
                    Comparison.GreaterThanOrEqual,
                ),
              ),
            ),
            name,
          );
      }
    },
  ),

  // <mf-value> <mf-comparison> <mf-name>
  mapResult(
    pair(
      parseFeatureValue,
      pair(
        delimited(option(Token.parseWhitespace), parseFeatureComparison),
        parseFeatureName,
      ),
    ),
    ([value, [comparison, name]]) => {
      switch (comparison) {
        case Comparison.Equal:
          return Feature.tryFrom(
            Option.of(
              Value.range(
                Value.bound(value, /* isInclude */ true),
                Value.bound(value, /* isInclude */ true),
              ),
            ),
            name,
          );

        case Comparison.LessThan:
        case Comparison.LessThanOrEqual:
          return Feature.tryFrom(
            Option.of(
              Value.minimumRange(
                Value.bound(
                  value,
                  /* isInclusive */ comparison === Comparison.LessThanOrEqual,
                ),
              ),
            ),
            name,
          );

        case Comparison.GreaterThan:
        case Comparison.GreaterThanOrEqual:
          return Feature.tryFrom(
            Option.of(
              Value.maximumRange(
                Value.bound(
                  value,
                  /* isInclusive */ comparison ===
                    Comparison.GreaterThanOrEqual,
                ),
              ),
            ),
            name,
          );
      }
    },
  ),
);

/**
 * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-media-feature}
 */
export const parseMediaFeature = delimited(
  Token.parseOpenParenthesis,
  delimited(
    option(Token.parseWhitespace),
    either(parseFeatureRange, parseFeaturePlain, parseFeatureBoolean),
  ),
  Token.parseCloseParenthesis,
);
