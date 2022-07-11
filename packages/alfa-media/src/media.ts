import { Comparable } from "@siteimprove/alfa-comparable";
import {
  Length,
  Keyword,
  Number,
  Percentage,
  Token,
  Component,
  Lexer,
} from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Functor } from "@siteimprove/alfa-functor";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Map } from "@siteimprove/alfa-map";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Option, None } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Result, Err, Ok } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import * as json from "@siteimprove/alfa-json";

import { Resolver } from "./resolver";

const {
  either,
  delimited,
  end,
  left,
  right,
  map,
  mapResult,
  option,
  pair,
  oneOrMore,
  zeroOrMore,
  takeUntil,
  separated,
  separatedList,
} = Parser;

const { property, equals } = Predicate;

/**
 * @public
 */
export namespace Media {
  /**
   * {@link https://drafts.csswg.org/mediaqueries/#media-query-modifier}
   */
  export enum Modifier {
    Only = "only",
    Not = "not",
  }

  const parseModifier = either(
    map(Token.parseIdent("only"), () => Modifier.Only),
    map(Token.parseIdent("not"), () => Modifier.Not)
  );

  interface Matchable {
    readonly matches: Predicate<Device>;
  }

  /**
   * {@link https://drafts.csswg.org/mediaqueries/#media-type}
   */
  export class Type implements Matchable, Equatable, Serializable<Type.JSON> {
    public static of(name: string): Type {
      return new Type(name);
    }

    private readonly _name: string;

    private constructor(name: string) {
      this._name = name;
    }

    public get name(): string {
      return this._name;
    }

    public matches(device: Device): boolean {
      switch (this._name) {
        case "screen":
          return device.type === Device.Type.Screen;

        case "print":
          return device.type === Device.Type.Print;

        case "speech":
          return device.type === Device.Type.Speech;

        case "all":
          return true;

        default:
          return false;
      }
    }

    public equals(value: unknown): value is this {
      return value instanceof Type && value._name === this._name;
    }

    public toJSON(): Type.JSON {
      return {
        name: this._name,
      };
    }

    public toString(): string {
      return this._name;
    }
  }

  export namespace Type {
    export interface JSON {
      [key: string]: json.JSON;
      name: string;
    }

    export function isType(value: unknown): value is Type {
      return value instanceof Type;
    }
  }

  export const { of: type, isType } = Type;

  /**
   * {@link https://drafts.csswg.org/mediaqueries/#typedef-media-type}
   */
  const parseType = map(
    Token.parseIdent((ident) => {
      switch (ident.value) {
        // These values are not allowed as media types.
        case "only":
        case "not":
        case "and":
        case "or":
          return false;

        default:
          return true;
      }
    }),
    (ident) => Type.of(ident.value)
  );

  /**
   * {@link https://drafts.csswg.org/mediaqueries/#media-feature}
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
      return `${this.name}${this._value
        .map((value) => `: ${value}`)
        .getOr("")}`;
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
      name: string
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
     * {@link https://drafts.csswg.org/mediaqueries/#width}
     */
    class Width extends Feature<Length> {
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

    namespace Width {
      export function tryFrom(value: Option<Value>): Result<Width, string> {
        return value
          .map((value) =>
            Value.Range.isRange(value) ? value.toLength() : value
          )
          .map((value) => {
            if (value.hasValue(Length.isLength)) {
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
     * {@link https://drafts.csswg.org/mediaqueries/#height}
     */
    class Height extends Feature<Length> {
      public static of(value: Value<Length>): Height {
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
          value.map((length) => Resolver.length(length, device))
        );

        return height > 0
          ? value.some((value) => value.matches(Length.of(height, "px")))
          : value.every((value) => value.matches(Length.of(0, "px")));
      }
    }

    namespace Height {
      export function tryFrom(value: Option<Value>): Result<Height, string> {
        return value
          .map((value) =>
            Value.Range.isRange(value) ? value.toLength() : value
          )
          .map((value) => {
            if (value.hasValue(Length.isLength)) {
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
     * {@link https://drafts.csswg.org/mediaqueries/#orientation}
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
          value.matches(Keyword.of(device.viewport.orientation))
        );
      }
    }

    namespace Orientation {
      export function tryFrom(
        value: Option<Value<any>>
      ): Result<Orientation, string> {
        return value
          .map((value) => {
            if (
              Value.isDiscrete(value) &&
              value.hasValue(
                Refinement.and(
                  Keyword.isKeyword,
                  property("value", equals("landscape", "portrait"))
                )
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
        value: Option<Value<any>>
      ): Result<Scripting, string> {
        return value
          .map((value) => {
            if (
              Value.isDiscrete(value) &&
              value.hasValue(
                Refinement.and(
                  Keyword.isKeyword,
                  property("value", equals("none", "enabled", "initial-only"))
                )
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

  export const { isFeature } = Feature;

  export enum Comparison {
    LessThan = "<",
    LessThanOrEqual = "<=",
    Equal = "=",
    GreaterThan = ">",
    GreaterThanOrEqual = ">=",
  }

  /**
   * {@link https://drafts.csswg.org/mediaqueries/#typedef-mf-name}
   */
  const parseFeatureName = map(Token.parseIdent(), (ident) =>
    ident.value.toLowerCase()
  );

  /**
   * {@link https://drafts.csswg.org/mediaqueries/#typedef-mf-value}
   */
  const parseFeatureValue = either(
    either(
      map(Token.parseNumber(), (number) => Number.of(number.value)),
      map(Token.parseIdent(), (ident) => Keyword.of(ident.value.toLowerCase()))
    ),
    either(
      map(
        separated(
          Token.parseNumber((number) => number.isInteger),
          delimited(option(Token.parseWhitespace), Token.parseDelim("/")),
          Token.parseNumber((number) => number.isInteger)
        ),
        ([left, right]) => Percentage.of(left.value / right.value)
      ),
      Length.parse
    )
  );

  /**
   * {@link https://drafts.csswg.org/mediaqueries/#typedef-mf-plain}
   */
  const parseFeaturePlain = mapResult(
    separated(
      parseFeatureName,
      delimited(option(Token.parseWhitespace), Token.parseColon),
      parseFeatureValue
    ),
    ([name, value]) => {
      if (name.startsWith("min-") || name.startsWith("max-")) {
        const range = name.startsWith("min-")
          ? Value.minimumRange
          : Value.maximumRange;

        name = name.slice(4);

        return Feature.tryFrom(
          Option.of(range(Value.bound(value, /* isInclusive */ true))),
          name
        );
      } else {
        return Feature.tryFrom(Option.of(Value.discrete(value)), name);
      }
    }
  );

  /**
   * {@link https://drafts.csswg.org/mediaqueries/#typedef-mf-boolean}
   */
  const parseFeatureBoolean = mapResult(parseFeatureName, (name) =>
    Feature.tryFrom(None, name)
  );

  /**
   * {@link https://drafts.csswg.org/mediaqueries/#typedef-mf-lt}
   */
  const parseFeatureLessThan = map(
    right(Token.parseDelim("<"), option(Token.parseDelim("="))),
    (equal) =>
      equal.isNone() ? Comparison.LessThan : Comparison.LessThanOrEqual
  );

  /**
   * {@link https://drafts.csswg.org/mediaqueries/#typedef-mf-gt}
   */
  const parseFeatureGreaterThan = map(
    right(Token.parseDelim(">"), option(Token.parseDelim("="))),
    (equal) =>
      equal.isNone() ? Comparison.GreaterThan : Comparison.GreaterThanOrEqual
  );

  /**
   * {@link https://drafts.csswg.org/mediaqueries/#typedef-mf-eq}
   */
  const parseFeatureEqual = map(Token.parseDelim("="), () => Comparison.Equal);

  /**
   * {@link https://drafts.csswg.org/mediaqueries/#typedef-mf-comparison}
   */
  const parseFeatureComparison = either(
    parseFeatureEqual,
    parseFeatureLessThan,
    parseFeatureGreaterThan
  );

  /**
   * {@link https://drafts.csswg.org/mediaqueries/#typedef-mf-range}
   */
  const parseFeatureRange = either(
    // <mf-value> <mf-lt> <mf-name> <mf-lt> <mf-value>
    mapResult(
      pair(
        map(
          pair(
            parseFeatureValue,
            delimited(option(Token.parseWhitespace), parseFeatureLessThan)
          ),
          ([value, comparison]) =>
            Value.bound(
              value,
              /* isInclusive */ comparison === Comparison.LessThanOrEqual
            )
        ),
        pair(
          delimited(option(Token.parseWhitespace), parseFeatureName),
          map(
            pair(
              delimited(option(Token.parseWhitespace), parseFeatureLessThan),
              parseFeatureValue
            ),
            ([comparison, value]) =>
              Value.bound(
                value,
                /* isInclusive */ comparison === Comparison.LessThanOrEqual
              )
          )
        )
      ),
      ([minimum, [name, maximum]]) =>
        Feature.tryFrom(Option.of(Value.range(minimum, maximum)), name)
    ),

    // <mf-value> <mf-gt> <mf-name> <mf-gt> <mf-value>
    mapResult(
      pair(
        map(
          pair(
            parseFeatureValue,
            delimited(option(Token.parseWhitespace), parseFeatureGreaterThan)
          ),
          ([value, comparison]) =>
            Value.bound(
              value,
              /* isInclusive */ comparison === Comparison.GreaterThanOrEqual
            )
        ),
        pair(
          delimited(option(Token.parseWhitespace), parseFeatureName),
          map(
            pair(
              delimited(option(Token.parseWhitespace), parseFeatureGreaterThan),
              parseFeatureValue
            ),
            ([comparison, value]) =>
              Value.bound(
                value,
                /* isInclusive */ comparison === Comparison.GreaterThanOrEqual
              )
          )
        )
      ),
      ([maximum, [name, minimum]]) =>
        Feature.tryFrom(Option.of(Value.range(minimum, maximum)), name)
    ),

    // <mf-name> <mf-comparison> <mf-value>
    mapResult(
      pair(
        parseFeatureName,
        pair(
          delimited(option(Token.parseWhitespace), parseFeatureComparison),
          parseFeatureValue
        )
      ),
      ([name, [comparison, value]]) => {
        switch (comparison) {
          case Comparison.Equal:
            return Feature.tryFrom(
              Option.of(
                Value.range(
                  Value.bound(value, /* isInclude */ true),
                  Value.bound(value, /* isInclude */ true)
                )
              ),
              name
            );

          case Comparison.LessThan:
          case Comparison.LessThanOrEqual:
            return Feature.tryFrom(
              Option.of(
                Value.maximumRange(
                  Value.bound(
                    value,
                    /* isInclusive */ comparison === Comparison.LessThanOrEqual
                  )
                )
              ),
              name
            );

          case Comparison.GreaterThan:
          case Comparison.GreaterThanOrEqual:
            return Feature.tryFrom(
              Option.of(
                Value.minimumRange(
                  Value.bound(
                    value,
                    /* isInclusive */ comparison ===
                      Comparison.GreaterThanOrEqual
                  )
                )
              ),
              name
            );
        }
      }
    ),

    // <mf-value> <mf-comparison> <mf-name>
    mapResult(
      pair(
        parseFeatureValue,
        pair(
          delimited(option(Token.parseWhitespace), parseFeatureComparison),
          parseFeatureName
        )
      ),
      ([value, [comparison, name]]) => {
        switch (comparison) {
          case Comparison.Equal:
            return Feature.tryFrom(
              Option.of(
                Value.range(
                  Value.bound(value, /* isInclude */ true),
                  Value.bound(value, /* isInclude */ true)
                )
              ),
              name
            );

          case Comparison.LessThan:
          case Comparison.LessThanOrEqual:
            return Feature.tryFrom(
              Option.of(
                Value.minimumRange(
                  Value.bound(
                    value,
                    /* isInclusive */ comparison === Comparison.LessThanOrEqual
                  )
                )
              ),
              name
            );

          case Comparison.GreaterThan:
          case Comparison.GreaterThanOrEqual:
            return Feature.tryFrom(
              Option.of(
                Value.maximumRange(
                  Value.bound(
                    value,
                    /* isInclusive */ comparison ===
                      Comparison.GreaterThanOrEqual
                  )
                )
              ),
              name
            );
        }
      }
    )
  );

  /**
   * {@link https://drafts.csswg.org/mediaqueries/#typedef-media-feature}
   */
  const parseFeature = delimited(
    Token.parseOpenParenthesis,
    delimited(
      option(Token.parseWhitespace),
      either(parseFeatureRange, parseFeaturePlain, parseFeatureBoolean)
    ),
    Token.parseCloseParenthesis
  );

  export interface Value<T = unknown>
    extends Functor<T>,
      Serializable<Value.JSON> {
    map<U>(mapper: Mapper<T, U>): Value<U>;
    matches(value: T): boolean;
    hasValue<U extends T>(refinement: Refinement<T, U>): this is Value<U>;
    toJSON(): Value.JSON;
  }

  export namespace Value {
    export interface JSON {
      [key: string]: json.JSON;
      type: string;
    }

    export class Discrete<T = unknown>
      implements Value<T>, Serializable<Discrete.JSON<T>>
    {
      public static of<T>(value: T): Discrete<T> {
        return new Discrete(value);
      }

      private readonly _value: T;

      private constructor(value: T) {
        this._value = value;
      }

      public get value(): T {
        return this._value;
      }

      public map<U>(mapper: Mapper<T, U>): Discrete<U> {
        return new Discrete(mapper(this._value));
      }

      public matches(value: T): boolean {
        return Equatable.equals(this._value, value);
      }

      public hasValue<U extends T>(
        refinement: Refinement<T, U>
      ): this is Discrete<U> {
        return refinement(this._value);
      }

      public toJSON(): Discrete.JSON<T> {
        return {
          type: "discrete",
          value: Serializable.toJSON(this._value),
        };
      }
    }

    export namespace Discrete {
      export interface JSON<T> {
        [key: string]: json.JSON;
        type: "discrete";
        value: Serializable.ToJSON<T>;
      }

      export function isDiscrete<T>(value: unknown): value is Discrete<T> {
        return value instanceof Discrete;
      }
    }

    export const { of: discrete, isDiscrete } = Discrete;

    export class Range<T = unknown>
      implements Value<T>, Serializable<Range.JSON<T>>
    {
      public static of<T>(minimum: Bound<T>, maximum: Bound<T>): Range<T> {
        return new Range(Option.of(minimum), Option.of(maximum));
      }

      public static minimum<T>(minimum: Bound<T>): Range<T> {
        return new Range(Option.of(minimum), None);
      }

      public static maximum<T>(maximum: Bound<T>): Range<T> {
        return new Range(None, Option.of(maximum));
      }

      private readonly _minimum: Option<Bound<T>>;
      private readonly _maximum: Option<Bound<T>>;

      private constructor(
        minimum: Option<Bound<T>>,
        maximum: Option<Bound<T>>
      ) {
        this._minimum = minimum;
        this._maximum = maximum;
      }

      public get minimum(): Option<Bound<T>> {
        return this._minimum;
      }

      public get maximum(): Option<Bound<T>> {
        return this._maximum;
      }

      public map<U>(mapper: Mapper<T, U>): Range<U> {
        return new Range(
          this._minimum.map((bound) => bound.map(mapper)),
          this._maximum.map((bound) => bound.map(mapper))
        );
      }

      public toLength(): Range<T | Length<"px">> {
        return this.map((bound) =>
          Refinement.and(Number.isNumber, (value) => value.value === 0)(bound)
            ? Length.of(0, "px")
            : bound
        );
      }

      public matches(value: T): boolean {
        if (!Comparable.isComparable<T>(value)) {
          return false;
        }

        // Since we need to match both bounds, we return false if one is not
        // matched and keep true for the default return at the end.
        for (const minimum of this._minimum) {
          if (minimum.isInclusive) {
            // value is inclusively larger than the minimum if it is not
            // strictly smaller than it.
            if (value.compare(minimum.value) < 0) {
              return false;
            }
          } else {
            if (value.compare(minimum.value) <= 0) {
              return false;
            }
          }
        }

        for (const maximum of this._maximum) {
          if (maximum.isInclusive) {
            if (value.compare(maximum.value) > 0) {
              return false;
            }
          } else {
            if (value.compare(maximum.value) >= 0) {
              return false;
            }
          }
        }

        return true;
      }

      public hasValue<U extends T>(
        refinement: Refinement<T, U>
      ): this is Discrete<U> {
        return (
          this._minimum.every((bound) => refinement(bound.value)) &&
          this._maximum.every((bound) => refinement(bound.value))
        );
      }

      public toJSON(): Range.JSON<T> {
        return {
          type: "range",
          minimum: this._minimum.map((bound) => bound.toJSON()).getOr(null),
          maximum: this._maximum.map((bound) => bound.toJSON()).getOr(null),
        };
      }
    }

    export namespace Range {
      export interface JSON<T> {
        [key: string]: json.JSON;
        type: "range";
        minimum: Bound.JSON<T> | null;
        maximum: Bound.JSON<T> | null;
      }

      export function isRange<T>(value: unknown): value is Range<T> {
        return value instanceof Range;
      }
    }

    export const {
      of: range,
      minimum: minimumRange,
      maximum: maximumRange,
      isRange,
    } = Range;

    export class Bound<T = unknown>
      implements Functor<T>, Serializable<Bound.JSON<T>>
    {
      public static of<T>(value: T, isInclusive: boolean): Bound<T> {
        return new Bound(value, isInclusive);
      }

      private readonly _value: T;
      private readonly _isInclusive: boolean;

      private constructor(value: T, isInclusive: boolean) {
        this._value = value;
        this._isInclusive = isInclusive;
      }

      public get value(): T {
        return this._value;
      }

      public get isInclusive(): boolean {
        return this._isInclusive;
      }

      public map<U>(mapper: Mapper<T, U>): Bound<U> {
        return new Bound(mapper(this._value), this._isInclusive);
      }

      public hasValue<U extends T>(
        refinement: Refinement<T, U>
      ): this is Bound<U> {
        return refinement(this._value);
      }

      public toJSON(): Bound.JSON<T> {
        return {
          value: Serializable.toJSON(this._value),
          isInclusive: this._isInclusive,
        };
      }
    }

    export namespace Bound {
      export interface JSON<T> {
        [key: string]: json.JSON;
        value: Serializable.ToJSON<T>;
        isInclusive: boolean;
      }
    }

    export const { of: bound } = Bound;
  }

  export class And
    implements Matchable, Iterable<Feature>, Equatable, Serializable<And.JSON>
  {
    public static of(
      left: Feature | Condition,
      right: Feature | Condition
    ): And {
      return new And(left, right);
    }

    private readonly _left: Feature | Condition;
    private readonly _right: Feature | Condition;

    private constructor(left: Feature | Condition, right: Feature | Condition) {
      this._left = left;
      this._right = right;
    }

    public get left(): Feature | Condition {
      return this._left;
    }

    public get right(): Feature | Condition {
      return this._right;
    }

    public matches(device: Device): boolean {
      return this._left.matches(device) && this._right.matches(device);
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof And &&
        value._left.equals(this._left) &&
        value._right.equals(this._right)
      );
    }

    public *iterator(): Iterator<Feature> {
      for (const condition of [this._left, this._right]) {
        yield* condition;
      }
    }

    public [Symbol.iterator](): Iterator<Feature> {
      return this.iterator();
    }

    public toJSON(): And.JSON {
      return {
        type: "and",
        left: this._left.toJSON(),
        right: this._right.toJSON(),
      };
    }

    public toString(): string {
      return `(${this._left}) and (${this._right})`;
    }
  }

  export namespace And {
    export interface JSON {
      [key: string]: json.JSON;
      type: "and";
      left: Feature.JSON | Condition.JSON;
      right: Feature.JSON | Condition.JSON;
    }

    export function isAnd(value: unknown): value is And {
      return value instanceof And;
    }
  }

  export const { of: and, isAnd } = And;

  export class Or
    implements Matchable, Iterable<Feature>, Equatable, Serializable<Or.JSON>
  {
    public static of(
      left: Feature | Condition,
      right: Feature | Condition
    ): Or {
      return new Or(left, right);
    }

    private readonly _left: Feature | Condition;
    private readonly _right: Feature | Condition;

    private constructor(left: Feature | Condition, right: Feature | Condition) {
      this._left = left;
      this._right = right;
    }

    public get left(): Feature | Condition {
      return this._left;
    }

    public get right(): Feature | Condition {
      return this._right;
    }

    public matches(device: Device): boolean {
      return this._left.matches(device) || this._right.matches(device);
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof Or &&
        value._left.equals(this._left) &&
        value._right.equals(this._right)
      );
    }

    public *iterator(): Iterator<Feature> {
      for (const condition of [this._left, this._right]) {
        yield* condition;
      }
    }

    public [Symbol.iterator](): Iterator<Feature> {
      return this.iterator();
    }

    public toJSON(): Or.JSON {
      return {
        type: "or",
        left: this._left.toJSON(),
        right: this._right.toJSON(),
      };
    }

    public toString(): string {
      return `(${this._left}) or (${this._right})`;
    }
  }

  export namespace Or {
    export interface JSON {
      [key: string]: json.JSON;
      type: "or";
      left: Feature.JSON | Condition.JSON;
      right: Feature.JSON | Condition.JSON;
    }

    export function isOr(value: unknown): value is Or {
      return value instanceof Or;
    }
  }

  export const { of: or, isOr } = Or;

  export class Not
    implements Matchable, Iterable<Feature>, Equatable, Serializable<Not.JSON>
  {
    public static of(condition: Feature | Condition): Not {
      return new Not(condition);
    }

    private readonly _condition: Feature | Condition;

    private constructor(condition: Feature | Condition) {
      this._condition = condition;
    }

    public get condition(): Feature | Condition {
      return this._condition;
    }

    public matches(device: Device): boolean {
      return !this._condition.matches(device);
    }

    public equals(value: unknown): value is this {
      return value instanceof Not && value._condition.equals(this._condition);
    }

    public *iterator(): Iterator<Feature> {
      yield* this._condition;
    }

    public [Symbol.iterator](): Iterator<Feature> {
      return this.iterator();
    }

    public toJSON(): Not.JSON {
      return {
        type: "not",
        condition: this._condition.toJSON(),
      };
    }

    public toString(): string {
      return `not (${this._condition})`;
    }
  }

  export namespace Not {
    export interface JSON {
      [key: string]: json.JSON;
      type: "not";
      condition: Condition.JSON | Feature.JSON;
    }

    export function isNot(value: unknown): value is Not {
      return value instanceof Not;
    }
  }

  export const { of: not, isNot } = Not;

  /**
   * {@link https://drafts.csswg.org/mediaqueries/#media-condition}
   */
  export type Condition = And | Or | Not;

  export namespace Condition {
    export type JSON = And.JSON | Or.JSON | Not.JSON;

    export function isCondition(value: unknown): value is Condition {
      return isAnd(value) || isOr(value) || isNot(value);
    }
  }

  export const { isCondition } = Condition;

  /**
   * @remarks
   * The condition parser is forward-declared as it is needed within its
   * subparsers.
   */
  let parseCondition: Parser<Slice<Token>, Feature | Condition, string>;

  /**
   * {@link https://drafts.csswg.org/mediaqueries/#typedef-media-in-parens}
   */
  const parseInParens = either(
    delimited(
      Token.parseOpenParenthesis,
      delimited(option(Token.parseWhitespace), (input) =>
        parseCondition(input)
      ),
      Token.parseCloseParenthesis
    ),
    parseFeature
  );

  /**
   * {@link https://drafts.csswg.org/mediaqueries/#typedef-media-not}
   */
  const parseNot = map(
    right(
      delimited(option(Token.parseWhitespace), Token.parseIdent("not")),
      parseInParens
    ),
    not
  );

  /**
   * {@link https://drafts.csswg.org/mediaqueries/#typedef-media-and}
   */
  const parseAnd = right(
    delimited(option(Token.parseWhitespace), Token.parseIdent("and")),
    parseInParens
  );

  /**
   * {@link https://drafts.csswg.org/mediaqueries/#typedef-media-or}
   */
  const parseOr = right(
    delimited(option(Token.parseWhitespace), Token.parseIdent("or")),
    parseInParens
  );

  /**
   * {@link https://drafts.csswg.org/mediaqueries/#typedef-media-condition}
   */
  parseCondition = either(
    parseNot,
    either(
      map(
        pair(
          parseInParens,
          either(
            map(oneOrMore(parseAnd), (queries) => [and, queries] as const),
            map(oneOrMore(parseOr), (queries) => [or, queries] as const)
          )
        ),
        ([left, [constructor, right]]) =>
          Iterable.reduce(
            right,
            (left, right) => constructor(left, right),
            left
          )
      ),
      parseInParens
    )
  );

  /**
   * {@link https://drafts.csswg.org/mediaqueries/#typedef-media-condition-without-or}
   */
  const parseConditionWithoutOr = either(
    parseNot,
    map(pair(parseInParens, zeroOrMore(parseAnd)), ([left, right]) =>
      [left, ...right].reduce((left, right) => and(left, right))
    )
  );

  /**
   * {@link https://drafts.csswg.org/mediaqueries/#media-query}
   */
  export class Query implements Matchable {
    public static of(
      modifier: Option<Modifier>,
      type: Option<Type>,
      condition: Option<Feature | Condition>
    ): Query {
      return new Query(modifier, type, condition);
    }

    private readonly _modifier: Option<Modifier>;
    private readonly _type: Option<Type>;
    private readonly _condition: Option<Feature | Condition>;

    private constructor(
      modifier: Option<Modifier>,
      type: Option<Type>,
      condition: Option<Feature | Condition>
    ) {
      this._modifier = modifier;
      this._type = type;
      this._condition = condition;
    }

    public get modifier(): Option<Modifier> {
      return this._modifier;
    }

    public get type(): Option<Type> {
      return this._type;
    }

    public get condition(): Option<Feature | Condition> {
      return this._condition;
    }

    public matches(device: Device): boolean {
      const negated = this._modifier.some(
        (modifier) => modifier === Modifier.Not
      );

      const type = this._type.every((type) => type.matches(device));

      const condition = this.condition.every((condition) =>
        condition.matches(device)
      );

      return negated !== (type && condition);
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof Query &&
        value._modifier.equals(this._modifier) &&
        value._type.equals(this._type) &&
        value._condition.equals(this._condition)
      );
    }

    public toJSON(): Query.JSON {
      return {
        modifier: this._modifier.getOr(null),
        type: this._type.map((type) => type.toJSON()).getOr(null),
        condition: this._condition
          .map((condition) => condition.toJSON())
          .getOr(null),
      };
    }

    public toString(): string {
      const modifier = this._modifier.getOr("");

      const type = this._type
        .map((type) => (modifier === "" ? `${type}` : `${modifier} ${type}`))
        .getOr("");

      return this._condition
        .map((condition) =>
          type === "" ? `${condition}` : `${type} and ${condition}`
        )
        .getOr(type);
    }
  }

  export namespace Query {
    export interface JSON {
      [key: string]: json.JSON;
      modifier: string | null;
      type: Type.JSON | null;
      condition: Feature.JSON | Condition.JSON | Not.JSON | null;
    }

    export function isQuery(value: unknown): value is Query {
      return value instanceof Query;
    }
  }

  export const { of: query, isQuery } = Query;

  /**
   * {@link https://drafts.csswg.org/mediaqueries/#typedef-media-query}
   */
  const parseQuery = left(
    either(
      map(parseCondition, (condition) =>
        Query.of(None, None, Option.of(condition))
      ),
      map(
        pair(
          pair(
            option(delimited(option(Token.parseWhitespace), parseModifier)),
            parseType
          ),
          option(
            right(
              delimited(option(Token.parseWhitespace), Token.parseIdent("and")),
              parseConditionWithoutOr
            )
          )
        ),
        ([[modifier, type], condition]) =>
          Query.of(modifier, Option.of(type), condition)
      )
    ),
    end(() => `Unexpected token`)
  );

  /**
   * {@link https://drafts.csswg.org/mediaqueries/#media-query-list}
   */
  export class List
    implements Matchable, Iterable<Query>, Equatable, Serializable<List.JSON>
  {
    public static of(queries: Iterable<Query>): List {
      return new List(queries);
    }

    private readonly _queries: Array<Query>;

    private constructor(queries: Iterable<Query>) {
      this._queries = Array.from(queries);
    }

    public get queries(): Iterable<Query> {
      return this._queries;
    }

    public matches(device: Device): boolean {
      return (
        this._queries.length === 0 ||
        this._queries.some((query) => query.matches(device))
      );
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof List &&
        value._queries.length === this._queries.length &&
        value._queries.every((query, i) => query.equals(this._queries[i]))
      );
    }

    public *[Symbol.iterator](): Iterator<Query> {
      yield* this._queries;
    }

    public toJSON(): List.JSON {
      return this._queries.map((query) => query.toJSON());
    }

    public toString(): string {
      return this._queries.join(", ");
    }
  }

  export namespace List {
    export type JSON = Array<Query.JSON>;

    export function isList(value: unknown): value is List {
      return value instanceof List;
    }
  }

  export const { of: list, isList } = List;

  const notAll = Query.of(
    Option.of(Modifier.Not),
    Option.of(Type.of("all")),
    None
  );

  /**
   * {@link https://drafts.csswg.org/mediaqueries/#typedef-media-query-list}
   */
  const parseList = map(
    separatedList(
      map(
        takeUntil(
          Component.consume,
          either(
            Token.parseComma,
            end(() => `Unexpected token`)
          )
        ),
        (components) => Iterable.flatten(components)
      ),
      Token.parseComma
    ),
    (queries) =>
      List.of(
        Iterable.map(queries, (tokens) =>
          parseQuery(Slice.from(tokens).trim(Token.isWhitespace))
            .map(([, query]) => query)
            .getOr(notAll)
        )
      )
  );

  /**
   * Store the lexed and parsed media conditions
   *
   * @private
   */
  let parseMap = Map.empty<string, Result<List, string>>();

  /**
   * Lex and parse a string as a media condition.
   * The results are cached to avoid reparsing the same condition.
   */
  export function parse(condition: string): Result<List, string> {
    return parseMap.get(condition).getOrElse(() => {
      const list = parseList(Lexer.lex(condition)).map(
        ([, queries]) => queries
      );

      parseMap.set(condition, list);

      return list;
    });
  }
}
