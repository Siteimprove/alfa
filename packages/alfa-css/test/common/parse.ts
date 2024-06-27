import type { Serializable } from "@siteimprove/alfa-json";
import type { Parser } from "@siteimprove/alfa-parser";
import type { Result } from "@siteimprove/alfa-result";
import type { Slice } from "@siteimprove/alfa-slice";

import { Lexer, type Token } from "../../dist/index.js";

/**
 * @internal
 */
export function parser<T>(
  parse: Parser<Slice<Token>, T, string>,
): (input: string) => Result<T, string> {
  return (input) => parse(Lexer.lex(input)).map(([, value]) => value);
}

/**
 * @internal
 */
export function parserUnsafe<T>(
  parse: Parser<Slice<Token>, T, string>,
): (input: string) => T {
  return (input) => parser(parse)(input).getUnsafe();
}

/**
 * @internal
 */
export function serializer<T extends Serializable>(
  parse: Parser<Slice<Token>, T, string>,
): (input: string) => Serializable.ToJSON<T> {
  return (input) =>
    parserUnsafe(parse)(input).toJSON() as Serializable.ToJSON<T>;
}
