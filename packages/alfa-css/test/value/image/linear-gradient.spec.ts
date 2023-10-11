import { test } from "@siteimprove/alfa-test";

import { Gradient, Lexer } from "../../../src";

function parse(input: string) {
  return Gradient.Linear.parse(Lexer.lex(input)).getUnsafe()[1].toJSON();
}
