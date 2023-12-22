import { type Parser as CSSParser, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

const { either, map, option, right } = Parser;

/**
 * @internal
 */
export enum Comparison {
  LessThan = "<",
  LessThanOrEqual = "<=",
  Equal = "=",
  GreaterThan = ">",
  GreaterThanOrEqual = ">=",
}

/**
 * @internal
 */
export namespace Comparison {
  /**
   * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-mf-lt}
   */
  export const parseLessThan: CSSParser<
    Comparison.LessThan | Comparison.LessThanOrEqual
  > = map(
    right(Token.parseDelim("<"), option(Token.parseDelim("="))),
    (equal) =>
      equal.isNone() ? Comparison.LessThan : Comparison.LessThanOrEqual,
  );

  /**
   * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-mf-gt}
   */
  export const parseGreaterThan = map(
    right(Token.parseDelim(">"), option(Token.parseDelim("="))),
    (equal) =>
      equal.isNone() ? Comparison.GreaterThan : Comparison.GreaterThanOrEqual,
  );

  /**
   * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-mf-eq}
   */
  export const parseEqual = map(Token.parseDelim("="), () => Comparison.Equal);

  /**
   * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-mf-comparison}
   */
  export const parse = either(parseEqual, parseLessThan, parseGreaterThan);
}
