import { Lexer, type Parser as CSSParser } from "@siteimprove/alfa-css";
import type { Serializable } from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";
import type { Result } from "@siteimprove/alfa-result";

import { Selector } from "../dist/index.js";

const { final } = Parser;

/** @internal */
export function parseErr<T>(
  input: string,
  parser: CSSParser<T>,
): Result<T, string>;

/** @internal */
export function parseErr(input: string): Result<Selector, string>;

/** @internal */
export function parseErr(
  input: string,
  parser: CSSParser<Selector> = Selector.parse,
): Result<Selector, string> {
  return final(
    parser,
    (token) => `Expected end of input, got ${token}`,
  )(Lexer.lex(input)).map(([, selector]) => selector);
}

/** @internal */
export function parse<T>(input: string, parser: CSSParser<T>): T;

/** @internal */
export function parse(input: string): Selector;

/** @internal */
export function parse(
  input: string,
  parser: CSSParser<Selector> = Selector.parse,
): Selector {
  const parsed = final(
    parser,
    (token) => `Expected end of input, got ${token}`,
  )(Lexer.lex(input));

  return parsed.getUnsafe(parsed.err().toString())[1];
}

/** @internal */
export function serialize<T extends Selector>(
  input: string,
  parser: CSSParser<T>,
): Serializable.ToJSON<T>;

/** @internal */
export function serialize(input: string): Selector.JSON;

/** @internal */
export function serialize(
  input: string,
  parser: CSSParser<Selector> = Selector.parse,
): Selector.JSON {
  return parse(input, parser).toJSON();
}
