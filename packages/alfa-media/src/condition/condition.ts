import { Token } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Iterable } from "@siteimprove/alfa-iterable";
import * as json from "@siteimprove/alfa-json";
import { Serializable } from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";
import { Feature, parseMediaFeature } from "../feature";
import type { Matchable } from "../matchable";

const { delimited, either, map, oneOrMore, option, pair, right, zeroOrMore } =
  Parser;

export class And
  implements Matchable, Iterable<Feature>, Equatable, Serializable<And.JSON>
{
  public static of(left: Feature | Condition, right: Feature | Condition): And {
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

export class Or
  implements Matchable, Iterable<Feature>, Equatable, Serializable<Or.JSON>
{
  public static of(left: Feature | Condition, right: Feature | Condition): Or {
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

/**
 * {@link https://drafts.csswg.org/mediaqueries-5/#media-conditions}
 */
export type Condition = And | Or | Not;

export namespace Condition {
  export type JSON = And.JSON | Or.JSON | Not.JSON;

  export function isCondition(value: unknown): value is Condition {
    return And.isAnd(value) || Or.isOr(value) || Not.isNot(value);
  }
}

/**
 * @remarks
 * The condition parser is forward-declared as it is needed within its
 * subparsers.
 */
export let parseCondition: Parser<Slice<Token>, Feature | Condition, string>;

/**
 * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-media-in-parens}
 */
const parseInParens = either(
  delimited(
    Token.parseOpenParenthesis,
    delimited(option(Token.parseWhitespace), (input) => parseCondition(input)),
    Token.parseCloseParenthesis,
  ),
  parseMediaFeature,
);

/**
 * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-media-not}
 */
const parseNot = map(
  right(
    delimited(option(Token.parseWhitespace), Token.parseIdent("not")),
    parseInParens,
  ),
  Not.of,
);

/**
 * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-media-and}
 */
const parseAnd = right(
  delimited(option(Token.parseWhitespace), Token.parseIdent("and")),
  parseInParens,
);

/**
 * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-media-or}
 */
const parseOr = right(
  delimited(option(Token.parseWhitespace), Token.parseIdent("or")),
  parseInParens,
);

/**
 * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-media-condition}
 */
parseCondition = either(
  parseNot,
  either(
    map(
      pair(
        parseInParens,
        either(
          map(oneOrMore(parseAnd), (queries) => [And.of, queries] as const),
          map(oneOrMore(parseOr), (queries) => [Or.of, queries] as const),
        ),
      ),
      ([left, [constructor, right]]) =>
        Iterable.reduce(right, (left, right) => constructor(left, right), left),
    ),
    parseInParens,
  ),
);

/**
 * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-media-condition-without-or}
 */
export const parseConditionWithoutOr = either(
  parseNot,
  map(pair(parseInParens, zeroOrMore(parseAnd)), ([left, right]) =>
    [left, ...right].reduce((left, right) => And.of(left, right)),
  ),
);
