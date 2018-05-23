import { test, Test } from "@siteimprove/alfa-test";
import { parse, lex } from "@siteimprove/alfa-lang";
import { Alphabet } from "../../src/alphabet";
import { Opacity } from "../../src/properties/opacity";
import { OpacityGrammar } from "../../src/grammars/opacity";

function opacity(t: Test, input: string, expected: Opacity) {
  t.deepEqual(parse(lex(input, Alphabet), OpacityGrammar), expected, t.title);
}

test("Can parse a number opacity", t => opacity(t, "0.75", 0.75));

test("Can parse a percentage opacity", t => opacity(t, "75%", 0.75));
