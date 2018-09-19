import { lex, parse } from "@siteimprove/alfa-lang";
import { Assertions, test } from "@siteimprove/alfa-test";
import { Alphabet } from "../../../../src/alphabet";
import { FontFamilyGrammar } from "../../../../src/properties/font/family/grammar";
import { FontFamily } from "../../../../src/properties/font/types";
import { Values } from "../../../../src/values";

const { keyword, list, string } = Values;

function fontFamily(t: Assertions, input: string, expected: FontFamily) {
  const lexer = lex(input, Alphabet);
  const parser = parse(lexer.result, FontFamilyGrammar);

  t.deepEqual(parser.result, expected, input);
}

test("Can parse a generic font family", t => {
  fontFamily(t, "sans-serif", list(keyword("sans-serif")));
});

test("Can parse a quoted non-generic font family", t => {
  fontFamily(t, '"Foo"', list(string("Foo")));
});

test("Can parse an unquoted non-generic font family with a single ident", t => {
  fontFamily(t, "Foo", list(string("Foo")));
});

test("Can parse an unquoted non-generic font family with multiple idents", t => {
  fontFamily(t, "Foo bar", list(string("Foo bar")));
});

test("Can parse a list of font families", t => {
  fontFamily(
    t,
    "Helvetica, sans-serif",
    list(string("Helvetica"), keyword("sans-serif"))
  );
});
