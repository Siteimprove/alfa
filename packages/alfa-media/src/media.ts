import { Comparable } from "@siteimprove/alfa-comparable";
import {
  Length,
  String,
  Number,
  Percentage,
  Token,
  Component,
} from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Functor } from "@siteimprove/alfa-functor";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Option, None } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Result, Err } from "@siteimprove/alfa-result";
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

const { and } = Refinement;
const { property, equals } = Predicate;

export namespace Media {
  /**
   * @see https://drafts.csswg.org/mediaqueries/#media-query-modifier
   */
  export enum Modifier {
    Only = "only",
    Not = "not",
  }

  const parseModifier = either(
    map(Token.parseIdent("only"), () => Modifier.Only),
    map(Token.parseIdent("not"), () => Modifier.Not)
  );

  export enum Combinator {
    And = "and",
    Or = "or",
  }

  interface Queryable {
    readonly matches: Predicate<Device>;
  }

  /**
   * @see https://drafts.csswg.org/mediaqueries/#media-type
   */
  export class Type implements Queryable, Equatable, Serializable<Type.JSON> {
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
   * @see https://drafts.csswg.org/mediaqueries/#typedef-media-type
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
   * @see https://drafts.csswg.org/mediaqueries/#media-feature
   */
  export abstract class Feature<T = unknown>
    implements Queryable, Equatable, Serializable<Feature.JSON> {
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

    export function tryFrom(name: string): Result<Feature, string>;

    export function tryFrom<T>(
      name: string,
      value: Value<T>
    ): Result<Feature, string>;

    export function tryFrom(
      name: string,
      value?: Value
    ): Result<Feature, string> {
      if (value) {
        switch (name) {
          case "width":
            if (value.hasValue(Length.isLength)) {
              return Result.of(Width.of(value));
            } else {
              break;
            }

          case "height":
            if (value.hasValue(Length.isLength)) {
              return Result.of(Height.of(value));
            } else {
              break;
            }
        }

        if (Value.isDiscrete(value)) {
          switch (name) {
            case "orientation":
              if (
                value.hasValue(
                  and(
                    String.isString,
                    property("value", equals("landscape", "portrait"))
                  )
                )
              ) {
                return Result.of(Orientation.of(value));
              } else {
                break;
              }

            case "scripting":
              if (
                value.hasValue(
                  and(
                    String.isString,
                    property("value", equals("none", "enabled", "initial-only"))
                  )
                )
              ) {
                return Result.of(Scripting.of(value));
              } else {
                break;
              }
          }
        }
      } else {
        switch (name) {
          case "width":
            return Result.of(Width.boolean());

          case "height":
            return Result.of(Height.boolean());

          case "orientation":
            return Result.of(Orientation.boolean());

          case "scripting":
            return Result.of(Scripting.boolean());
        }
      }

      return Err.of(`Invalid media feature ${name}`);
    }

    /**
     * @see https://drafts.csswg.org/mediaqueries/#width
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

    /**
     * @see https://drafts.csswg.org/mediaqueries/#height
     */
    class Height extends Feature<Length> {
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

    /**
     * @see https://drafts.csswg.org/mediaqueries/#orientation
     */
    class Orientation extends Feature<String> {
      public static of(value: Value<String>): Orientation {
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
          value.matches(String.of(device.viewport.orientation))
        );
      }
    }

    /**
     * @see https://drafts.csswg.org/mediaqueries-5/#scripting
     */
    class Scripting extends Feature<String> {
      public static of(value: Value<String>): Scripting {
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
          ? this._value.every((value) => value.matches(String.of("enabled")))
          : this._value.some((value) => value.matches(String.of("none")));
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
   * @see https://drafts.csswg.org/mediaqueries/#typedef-mf-name
   */
  const parseFeatureName = map(Token.parseIdent(), (ident) =>
    ident.value.toLowerCase()
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-mf-value
   */
  const parseFeatureValue = either(
    either(
      map(Token.parseNumber(), (number) => Number.of(number.value)),
      map(Token.parseIdent(), (ident) => String.of(ident.value.toLowerCase()))
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
   * @see https://drafts.csswg.org/mediaqueries/#typedef-mf-plain
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
          name,
          range(Value.bound(value, /* isInclusive */ true))
        );
      } else {
        return Feature.tryFrom(name, Value.discrete(value));
      }
    }
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-mf-boolean
   */
  const parseFeatureBoolean = mapResult(parseFeatureName, Feature.tryFrom);

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-mf-lt
   */
  const parseFeatureLessThan = map(
    right(Token.parseDelim("<"), option(Token.parseDelim("="))),
    (equal) =>
      equal.isNone() ? Comparison.LessThan : Comparison.LessThanOrEqual
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-mf-gt
   */
  const parseFeatureGreaterThan = map(
    right(Token.parseDelim(">"), option(Token.parseDelim("="))),
    (equal) =>
      equal.isNone() ? Comparison.GreaterThan : Comparison.GreaterThanOrEqual
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-mf-eq
   */
  const parseFeatureEqual = map(Token.parseDelim("="), () => Comparison.Equal);

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-mf-comparison
   */
  const parseFeatureComparison = either(
    parseFeatureEqual,
    parseFeatureLessThan,
    parseFeatureGreaterThan
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-mf-range
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
        Feature.tryFrom(name, Value.range(minimum, maximum))
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
        Feature.tryFrom(name, Value.range(minimum, maximum))
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
              name,
              Value.range(
                Value.bound(value, /* isInclude */ true),
                Value.bound(value, /* isInclude */ true)
              )
            );

          case Comparison.LessThan:
          case Comparison.LessThanOrEqual:
            return Feature.tryFrom(
              name,
              Value.maximumRange(
                Value.bound(
                  value,
                  /* isInclusive */ comparison === Comparison.LessThanOrEqual
                )
              )
            );

          case Comparison.GreaterThan:
          case Comparison.GreaterThanOrEqual:
            return Feature.tryFrom(
              name,
              Value.minimumRange(
                Value.bound(
                  value,
                  /* isInclusive */ comparison === Comparison.GreaterThanOrEqual
                )
              )
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
              name,
              Value.range(
                Value.bound(value, /* isInclude */ true),
                Value.bound(value, /* isInclude */ true)
              )
            );

          case Comparison.LessThan:
          case Comparison.LessThanOrEqual:
            return Feature.tryFrom(
              name,
              Value.minimumRange(
                Value.bound(
                  value,
                  /* isInclusive */ comparison === Comparison.LessThanOrEqual
                )
              )
            );

          case Comparison.GreaterThan:
          case Comparison.GreaterThanOrEqual:
            return Feature.tryFrom(
              name,
              Value.maximumRange(
                Value.bound(
                  value,
                  /* isInclusive */ comparison === Comparison.GreaterThanOrEqual
                )
              )
            );
        }
      }
    )
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-media-feature
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
      implements Value<T>, Serializable<Discrete.JSON<T>> {
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
      implements Value<T>, Serializable<Range.JSON<T>> {
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

      public matches(value: T): boolean {
        if (!Comparable.isComparable<T>(value)) {
          return false;
        }

        for (const minimum of this._minimum) {
          if (minimum.isInclusive) {
            if (value.compare(minimum.value) <= 0) {
              return false;
            }
          } else {
            if (value.compare(minimum.value) < 0) {
              return false;
            }
          }
        }

        for (const maximum of this._maximum) {
          if (maximum.isInclusive) {
            if (value.compare(maximum.value) >= 0) {
              return false;
            }
          } else {
            if (value.compare(maximum.value) > 0) {
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
      implements Functor<T>, Serializable<Bound.JSON<T>> {
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

  /**
   * @see https://drafts.csswg.org/mediaqueries/#media-condition
   */
  export class Condition
    implements Queryable, Equatable, Serializable<Condition.JSON> {
    public static of(
      combinator: Combinator,
      left: Feature | Condition | Negation,
      right: Feature | Condition | Negation
    ): Condition {
      return new Condition(combinator, left, right);
    }

    private readonly _combinator: Combinator;
    private readonly _left: Feature | Condition | Negation;
    private readonly _right: Feature | Condition | Negation;

    private constructor(
      operator: Combinator,
      left: Feature | Condition | Negation,
      right: Feature | Condition | Negation
    ) {
      this._combinator = operator;
      this._left = left;
      this._right = right;
    }

    public get combinator(): Combinator {
      return this._combinator;
    }

    public get left(): Feature | Condition | Negation {
      return this._left;
    }

    public get right(): Feature | Condition | Negation {
      return this._right;
    }

    public matches(device: Device): boolean {
      switch (this._combinator) {
        case Combinator.And:
          return this._left.matches(device) && this._right.matches(device);

        case Combinator.Or:
          return this._left.matches(device) || this._right.matches(device);
      }
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof Condition &&
        value._combinator === this._combinator &&
        value._left.equals(this._left) &&
        value._right.equals(this._right)
      );
    }

    public toJSON(): Condition.JSON {
      return {
        type: "condition",
        combinator: this._combinator,
        left: this._left.toJSON(),
        right: this._right.toJSON(),
      };
    }

    public toString(): string {
      return `(${this._left}) ${this._combinator} (${this._right})`;
    }
  }

  export namespace Condition {
    export interface JSON {
      [key: string]: json.JSON;
      type: "condition";
      combinator: string;
      left: Feature.JSON | Condition.JSON | Negation.JSON;
      right: Feature.JSON | Condition.JSON | Negation.JSON;
    }

    export function isCondition(value: unknown): value is Condition {
      return value instanceof Condition;
    }
  }

  export const { of: condition, isCondition } = Condition;

  export class Negation implements Queryable {
    public static of(condition: Feature | Condition | Negation): Negation {
      return new Negation(condition);
    }

    private readonly _condition: Feature | Condition | Negation;

    private constructor(condition: Feature | Condition | Negation) {
      this._condition = condition;
    }

    public get condition(): Feature | Condition | Negation {
      return this._condition;
    }

    public matches(device: Device): boolean {
      return !this._condition.matches(device);
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof Negation && value._condition.equals(this._condition)
      );
    }

    public toJSON(): Negation.JSON {
      return {
        type: "negation",
        condition: this._condition.toJSON(),
      };
    }

    public toString(): string {
      return `not (${this._condition})`;
    }
  }

  export namespace Negation {
    export interface JSON {
      [key: string]: json.JSON;
      type: "negation";
      condition: Feature.JSON | Condition.JSON | Negation.JSON;
    }

    export function isNegation(value: unknown): value is Negation {
      return value instanceof Negation;
    }
  }

  export const { of: negation, isNegation } = Negation;

  /**
   * @remarks
   * The condition parser is forward-declared as it is needed within its
   * subparsers.
   */
  let parseCondition: Parser<
    Slice<Token>,
    Feature | Condition | Negation,
    string
  >;

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-media-in-parens
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
   * @see https://drafts.csswg.org/mediaqueries/#typedef-media-not
   */
  const parseNot = map(
    right(
      delimited(option(Token.parseWhitespace), Token.parseIdent("not")),
      parseInParens
    ),
    (condition) => Negation.of(condition)
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-media-and
   */
  const parseAnd = right(
    delimited(option(Token.parseWhitespace), Token.parseIdent("and")),
    parseInParens
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-media-or
   */
  const parseOr = right(
    delimited(option(Token.parseWhitespace), Token.parseIdent("or")),
    parseInParens
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-media-condition
   */
  parseCondition = either(
    parseNot,
    either(
      map(
        pair(
          parseInParens,
          either(
            map(
              oneOrMore(parseAnd),
              (queries) => [Combinator.And, queries] as const
            ),
            map(
              oneOrMore(parseOr),
              (queries) => [Combinator.Or, queries] as const
            )
          )
        ),
        ([left, [combinator, right]]) =>
          Iterable.reduce(
            right,
            (left, right) => Condition.of(combinator, left, right),
            left
          )
      ),
      parseInParens
    )
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-media-condition-without-or
   */
  const parseConditionWithoutOr = either(
    parseNot,
    map(pair(parseInParens, zeroOrMore(parseAnd)), ([left, right]) =>
      [left, ...right].reduce((left, right) =>
        Condition.of(Combinator.And, left, right)
      )
    )
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#media-query
   */
  export class Query implements Queryable {
    public static of(
      modifier: Option<Modifier>,
      type: Option<Type>,
      condition: Option<Feature | Condition | Negation>
    ): Query {
      return new Query(modifier, type, condition);
    }

    private readonly _modifier: Option<Modifier>;
    private readonly _type: Option<Type>;
    private readonly _condition: Option<Feature | Condition | Negation>;

    private constructor(
      modifier: Option<Modifier>,
      type: Option<Type>,
      condition: Option<Feature | Condition | Negation>
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

    public get condition(): Option<Feature | Condition | Negation> {
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
      condition: Feature.JSON | Condition.JSON | Negation.JSON | null;
    }

    export function isQuery(value: unknown): value is Query {
      return value instanceof Query;
    }
  }

  export const { of: query, isQuery } = Query;

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-media-query
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
    end((token) => `Unexpected token ${token}`)
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#media-query-list
   */
  export class List
    implements Queryable, Iterable<Query>, Equatable, Serializable<List.JSON> {
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
   * @see https://drafts.csswg.org/mediaqueries/#typedef-media-query-list
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
      delimited(option(Token.parseWhitespace), Token.parseComma)
    ),
    (queries) =>
      List.of(
        Iterable.map(queries, (tokens) =>
          parseQuery(Slice.from(tokens))
            .map(([, query]) => query)
            .getOr(notAll)
        )
      )
  );

  export const parse = parseList;
}
