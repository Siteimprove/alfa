import { type Parser as CSSParser, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

const { delimited, either, map, option } = Parser;

/**
 * {@link https://drafts.csswg.org/selectors/#selector-combinator}
 */
export enum Combinator {
  /**
   * @example div span
   */
  Descendant = " ",

  /**
   * @example div \> span
   */
  DirectDescendant = ">",

  /**
   * @example div ~ span
   */
  Sibling = "~",

  /**
   * @example div + span
   */
  DirectSibling = "+",
}

export namespace Combinator {
  /**
   * {@link https://drafts.csswg.org/selectors/#typedef-combinator}
   *
   * @internal
   */
  export const parseCombinator: CSSParser<Combinator> = either(
    delimited(
      option(Token.parseWhitespace),
      either(
        map(Token.parseDelim(">"), () => Combinator.DirectDescendant),
        map(Token.parseDelim("~"), () => Combinator.Sibling),
        map(Token.parseDelim("+"), () => Combinator.DirectSibling),
      ),
    ),
    map(Token.parseWhitespace, () => Combinator.Descendant),
  );
}
