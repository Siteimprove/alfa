import { lex, parse } from "@siteimprove/alfa-lang";
import { Assertions, test } from "@siteimprove/alfa-test";
import { Alphabet } from "../../../../src/alphabet";
import { FontWeight } from "../../../../src/properties/font/types";
import { FontWeightGrammar } from "../../../../src/properties/font/weight/grammar";
import { Values } from "../../../../src/values";

const { keyword, number } = Values;

function fontWeight(t: Assertions, input: string, expected: FontWeight | null) {
  const lexer = lex(input, Alphabet);
  const parser = parse(lexer.result, FontWeightGrammar);

  if (expected === null) {
    t(parser.result === null || !parser.done);
  } else {
    t.deepEqual(parser.result, expected, input);
  }
}

test("Can parse a normal font-weight", t => {
  fontWeight(t, "normal", keyword("normal"));
});

test("Can parse a bold font-weight", t => {
  fontWeight(t, "bold", keyword("bold"));
});

test("Can not parse a out of bounds font-weight", t => {
  fontWeight(t, "1200", null);
});

test("Can parse an absolute font-weight", t => {
  fontWeight(t, "137", number(137));
});

test("Can parse a relative font-weight", t => {
  fontWeight(t, "lighter", keyword("lighter"));
});
