import { Length, Numeric, String, Token } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { None, Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";

import * as json from "@siteimprove/alfa-json";

import { Media } from "./media";
import { Resolver } from "./resolver";
import { Value } from "./value";
import { Err, Result } from "@siteimprove/alfa-result";

const {
  delimited,
  either,
  left,
  map,
  mapResult,
  option,
  pair,
  right,
  separatedPair,
} = Parser;

/**
 * @see https://drafts.csswg.org/mediaqueries/#media-feature
 */
export abstract class Feature<
  N extends string = string,
  T extends Value.AllowedValue = Value.AllowedValue
> implements Media.Queryable<Feature.JSON> {
  protected readonly _value: Option<Value<T>>;

  protected constructor(value: Option<Value<T>>) {
    this._value = value;
  }

  public abstract get name(): N;

  public get value(): Option<Value<T>> {
    return this._value;
  }

  public get isKnown(): boolean {
    return true;
  }

  public abstract matches(device: Device): boolean;

  public equals(value: unknown): value is this {
    return (
      value instanceof Feature &&
      value.name === this.name &&
      value._value.equals(this._value)
    );
  }

  public toJSON(): Feature.JSON<N> {
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
  export interface JSON<N extends string = string> {
    [key: string]: json.JSON;
    type: "feature";
    name: N;
    value: Value.JSON | null;
  }

  export class Unknown extends Feature {
    public static of(value: Value<Value.AllowedValue>, name: string): Unknown {
      return new Unknown(Option.of(value), name);
    }

    public static boolean(name: string): Unknown {
      return new Unknown(None, name);
    }

    private readonly _name: string;

    private constructor(
      value: Option<Value<Value.AllowedValue>>,
      name: string
    ) {
      super(value);
      this._name = name;
    }

    public get name(): string {
      return this._name;
    }

    public get isKnown(): false {
      return false;
    }

    public matches(): boolean {
      return false;
    }
  }

  export const { of: unknown, boolean: booleanUnknown } = Unknown;

  /**
   * @see https://drafts.csswg.org/mediaqueries/#width
   */
  export class Width extends Feature<"width", Length> {
    public static of(value: Value<Length>): Width {
      return new Width(Option.of(value));
    }

    private static _boolean = new Width(None);

    public static boolean(): Width {
      return Width._boolean;
    }

    public get name(): "width" {
      return "width";
    }

    public static validate(
      value: Value<Value.AllowedValue>
    ): value is Value<Length> {
      return (
        (Value.isDiscrete(value) && Length.isLength(value.value)) ||
        (Value.isRange(value) &&
          value.minimum.every((min) => Length.isLength(min.value)) &&
          value.maximum.every((max) => Length.isLength(max.value)))
      );
    }

    public matches(device: Device): boolean {
      const {
        viewport: { width },
      } = device;

      const value = this._value.map((value) =>
        value.map((length) => Resolver.length(length, device))
      );

      return width > 0
        ? value.some((value) => value.matches(Length.of(width, "px")))
        : value.every((value) => value.matches(Length.of(0, "px")));
    }
  }

  export const { of: width, boolean: booleanWidth } = Width;

  /**
   * @see https://drafts.csswg.org/mediaqueries/#height
   */
  export class Height extends Feature<"height", Length> {
    public static of(value: Value<Length>): Height {
      return new Height(Option.of(value));
    }

    private static _boolean = new Width(None);

    public static boolean(): Width {
      return Height._boolean;
    }

    public get name(): "height" {
      return "height";
    }

    public static validate(
      value: Value<Value.AllowedValue>
    ): value is Value<Length> {
      return (
        (Value.isDiscrete(value) && Length.isLength(value.value)) ||
        (Value.isRange(value) &&
          value.minimum.every((min) => Length.isLength(min.value)) &&
          value.maximum.every((max) => Length.isLength(max.value)))
      );
    }

    public matches(device: Device): boolean {
      const {
        viewport: { height },
      } = device;

      const value = this._value.map((value) =>
        value.map((length) => Resolver.length(length, device))
      );

      return height > 0
        ? value.some((value) => value.matches(Length.of(height, "px")))
        : value.every((value) => value.matches(Length.of(0, "px")));
    }
  }

  export const { of: height, boolean: booleanHeight } = Height;

  /**
   * @see https://drafts.csswg.org/mediaqueries/#orientation
   */
  export class Orientation extends Feature<
    "orientation",
    String<"landscape" | "portrait">
  > {
    public static of(
      value: Value<String<"landscape"> | String<"portrait">>
    ): Orientation {
      return new Orientation(Option.of(value));
    }

    private static _boolean = new Orientation(None);

    public static boolean(): Orientation {
      return Orientation._boolean;
    }

    public get name(): "orientation" {
      return "orientation";
    }

    public static validate(
      value: Value<Value.AllowedValue>
    ): value is
      | Value.Discrete<String<"landscape">>
      | Value.Discrete<String<"portrait">> {
      return (
        Value.isDiscrete(value) &&
        String.isString(value.value) &&
        ["landscape", "portrait"].includes(value.value.value)
      );
    }

    public matches(device: Device): boolean {
      return this._value.every((value) =>
        value.matches(
          String.of(device.viewport.orientation as "landscape" | "portrait")
        )
      );
    }
  }

  export const { of: orientation, boolean: booleanOrientation } = Orientation;

  /**
   * @see https://drafts.csswg.org/mediaqueries-5/#scripting
   */
  export class Scripting extends Feature<
    "scripting",
    String<"none" | "enabled" | "initial-only">
  > {
    public static of(
      value:
        | Value<String<"none">>
        | Value<String<"enabled">>
        | Value<String<"initial-only">>
    ): Scripting {
      return new Scripting(Option.of(value));
    }

    private static _boolean = new Scripting(None);

    public static boolean(): Scripting {
      return Scripting._boolean;
    }

    public get name(): "scripting" {
      return "scripting";
    }

    public static validate(
      value: Value<Value.AllowedValue>
    ): value is
      | Value.Discrete<String<"none">>
      | Value.Discrete<String<"enabled">>
      | Value.Discrete<String<"initial-only">> {
      return (
        Value.isDiscrete(value) &&
        String.isString(value.value) &&
        ["none", "enabled", "initial-only"].includes(value.value.value)
      );
    }

    public matches(device: Device): boolean {
      return device.scripting.enabled
        ? this._value.every((value) => value.matches(String.of("enabled")))
        : this._value.some((value) => value.matches(String.of("none")));
    }
  }

  export const { of: scripting, boolean: booleanScripting } = Scripting;

  export function isFeature(value: unknown): value is Feature {
    return value instanceof Feature;
  }

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-mf-comparison
   */
  enum Comparison {
    LT = "<",
    LE = "<=",
    EQ = "=",
    GE = ">=",
    GT = ">",
  }

  const parseComparison = either(
    either(
      map(
        pair(Token.parseDelim("<"), Token.parseDelim("=")),
        () => Comparison.LE
      ),
      map(
        pair(Token.parseDelim(">"), Token.parseDelim("=")),
        () => Comparison.GE
      )
    ),
    map(Token.parseDelim("="), () => Comparison.EQ),
    map(Token.parseDelim("<"), () => Comparison.LT),
    map(Token.parseDelim(">"), () => Comparison.GT)
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-mf-name
   */
  const parseName = map(Token.parseIdent(), (ident) =>
    ident.value.toLowerCase()
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-mf-plain
   */
  const parsePlain = map(
    separatedPair(
      parseName,
      delimited(option(Token.parseWhitespace), Token.parseColon),
      Value.parse
    ),
    ([name, value]) => {
      if (name.startsWith("min-") || name.startsWith("max-")) {
        const range = name.startsWith("min-")
          ? Value.minimumRange
          : Value.maximumRange;

        name = name.slice(4);

        const foo = range(Value.bound(value, true));
        switch (name) {
          case "width":
            if (Width.validate(foo)) {
              return Feature.width(foo);
            } else {
              break;
            }

          case "height":
            if (Height.validate(foo)) {
              return Feature.height(foo);
            } else {
              break;
            }
        }
      } else {
        const foo = Value.discrete(value);
        switch (name) {
          case "width":
            if (Width.validate(foo)) {
              return Feature.width(foo);
            } else {
              break;
            }

          case "height":
            if (Height.validate(foo)) {
              return Feature.height(foo);
            } else {
              break;
            }

          case "orientation":
            if (Orientation.validate(foo)) {
              return Feature.orientation(foo);
            } else {
              break;
            }

          case "scripting":
            if (Scripting.validate(foo)) {
              return Feature.scripting(foo);
            } else {
              break;
            }
        }
      }

      return Feature.unknown(Value.discrete(value), name);
    }
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-mf-boolean
   */
  const parseBoolean = map(parseName, (name) => {
    switch (name) {
      case "width":
        return Feature.booleanWidth();

      case "height":
        return Feature.booleanHeight();

      case "orientation":
        return Feature.booleanOrientation();

      case "scripting":
        return Feature.booleanScripting();

      default:
        return Feature.booleanUnknown(name);
    }
  });

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-mf-range
   */
  function combine(
    first: Option<Value>,
    second: Option<Value>
  ): Result<Value, string> {
    if (first.isNone() && second.isNone()) {
      return Err.of("Can't combine two empty values");
    }

    if (first.isNone() || second.isNone()) {
      // they cannot be both None due to the previous test.
      // need to defer eval of second.get() since it may be None
      return Result.of(first.getOrElse(() => second.get()));
    }

    // They are both Some due to the previous test.
    const value1 = first.get();
    const value2 = second.get();
    if (Value.isRange(value1) && Value.isRange(value2)) {
      return Value.Range.combine(value1, value2);
    }

    return Err.of("Don't know how to combine these values");
  }

  function buildValue(
    value: Value.AllowedValue,
    comparison: Comparison,
    isLeft: boolean
  ): Result<Value, string> {
    if (!Numeric.isNumeric(value)) {
      // This is not fully correct since some discrete features have 0/1 values
      // (hence numeric but technically disallowed in range contexts)
      return Err.of("Only numeric values may be used in a range context");
    }

    if (comparison === Comparison.EQ) {
      return Result.of(Value.discrete(value) as Value);
    }

    const inclusive =
      comparison === Comparison.LE || comparison === Comparison.GE;
    // value < feature => minimum bound
    // value > feature => maximum bound
    // feature < value => maximum bound
    // feature > value => minimum bound
    const range =
      (comparison === Comparison.LT || comparison === Comparison.LE) === isLeft
        ? Value.minimumRange
        : Value.maximumRange;

    return Result.of(range(Value.bound(value, inclusive)));
  }

  export const parseLeftRange = mapResult(
    separatedPair(Value.parse, Token.parseWhitespace, parseComparison),
    ([value, comparison]) => buildValue(value, comparison, true)
  );

  export const parseRightRange = mapResult(
    separatedPair(parseComparison, Token.parseWhitespace, Value.parse),
    ([comparison, value]) => buildValue(value, comparison, false)
  );

  export const parseRange = mapResult(
    pair(
      option(left(parseLeftRange, Token.parseWhitespace)),
      pair(parseName, option(right(Token.parseWhitespace, parseRightRange)))
    ),
    ([left, [name, right]]) => {
      return combine(left, right).map((value) =>
        // TODO
        name === "width"
          ? Width.of(value as Value<Length>)
          : Unknown.of(value, name)
      );
    }
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-media-feature
   */
  export const parse = mapResult(
    delimited(
      Token.parseOpenParenthesis,
      delimited(
        option(Token.parseWhitespace),
        either(parseRange, parsePlain, parseBoolean)
      ),
      Token.parseCloseParenthesis
    ),
    (feature) =>
      feature.isKnown
        ? Result.of(feature)
        : Err.of(`Unknown feature ${feature}`)
  );
}
