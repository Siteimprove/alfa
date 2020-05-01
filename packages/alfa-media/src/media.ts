import {
  Angle,
  Length,
  Lexer,
  Number,
  Percentage,
  String,
  Token,
} from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { None, Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok, Result } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import * as json from "@siteimprove/alfa-json";

const {
  map,
  either,
  option,
  pair,
  left,
  right,
  delimited,
  zeroOrMore,
  separatedList,
} = Parser;
const { equals } = Predicate;

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

  export enum Comparator {
    GreaterThan = ">",
    GreaterThanEqual = ">=",
    LessThan = "<",
    LessThanEqual = "<=",
  }

  /**
   * @see https://drafts.csswg.org/mediaqueries/#media-type
   */
  export class Type implements Equatable, Serializable {
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
  export class Feature implements Equatable, Serializable {
    public static of(
      name: string,
      value: Option<Feature.Value> = None
    ): Feature {
      return new Feature(name, value);
    }

    private readonly _name: string;
    private readonly _value: Option<Feature.Value>;

    private constructor(name: string, value: Option<Feature.Value>) {
      this._name = name;
      this._value = value;
    }

    public get name(): string {
      return this._name;
    }

    public get value(): Option<Feature.Value> {
      return this._value;
    }

    public matches(device: Device): boolean {
      switch (this._name) {
        case "orientation":
          return this._value.some(
            (value) =>
              value.type === "string" &&
              value.value === device.viewport.orientation
          );
      }

      return false;
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof Feature &&
        value._name === this._name &&
        value._value.equals(this._value)
      );
    }

    public toJSON(): Feature.JSON {
      return {
        type: "feature",
        name: this._name,
        value: this._value.map((value) => value.toJSON()).getOr(null),
      };
    }

    public toString(): string {
      return `${this._name}${this._value
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

    export type Value = Number | String | Length | Angle | Percentage;

    export namespace Value {
      export type JSON =
        | Number.JSON
        | String.JSON
        | Length.JSON
        | Angle.JSON
        | Percentage.JSON;
    }
  }

  export function isFeature(value: unknown): value is Feature {
    return value instanceof Feature;
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
    map(Token.parseNumber(), (number) => Number.of(number.value)),
    either(
      map(Token.parseIdent(), (ident) => String.of(ident.value.toLowerCase())),
      map(
        pair(
          Token.parseNumber((number) => number.isInteger),
          right(
            delimited(option(Token.parseWhitespace), Token.parseDelim("/")),
            Token.parseNumber((number) => number.isInteger)
          )
        ),
        (result) => {
          const [left, right] = result;

          return Percentage.of(left.value / right.value);
        }
      )
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
    (result) => {
      const [name, value] = result;

      return Feature.of(name, Option.of(value));
    }
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-mf-boolean
   */
  const parseFeatureBoolean = map(parseFeatureName, (name) => Feature.of(name));

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
  export class Condition implements Equatable, Serializable {
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

  export class Negation implements Equatable, Serializable {
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

  // Hoist the condition parser to break the recursive initialisation between
  // its different subparsers.
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
    right(left(Token.parseIdent("not"), Token.parseWhitespace), parseInParens),
    (condition) => Negation.of(condition)
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-media-and
   */
  const parseAnd = right(
    left(Token.parseIdent("and"), Token.parseWhitespace),
    parseInParens
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-media-or
   */
  const parseOr = right(Token.parseIdent("or"), parseInParens);

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-media-condition
   */
  parseCondition = either(
    parseNot,
    either(
      parseInParens,
      either(
        map(pair(parseInParens, zeroOrMore(parseAnd)), (result) => {
          const [left, right] = result;
          return [left, ...right].reduce((left, right) =>
            Condition.of(Combinator.And, left, right)
          );
        }),
        map(pair(parseInParens, zeroOrMore(parseOr)), (result) => {
          const [left, right] = result;
          return [left, ...right].reduce((left, right) =>
            Condition.of(Combinator.Or, left, right)
          );
        })
      )
    )
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-media-condition-without-or
   */
  const parseConditionWithoutOr = either(
    parseNot,
    map(pair(parseInParens, zeroOrMore(parseAnd)), (result) => {
      const [left, right] = result;
      return [left, ...right].reduce((left, right) =>
        Condition.of(Combinator.And, left, right)
      );
    })
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#media-query
   */
  export class Query implements Equatable, Serializable {
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
      const negated = this._modifier.some(equals(Modifier.Not));

      return (
        !this._type.some((type) => !type.matches(device) || negated) &&
        !this._condition.some(
          (condition) => !condition.matches(device) || negated
        ) &&
        !negated
      );
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
        pair(option(parseModifier), parseType),
        option(
          right(
            delimited(Token.parseWhitespace, Token.parseIdent("and")),
            parseConditionWithoutOr
          )
        )
      ),
      (result) => {
        const [[modifier, type], condition] = result;
        return Query.of(modifier, Option.of(type), condition);
      }
    )
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#media-query-list
   */
  export class List implements Iterable<Query>, Equatable, Serializable {
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

  const parseList = map(
    separatedList(
      parseQuery,
      delimited(option(Token.parseWhitespace), Token.parseComma)
    ),
    (queries) => List.of(queries)
  );

  export function parse(input: string) {
    return parseList(Slice.of(Lexer.lex(input)))
      .flatMap(([tokens, selector]) => {
        const result: Result<typeof selector, string> =
          tokens.length === 0 ? Ok.of(selector) : Err.of("Unexpected token");

        return result;
      })
      .ok();
  }
}
