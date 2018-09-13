import { lex, parse } from "@siteimprove/alfa-lang";
import { Assertions, test } from "@siteimprove/alfa-test";
import { Alphabet } from "../../../../src/alphabet";
import { FontSizeGrammar } from "../../../../src/properties/font/size/grammar";
import { FontSize } from "../../../../src/properties/font/types";
import { Values } from "../../../../src/values";

const { keyword, length, percentage } = Values;

function fontSize(t: Assertions, input: string, expected: FontSize) {
  const lexer = lex(input, Alphabet);
  const parser = parse(lexer.result, FontSizeGrammar);

  t.deepEqual(parser.result, expected, input);
}

test("Can parse a px font size", t => {
  fontSize(t, "14px", length(14, "px"));
});

test("Can parse an em font size", t => {
  fontSize(t, "1.2em", length(1.2, "em"));
});

test("Can parse a % font size", t => {
  fontSize(t, "80%", percentage(0.8));
});

test("Can parse an absolute font size", t => {
  fontSize(t, "small", keyword("small"));
});

test("Can parse a relative font size", t => {
  fontSize(t, "smaller", keyword("smaller"));
});
