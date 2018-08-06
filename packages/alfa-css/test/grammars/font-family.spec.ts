import { lex, parse } from "@siteimprove/alfa-lang";
import { Assertions, test } from "@siteimprove/alfa-test";
import { Alphabet } from "../../src/alphabet";
import { FontFamilyGrammar } from "../../src/grammars/font-family";
import { FontFamily } from "../../src/properties/font-family";

function fontFamily(t: Assertions, input: string, expected: FontFamily) {
  t.deepEqual(parse(lex(input, Alphabet), FontFamilyGrammar), expected, input);
}

test("Can parse a generic font family", t => {
  fontFamily(t, "sans-serif", "sans-serif");
});

test("Can parse a quoted non-generic font family", t => {
  fontFamily(t, '"Foo"', "Foo");
});

test("Can parse an unquoted non-generic font family with a single ident", t => {
  fontFamily(t, "Foo", "Foo");
});

test("Can parse an unquoted non-generic font family with multiple idents", t => {
  fontFamily(t, "Foo bar", "Foo bar");
});

test("Can parse a list of font families", t => {
  fontFamily(t, "Helvetica, sans-serif", ["Helvetica", "sans-serif"]);
});
