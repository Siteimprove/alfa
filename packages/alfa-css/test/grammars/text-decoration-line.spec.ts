import { lex, parse } from "@siteimprove/alfa-lang";
import { Assertions, test } from "@siteimprove/alfa-test";
import { Alphabet } from "../../src/alphabet";
import { TextDecorationLineGrammar } from "../../src/grammars/text-decoration-line";
import { TextDecorationLine } from "../../src/properties/text-decoration-line";

function content(
  t: Assertions,
  input: string,
  expected: TextDecorationLine | null
) {
  t.deepEqual(
    parse(lex(input, Alphabet), TextDecorationLineGrammar),
    expected,
    input
  );
}

test("Can parse initial text-decoration-line", t => {
  content(t, "initial", "none");
});

test("Can parse initial text-decoration-line", t => {
  content(t, "none", "none");
});
