import { Token, Component } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Option, None } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import * as json from "@siteimprove/alfa-json";

import { Feature, parseMediaFeature } from "./feature";
import type { Matchable } from "./matchable";
import { Modifier } from "./modifier";
import { Type } from "./type";

const {
  delimited,
  either,
  end,
  left,
  map,
  oneOrMore,
  option,
  pair,
  right,
  separatedList,
  takeUntil,
  zeroOrMore,
} = Parser;

/**
 * @public
 */
export namespace Media {
  export const { of: type, isType } = Type;

  export const { isFeature } = Feature;

  export class And
    implements Matchable, Iterable<Feature>, Equatable, Serializable<And.JSON>
  {
    public static of(
      left: Feature | Condition,
      right: Feature | Condition,
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
      right: Feature | Condition,
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
        parseCondition(input),
      ),
      Token.parseCloseParenthesis,
    ),
    parseMediaFeature,
  );

  /**
   * {@link https://drafts.csswg.org/mediaqueries/#typedef-media-not}
   */
  const parseNot = map(
    right(
      delimited(option(Token.parseWhitespace), Token.parseIdent("not")),
      parseInParens,
    ),
    not,
  );

  /**
   * {@link https://drafts.csswg.org/mediaqueries/#typedef-media-and}
   */
  const parseAnd = right(
    delimited(option(Token.parseWhitespace), Token.parseIdent("and")),
    parseInParens,
  );

  /**
   * {@link https://drafts.csswg.org/mediaqueries/#typedef-media-or}
   */
  const parseOr = right(
    delimited(option(Token.parseWhitespace), Token.parseIdent("or")),
    parseInParens,
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
            map(oneOrMore(parseOr), (queries) => [or, queries] as const),
          ),
        ),
        ([left, [constructor, right]]) =>
          Iterable.reduce(
            right,
            (left, right) => constructor(left, right),
            left,
          ),
      ),
      parseInParens,
    ),
  );

  /**
   * {@link https://drafts.csswg.org/mediaqueries/#typedef-media-condition-without-or}
   */
  const parseConditionWithoutOr = either(
    parseNot,
    map(pair(parseInParens, zeroOrMore(parseAnd)), ([left, right]) =>
      [left, ...right].reduce((left, right) => and(left, right)),
    ),
  );

  /**
   * {@link https://drafts.csswg.org/mediaqueries/#media-query}
   */
  export class Query implements Matchable {
    public static of(
      modifier: Option<Modifier>,
      type: Option<Type>,
      condition: Option<Feature | Condition>,
    ): Query {
      return new Query(modifier, type, condition);
    }

    private readonly _modifier: Option<Modifier>;
    private readonly _type: Option<Type>;
    private readonly _condition: Option<Feature | Condition>;

    private constructor(
      modifier: Option<Modifier>,
      type: Option<Type>,
      condition: Option<Feature | Condition>,
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
        (modifier) => modifier === Modifier.Not,
      );

      const type = this._type.every((type) => type.matches(device));

      const condition = this.condition.every((condition) =>
        condition.matches(device),
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
          type === "" ? `${condition}` : `${type} and ${condition}`,
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
        Query.of(None, None, Option.of(condition)),
      ),
      map(
        pair(
          pair(
            option(delimited(option(Token.parseWhitespace), Modifier.parse)),
            Type.parse,
          ),
          option(
            right(
              delimited(option(Token.parseWhitespace), Token.parseIdent("and")),
              parseConditionWithoutOr,
            ),
          ),
        ),
        ([[modifier, type], condition]) =>
          Query.of(modifier, Option.of(type), condition),
      ),
    ),
    end(() => `Unexpected token`),
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
    None,
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
            end(() => `Unexpected token`),
          ),
        ),
        (components) => Iterable.flatten(components),
      ),
      Token.parseComma,
    ),
    (queries) =>
      List.of(
        Iterable.map(queries, (tokens) =>
          parseQuery(Slice.from(tokens).trim(Token.isWhitespace))
            .map(([, query]) => query)
            .getOr(notAll),
        ),
      ),
  );

  export const parse = parseList;
}
