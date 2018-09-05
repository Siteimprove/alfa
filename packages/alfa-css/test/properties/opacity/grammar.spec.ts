import { lex, parse } from "@siteimprove/alfa-lang";
import { Assertions, test } from "@siteimprove/alfa-test";
import { Alphabet } from "../../../src/alphabet";
import { OpacityGrammar } from "../../../src/properties/opacity/grammar";
import { Opacity } from "../../../src/properties/opacity/types";

function opacity(t: Assertions, input: string, expected: Opacity) {
  t.deepEqual(parse(lex(input, Alphabet), OpacityGrammar), expected, input);
}

test("Can parse a number opacity", t => {
  opacity(t, "0.75", 0.75);
});

test("Can parse a percentage opacity", t => {
  opacity(t, "75%", 0.75);
});
