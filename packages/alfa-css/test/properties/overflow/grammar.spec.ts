import { lex, parse } from "@siteimprove/alfa-lang";
import { Assertions, test } from "@siteimprove/alfa-test";
import { Alphabet } from "../../../src/alphabet";
import { OverflowGrammar } from "../../../src/properties/overflow/grammar";
import { Overflow } from "../../../src/properties/overflow/types";
import { Values } from "../../../src/values";

const { keyword } = Values;

function overflow(t: Assertions, input: string, expected: Overflow) {
  const lexer = lex(input, Alphabet);
  const parser = parse(lexer.result, OverflowGrammar);

  t.deepEqual(parser.result, expected, input);
}

test("Can parse visible display", t => {
  overflow(t, "visible", keyword("visible"));
});

test("Can parse hidden display", t => {
  overflow(t, "hidden", keyword("hidden"));
});

test("Can parse clip display", t => {
  overflow(t, "clip", keyword("clip"));
});

test("Can parse scroll display", t => {
  overflow(t, "scroll", keyword("scroll"));
});

test("Can parse auto display", t => {
  overflow(t, "auto", keyword("auto"));
});
