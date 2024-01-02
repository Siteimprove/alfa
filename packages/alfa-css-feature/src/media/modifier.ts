import { type Parser as CSSParser, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

const { either, map } = Parser;

/**
 * {@link https://drafts.csswg.org/mediaqueries-5/#mq-prefix}
 *
 * @public
 */
export enum Modifier {
  Only = "only",
  Not = "not",
}

/**
 * @public
 */
export namespace Modifier {
  export const parse: CSSParser<Modifier> = either(
    map(Token.parseIdent("only"), () => Modifier.Only),
    map(Token.parseIdent("not"), () => Modifier.Not),
  );
}
