import { lex, parse } from "@siteimprove/alfa-lang";
import { Assertions, test } from "@siteimprove/alfa-test";
import { Alphabet } from "../../../../src/alphabet";
import { TextDecorationLineGrammar } from "../../../../src/properties/text-decoration/line/grammar";
import { TextDecorationLine } from "../../../../src/properties/text-decoration/types";

function textDecorationLine(
  t: Assertions,
  input: string,
  expected: TextDecorationLine
) {
  const lexer = lex(input, Alphabet);
  const parser = parse(lexer.result, TextDecorationLineGrammar);

  t.deepEqual(parser.result, expected, input);
}

test("Can parse a none text-decoration-line", t => {
  textDecorationLine(t, "none", "none");
});
