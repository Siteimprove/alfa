import { lex, parse } from "@siteimprove/alfa-lang";
import { Assertions, test } from "@siteimprove/alfa-test";
import { Alphabet } from "../../../src/alphabet";
import { ContentGrammar } from "../../../src/properties/content/grammar";
import { Content } from "../../../src/properties/content/types";

function content(t: Assertions, input: string, expected: Content) {
  t.deepEqual(parse(lex(input, Alphabet), ContentGrammar), expected, input);
}

test("Can parse normal content", t => {
  content(t, "normal", "normal");
});

test("Can parse none content", t => {
  content(t, "none", "none");
});

test("Can parse a list of string content", t => {
  content(t, '"Hello" " " "world"', ["Hello", " ", "world"]);
});
