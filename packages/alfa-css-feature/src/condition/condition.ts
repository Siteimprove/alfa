import { Parser as CSSParser, Token } from "@siteimprove/alfa-css";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";

import type { Feature } from "../feature";
import { Media } from "../media";

import { And } from "./and";
import { Not } from "./not";
import { Or } from "./or";

const { delimited, either, map, oneOrMore, option, pair, zeroOrMore } = Parser;

/**
 * {@link https://drafts.csswg.org/mediaqueries-5/#media-conditions}
 */
export type Condition<T extends Feature<T>> = T | And<T> | Or<T> | Not<T>;

export namespace Condition {
  export type JSON<T extends Feature<T>> =
    | Serializable.ToJSON<T>
    | And.JSON<T>
    | Or.JSON<T>
    | Not.JSON<T>;

  export function isCondition<T extends Feature<T>>(
    value: unknown,
  ): value is Condition<T> {
    return And.isAnd(value) || Or.isOr(value) || Not.isNot(value);
  }

  /**
   * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-media-in-parens}
   *
   * @privateRemarks
   * This is a Thunk to allow dependency injection and break down circular dependencies.
   */
  const parseInParens = () =>
    either(
      delimited(
        Token.parseOpenParenthesis,
        delimited(option(Token.parseWhitespace), (input) => parse(input)),
        Token.parseCloseParenthesis,
      ),
      Media.parse,
    );

  /**
   * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-media-condition}
   */
  export const parse: CSSParser<Condition<Media>> = either(
    Not.parse(parseInParens),
    either(
      map(
        pair(
          parseInParens(),
          either(
            map(
              oneOrMore(And.parse(parseInParens)),
              (queries) => [And.of, queries] as const,
            ),
            map(
              oneOrMore(Or.parse(parseInParens)),
              (queries) => [Or.of, queries] as const,
            ),
          ),
        ),
        ([left, [constructor, right]]) =>
          Iterable.reduce(
            right,
            (left, right) => constructor(left, right),
            left,
          ),
      ),
      parseInParens(),
    ),
  );

  /**
   * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-media-condition-without-or}
   */
  export const parseWithoutOr = either(
    Not.parse(parseInParens),
    map(
      pair(parseInParens(), zeroOrMore(And.parse(parseInParens))),
      ([left, right]) =>
        [left, ...right].reduce((left, right) => And.of(left, right)),
    ),
  );
}
