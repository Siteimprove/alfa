import { Serializable } from "@siteimprove/alfa-json";
import { Result } from "@siteimprove/alfa-result";

import { Lexer, Parser as CSSParser, Value } from "../../src";

/**
 * @internal
 */
export function parser<T extends Value>(
  parse: CSSParser<T>,
): (input: string) => Result<T, string> {
  return (input) => parse(Lexer.lex(input)).map(([, value]) => value);
}

/**
 * @internal
 */
export function parserUnsafe<T extends Value>(
  parse: CSSParser<T>,
): (input: string) => T {
  return (input) => parser(parse)(input).getUnsafe();
}

/**
 * @internal
 */
export function serializer<T extends Value>(
  parse: CSSParser<T>,
): (input: string) => Serializable.ToJSON<T> {
  return (input) =>
    parserUnsafe(parse)(input).toJSON() as Serializable.ToJSON<T>;
}
