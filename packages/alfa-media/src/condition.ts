import { Token } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import * as json from "@siteimprove/alfa-json";

import { Feature } from "./feature";
import { Media } from "./media";

const {
  map,
  either,
  option,
  pair,
  right,
  delimited,
  oneOrMore,
  zeroOrMore,
} = Parser;

/**
 * @see https://drafts.csswg.org/mediaqueries/#media-condition
 */
export namespace Condition {
  export type Condition = Expression | Feature | Negation;

  export type JSON = Expression.JSON | Feature.JSON | Negation.JSON;

  class Expression implements Media.Queryable<Expression.JSON> {
    public static of(
      combinator: Expression.Combinator,
      left: Condition.Condition,
      right: Condition.Condition
    ): Expression {
      return new Expression(combinator, left, right);
    }

    private readonly _combinator: Expression.Combinator;
    private readonly _left: Condition.Condition;
    private readonly _right: Condition.Condition;

    private constructor(
      operator: Expression.Combinator,
      left: Condition.Condition,
      right: Condition.Condition
    ) {
      this._combinator = operator;
      this._left = left;
      this._right = right;
    }

    public get combinator(): Expression.Combinator {
      return this._combinator;
    }

    public get left(): Condition.Condition {
      return this._left;
    }

    public get right(): Condition.Condition {
      return this._right;
    }

    public matches(device: Device): boolean {
      switch (this._combinator) {
        case Expression.Combinator.And:
          return this._left.matches(device) && this._right.matches(device);

        case Expression.Combinator.Or:
          return this._left.matches(device) || this._right.matches(device);
      }
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof Expression &&
        value._combinator === this._combinator &&
        value._left.equals(this._left) &&
        value._right.equals(this._right)
      );
    }

    public toJSON(): Expression.JSON {
      return {
        type: "expression",
        combinator: this._combinator,
        left: this._left.toJSON(),
        right: this._right.toJSON(),
      };
    }

    public toString(): string {
      return `(${this._left}) ${this._combinator} (${this._right})`;
    }
  }

  namespace Expression {
    export interface JSON {
      [key: string]: json.JSON;

      type: "expression";
      combinator: string;
      left: Condition.JSON;
      right: Condition.JSON;
    }

    export enum Combinator {
      And = "and",
      Or = "or",
    }

    export function isExpression(value: unknown): value is Expression {
      return value instanceof Expression;
    }
  }

  export const { of: expression, isExpression } = Expression;

  class Negation implements Media.Queryable<Negation.JSON> {
    public static of(condition: Condition.Condition): Negation {
      return new Negation(condition);
    }

    private readonly _condition: Condition.Condition;

    private constructor(condition: Condition.Condition) {
      this._condition = condition;
    }

    public get condition(): Condition.Condition {
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

  namespace Negation {
    export interface JSON {
      [key: string]: json.JSON;

      type: "negation";
      condition: Condition.JSON;
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
  export let parse: Parser<
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
      delimited(option(Token.parseWhitespace), (input) => parse(input)),
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
  parse = either(
    parseNot,
    either(
      map(
        pair(
          parseInParens,
          either(
            map(
              oneOrMore(parseAnd),
              (queries) => [Expression.Combinator.And, queries] as const
            ),
            map(
              oneOrMore(parseOr),
              (queries) => [Expression.Combinator.Or, queries] as const
            )
          )
        ),
        ([left, [combinator, right]]) =>
          Iterable.reduce(
            right,
            (left, right) => Expression.of(combinator, left, right),
            left
          )
      ),
      parseInParens
    )
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-media-condition-without-or
   */
  export const parseWithoutOr = either(
    parseNot,
    map(pair(parseInParens, zeroOrMore(parseAnd)), ([left, right]) =>
      [left, ...right].reduce((left, right) =>
        Expression.of(Expression.Combinator.And, left, right)
      )
    )
  );
}
