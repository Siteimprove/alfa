import { Token } from "@siteimprove/alfa-css";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Feature } from "../feature/";

import { Expression } from "./expression";
import { Negation } from "./negation";

const {
  delimited,
  either,
  left,
  map,
  oneOrMore,
  option,
  pair,
  right,
  zeroOrMore,
} = Parser;

/**
 * @see https://drafts.csswg.org/mediaqueries/#media-condition
 */
export type Condition = Expression | Feature | Negation;

export namespace Condition {
  export type JSON = Expression.JSON | Feature.JSON | Negation.JSON;

  export const { isExpression } = Expression;

  export const { isFeature } = Feature;

  export const { isNegation } = Negation;

  // Hoist the condition parser to break the recursive initialisation between
  // its different subparsers.
  export let parse: Parser<Slice<Token>, Condition, string>;

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
    right(left(Token.parseIdent("not"), Token.parseWhitespace), parseInParens),
    (condition) => Negation.of(condition)
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-media-and
   */
  const parseAnd = right(
    left(
      right(option(Token.parseWhitespace), Token.parseIdent("and")),
      Token.parseWhitespace
    ),
    parseInParens
  );

  /**
   * @see https://drafts.csswg.org/mediaqueries/#typedef-media-or
   */
  const parseOr = right(
    left(
      right(option(Token.parseWhitespace), Token.parseIdent("or")),
      Token.parseWhitespace
    ),
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
              (queries) => ["and", queries] as ["and", Iterable<Condition>]
            ),
            map(
              oneOrMore(parseOr),
              (queries) => ["or", queries] as ["or", Iterable<Condition>]
            )
          )
        ),
        ([left, [combinator, right]]) =>
          Iterable.reduce(
            right,
            (left, right) =>
              Expression.of(
                combinator === "and"
                  ? Expression.Combinator.And
                  : Expression.Combinator.Or,
                left,
                right
              ),
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
