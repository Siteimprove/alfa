import { Lexer, type Parser as CSSParser } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Selector } from "../dist/index.js";

const { final } = Parser;

/** @internal */
export function parseErr(
  input: string,
  parser: CSSParser<Selector> = Selector.parse,
) {
  return final(
    parser,
    (token) => `Expected end of input, got ${token}`,
  )(Lexer.lex(input)).map(([, selector]) => selector);
}

/** @internal */
export function parse(
  input: string,
  parser: CSSParser<Selector> = Selector.parse,
) {
  const parsed = final(
    parser,
    (token) => `Expected end of input, got ${token}`,
  )(Lexer.lex(input));
  return parsed.getUnsafe(parsed.err().toString())[1];
}

/** @internal */
export function serialize(
  input: string,
  parser: CSSParser<Selector> = Selector.parse,
) {
  return parse(input, parser).toJSON();
}
