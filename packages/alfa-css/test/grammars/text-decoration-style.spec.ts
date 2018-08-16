import { lex, parse } from "@siteimprove/alfa-lang";
import { Assertions, test } from "@siteimprove/alfa-test";
import { Alphabet } from "../../src/alphabet";
import { TextDecorationStyleGrammar } from "../../src/grammars/text-decoration-style";
import { TextDecorationStyle } from "../../src/properties/text-decoration-style";

function content(
  t: Assertions,
  input: string,
  expected: TextDecorationStyle | null
) {
  t.deepEqual(
    parse(lex(input, Alphabet), TextDecorationStyleGrammar),
    expected,
    input
  );
}

test("Can parse initial text-decoration-style", t => {
  content(t, "initial", "none");
});

test("Can parse initial text-decoration-style", t => {
  content(t, "none", "none");
});
