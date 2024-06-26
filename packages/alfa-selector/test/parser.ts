import { Lexer } from "@siteimprove/alfa-css";

import { Selector } from "../dist/index.js";

/**
 * @internal
 */
export function parseErr(input: string) {
  return Selector.parse(Lexer.lex(input)).map(([, selector]) => selector);
}

export function parse(input: string) {
  return Selector.parse(Lexer.lex(input)).getUnsafe()[1];
}

export function serialize(input: string) {
  return parse(input).toJSON();
}
