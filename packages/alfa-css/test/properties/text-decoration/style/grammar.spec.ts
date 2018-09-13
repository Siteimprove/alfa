import { lex, parse } from "@siteimprove/alfa-lang";
import { Assertions, test } from "@siteimprove/alfa-test";
import { Alphabet } from "../../../../src/alphabet";
import { TextDecorationStyleGrammar } from "../../../../src/properties/text-decoration/style/grammar";
import { TextDecorationStyle } from "../../../../src/properties/text-decoration/types";
import { Values } from "../../../../src/values";

const { keyword } = Values;

function textDecorationStyle(
  t: Assertions,
  input: string,
  expected: TextDecorationStyle
) {
  const lexer = lex(input, Alphabet);
  const parser = parse(lexer.result, TextDecorationStyleGrammar);

  t.deepEqual(parser.result, expected, input);
}

test("Can parse a none text-decoration-style", t => {
  textDecorationStyle(t, "none", keyword("none"));
});
