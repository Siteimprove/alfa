import { Lexer } from "@siteimprove/alfa-css";
import { Selector } from "@siteimprove/alfa-selector";

/**
 * @internal
 */
export function parse(input: string) {
  return Selector.parse(Lexer.lex(input)).getUnsafe()[1];
}
