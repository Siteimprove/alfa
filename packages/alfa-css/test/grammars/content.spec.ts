import { test, Assertions } from "@siteimprove/alfa-test";
import { parse, lex } from "@siteimprove/alfa-lang";
import { Alphabet } from "../../src/alphabet";
import { Content } from "../../src/properties/content";
import { ContentGrammar } from "../../src/grammars/content";

function content(t: Assertions, input: string, expected: Content) {
  t.deepEqual(parse(lex(input, Alphabet), ContentGrammar), expected, input);
}

test("Can parse normal content", t => content(t, "normal", "normal"));

test("Can parse none content", t => content(t, "none", "none"));

test("Can parse a list of string content", t =>
  content(t, '"Hello" " " "world"', ["Hello", " ", "world"]));
