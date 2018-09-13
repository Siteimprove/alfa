import { lex, parse } from "@siteimprove/alfa-lang";
import { Assertions, test } from "@siteimprove/alfa-test";
import { Alphabet } from "../../../src/alphabet";
import { ContentGrammar } from "../../../src/properties/content/grammar";
import { Content } from "../../../src/properties/content/types";
import { Values } from "../../../src/values";

function content(t: Assertions, input: string, expected: Content) {
  const lexer = lex(input, Alphabet);
  const parser = parse(lexer.result, ContentGrammar);

  t.deepEqual(parser.result, expected, input);
}

test("Can parse normal content", t => {
  content(t, "normal", Values.keyword("normal"));
});

test("Can parse none content", t => {
  content(t, "none", Values.keyword("none"));
});

test("Can parse a list of string content", t => {
  content(
    t,
    '"Hello" " " "world"',
    Values.list(
      Values.string("Hello"),
      Values.string(" "),
      Values.string("world")
    )
  );
});
