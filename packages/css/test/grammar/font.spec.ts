import { test, Test } from "@alfa/test";
import { parse, lex } from "@alfa/lang";
import { Alphabet } from "../../src/alphabet";
import { FontSize, FontSizeGrammar } from "../../src/grammar/font";

async function fontSize(t: Test, input: string, expected: FontSize) {
  t.deepEqual(parse(lex(input, Alphabet), FontSizeGrammar), expected, t.title);
}

test("Can parse a px font size", t =>
  fontSize(t, "14px", {
    type: "length",
    value: 14,
    unit: "px"
  }));

test("Can parse an em font size", t =>
  fontSize(t, "1.2em", {
    type: "percentage",
    value: 1.2,
    unit: "em"
  }));

test("Can parse a % font size", t =>
  fontSize(t, "80%", {
    type: "percentage",
    value: 0.8
  }));
