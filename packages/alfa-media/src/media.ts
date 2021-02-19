import { Comparable } from "@siteimprove/alfa-comparable";
import {
  Length,
  Number,
  Percentage,
  String,
  Token,
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
import { Slice } from "@siteimprove/alfa-slice";

import * as json from "@siteimprove/alfa-json";

import { Resolver } from "./resolver";

const {
  map,
  either,
  option,
  pair,
  left,
  right,
  delimited,
  oneOrMore,
  zeroOrMore,
  separatedList,
  eof,
} = Parser;

export namespace Media {
  export interface Queryable<T extends json.JSON = json.JSON>
    extends Equatable,
      json.Serializable<T> {
    matches: Predicate<Device>;
  }

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

  export enum Comparator {
    GreaterThan = ">",
    GreaterThanEqual = ">=",
    LessThan = "<",
    LessThanEqual = "<=",
  }

  /**
   * @see https://drafts.csswg.org/mediaqueries/#media-type
   */
  export class Type implements Queryable<Type.JSON> {
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
  }

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-media-type
   */
  const parseType = map(Token.parseIdent(), (ident) => Type.of(ident.value));

  /**
   * @see https://drafts.csswg.org/mediaqueries/#media-feature
   */
  export abstract class Feature<T = unknown>
    implements Queryable<Feature.JSON> {
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

    export class Unknown extends Feature {
      public static of(value: Value, name: string): Unknown {
        return new Unknown(Option.of(value), name);
      }

      public static boolean(name: string): Unknown {
        return new Unknown(None, name);
      }

      private readonly _name: string;

      private constructor(value: Option<Value>, name: string) {
        super(value);
        this._name = name;
      }

      public get name(): string {
        return this._name;
      }

      public matches(): boolean {
        return false;
      }
    }

    export const { of: unknown, boolean: booleanUnknown } = Unknown;

    /**
     * @see https://drafts.csswg.org/mediaqueries/#width
     */
    export class Width extends Feature<Length> {
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

    export const { of: width, boolean: booleanWidth } = Width;

    /**
     * @see https://drafts.csswg.org/mediaqueries/#height
     */
    export class Height extends Feature<Length> {
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

    export const { of: height, boolean: booleanHeight } = Height;

    /**
     * @see https://drafts.csswg.org/mediaqueries/#orientation
     */
    export class Orientation extends Feature<String> {
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
          value.matches(String.of(device.viewport.orientation as string))
        );
      }
    }

    export const { of: orientation, boolean: booleanOrientation } = Orientation;

    /**
     * @see https://drafts.csswg.org/mediaqueries-5/#scripting
     */
    export class Scripting extends Feature<String> {
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

    export const { of: scripting, boolean: booleanScripting } = Scripting;
  }

  export function isFeature(value: unknown): value is Feature {
    return value instanceof Feature;
  }

  export interface Value<T = unknown>
    extends Functor<T>,
      Serializable<Value.JSON> {
    map<U>(mapper: Mapper<T, U>): Value<U>;
    matches(value: T): boolean;
    toJSON(): Value.JSON;
  }

  export namespace Value {
    export interface JSON {
      [key: string]: json.JSON;
      type: string;
    }

    export class Discrete<T>
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
    }

    export const { of: discrete } = Discrete;

    export class Range<T> implements Value<T>, Serializable<Range.JSON<T>> {
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
    }

    export const {
      of: range,
      minimum: minimumRange,
      maximum: maximumRange,
    } = Range;

    export class Bound<T> implements Functor<T>, Serializable<Bound.JSON<T>> {
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
        pair(
          Token.parseNumber((number) => number.isInteger),
          right(
            delimited(option(Token.parseWhitespace), Token.parseDelim("/")),
            Token.parseNumber((number) => number.isInteger)
          )
        ),
        ([left, right]) => Percentage.of(left.value / right.value)
      ),
      Length.parse
    )
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-mf-plain
   */
  const parseFeaturePlain = map(
    pair(
      parseFeatureName,
      right(
        delimited(option(Token.parseWhitespace), Token.parseColon),
        parseFeatureValue
      )
    ),
    ([name, value]) => {
      if (name.startsWith("min-") || name.startsWith("max-")) {
        const range = name.startsWith("min-")
          ? Value.minimumRange
          : Value.maximumRange;

        name = name.slice(4);

        switch (name) {
          case "width":
            if (value.type === "length") {
              return Feature.width(range(Value.bound(value, true)));
            } else {
              break;
            }

          case "height":
            if (value.type === "length") {
              return Feature.height(range(Value.bound(value, true)));
            } else {
              break;
            }
        }
      } else {
        switch (name) {
          case "width":
            if (value.type === "length") {
              return Feature.width(Value.discrete(value));
            } else {
              break;
            }

          case "height":
            if (value.type === "length") {
              return Feature.height(Value.discrete(value));
            } else {
              break;
            }

          case "orientation":
            if (value.type === "string") {
              return Feature.orientation(Value.discrete(value));
            } else {
              break;
            }

          case "scripting":
            if (value.type === "string") {
              return Feature.scripting(Value.discrete(value));
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
  const parseFeatureBoolean = map(parseFeatureName, (name) => {
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
   * @see https://drafts.csswg.org/mediaqueries/#typedef-media-feature
   */
  const parseFeature = delimited(
    Token.parseOpenParenthesis,
    delimited(
      option(Token.parseWhitespace),
      either(parseFeaturePlain, parseFeatureBoolean)
    ),
    Token.parseCloseParenthesis
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#media-condition
   */
  export class Condition implements Queryable<Condition.JSON> {
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
  }

  export function isCondition(value: unknown): value is Condition {
    return value instanceof Condition;
  }

  export class Negation implements Queryable<Negation.JSON> {
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
  }

  export function isNegation(value: unknown): value is Negation {
    return value instanceof Negation;
  }

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
  export class Query implements Queryable<Query.JSON> {
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
  }

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-media-query
   */
  const parseQuery = either(
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
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#media-query-list
   */
  export class List implements Iterable<Query>, Queryable<List.JSON> {
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
  }

  const parseList = left(
    map(
      separatedList(
        parseQuery,
        delimited(option(Token.parseWhitespace), Token.parseComma)
      ),
      (queries) => List.of(queries)
    ),
    eof((token) => `Unexpected token ${token}`)
  );

  export const parse = parseList;
}
