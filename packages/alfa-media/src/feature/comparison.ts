import { type Parser as CSSParser, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

const { delimited, either, map, option, right } = Parser;

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
  export function isInclusive(comparison: Comparison): boolean {
    return (
      comparison === Comparison.LessThanOrEqual ||
      comparison === Comparison.GreaterThanOrEqual ||
      comparison === Comparison.Equal
    );
  }

  /**
   * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-mf-lt}
   */
  export const parseLessThan: CSSParser<
    Comparison.LessThan | Comparison.LessThanOrEqual
  > = map(
    delimited(
      option(Token.parseWhitespace),
      right(Token.parseDelim("<"), option(Token.parseDelim("="))),
    ),
    (equal) =>
      equal.isNone() ? Comparison.LessThan : Comparison.LessThanOrEqual,
  );

  /**
   * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-mf-gt}
   */
  export const parseGreaterThan = map(
    delimited(
      option(Token.parseWhitespace),
      right(Token.parseDelim(">"), option(Token.parseDelim("="))),
    ),
    (equal) =>
      equal.isNone() ? Comparison.GreaterThan : Comparison.GreaterThanOrEqual,
  );

  /**
   * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-mf-eq}
   */
  export const parseEqual = map(
    delimited(option(Token.parseWhitespace), Token.parseDelim("=")),
    () => Comparison.Equal,
  );

  /**
   * {@link https://drafts.csswg.org/mediaqueries-5/#typedef-mf-comparison}
   */
  export const parse = either(parseEqual, parseLessThan, parseGreaterThan);
}
