import * as Lang from "@siteimprove/alfa-lang";
import { Alphabet } from "./alphabet";
import { Grammar } from "./grammar";
import { Expression } from "./types";

export function parse(input: string): Expression | null {
  const lexer = Lang.lex(input, Alphabet);

  if (!lexer.done) {
    return null;
  }

  const parser = Lang.parse(lexer.result, Grammar);

  if (!parser.done) {
    return null;
  }

  return parser.result;
}
