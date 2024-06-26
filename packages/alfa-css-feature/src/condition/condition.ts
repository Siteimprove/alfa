import { type Parser as CSSParser, Token } from "@siteimprove/alfa-css";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";

import type { Feature } from "../feature.js";

import { And } from "./and.js";
import { Not } from "./not.js";
import { Or } from "./or.js";

const { delimited, either, map, oneOrMore, option, pair, zeroOrMore } = Parser;

/**
 * {@link https://drafts.csswg.org/mediaqueries-5/#media-conditions}
 */
export type Condition<F extends Feature<F>> = F | And<F> | Or<F> | Not<F>;

export namespace Condition {
  export type JSON<F extends Feature<F>> =
    | Serializable.ToJSON<F>
    | And.JSON<F>
    | Or.JSON<F>
    | Not.JSON<F>;

  export function isCondition<T extends Feature<T>>(
    value: unknown,
  ): value is Condition<T> {
    return And.isAnd(value) || Or.isOr(value) || Not.isNot(value);
  }

  /**
   * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-media-in-parens}
   */
  function parseInParens<F extends Feature<F>>(
    featureParser: CSSParser<F>,
  ): CSSParser<Condition<F>> {
    return either(
      delimited(
        Token.parseOpenParenthesis,
        delimited(option(Token.parseWhitespace), (input) =>
          parse(featureParser)(input),
        ),
        Token.parseCloseParenthesis,
      ),
      featureParser,
    );
  }

  /**
   * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-media-condition}
   *
   * @privateRemarks
   * We absolutely must defer evaluation of the parseInParens computation as lazily as
   * possible to avoid infinite recursion.
   */
  export function parse<F extends Feature<F>>(
    featureParser: CSSParser<F>,
  ): CSSParser<Condition<F>> {
    return either(
      Not.parse(parseInParens, featureParser),
      map(
        pair(
          parseInParens(featureParser),
          either(
            map(
              oneOrMore(And.parse(parseInParens, featureParser)),
              (queries) => [And.of, queries] as const,
            ),
            map(
              oneOrMore(Or.parse(parseInParens, featureParser)),
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
      parseInParens(featureParser),
    );
  }

  /**
   * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-media-condition-without-or}
   */
  export function parseWithoutOr<F extends Feature<F>>(
    featureParser: CSSParser<F>,
  ): CSSParser<Condition<F>> {
    return either(
      Not.parse(parseInParens, featureParser),
      map(
        pair(
          parseInParens(featureParser),
          zeroOrMore(And.parse(parseInParens, featureParser)),
        ),
        ([left, right]) =>
          [left, ...right].reduce((left, right) => And.of(left, right)),
      ),
    );
  }
}
