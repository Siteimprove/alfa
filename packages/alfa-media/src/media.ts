import { Token } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Option, None } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Slice } from "@siteimprove/alfa-slice";

import * as json from "@siteimprove/alfa-json";

import { Feature } from "./feature/feature";
import { Type } from "./type";

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
      Serializable<T> {
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

  export const { of: type, isType } = Type;

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
    Feature.parse
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
      mediaType: Option<Type>,
      condition: Option<Feature | Condition | Negation>
    ): Query {
      return new Query(modifier, mediaType, condition);
    }

    private readonly _modifier: Option<Modifier>;
    private readonly _mediaType: Option<Type>;
    private readonly _condition: Option<Feature | Condition | Negation>;

    private constructor(
      modifier: Option<Modifier>,
      mediaType: Option<Type>,
      condition: Option<Feature | Condition | Negation>
    ) {
      this._modifier = modifier;
      this._mediaType = mediaType;
      this._condition = condition;
    }

    public get modifier(): Option<Modifier> {
      return this._modifier;
    }

    public get mediaType(): Option<Type> {
      return this._mediaType;
    }

    public get condition(): Option<Feature | Condition | Negation> {
      return this._condition;
    }

    public matches(device: Device): boolean {
      const negated = this._modifier.some(
        (modifier) => modifier === Modifier.Not
      );
      const type = this._mediaType.every((type) => type.matches(device));
      const condition = this.condition.every((condition) =>
        condition.matches(device)
      );

      return negated !== (type && condition);
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof Query &&
        value._modifier.equals(this._modifier) &&
        value._mediaType.equals(this._mediaType) &&
        value._condition.equals(this._condition)
      );
    }

    public toJSON(): Query.JSON {
      return {
        modifier: this._modifier.getOr(null),
        mediaType: this._mediaType.map((type) => type.toJSON()).getOr(null),
        condition: this._condition
          .map((condition) => condition.toJSON())
          .getOr(null),
        type: "query",
      };
    }

    public toString(): string {
      const modifier = this._modifier.getOr("");

      const type = this._mediaType
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
      mediaType: Type.JSON | null;
      condition: Feature.JSON | Condition.JSON | Negation.JSON | null;
      type: "query";
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
          Type.parse
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
