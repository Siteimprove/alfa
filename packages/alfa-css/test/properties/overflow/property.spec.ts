import { lex } from "@siteimprove/alfa-lang";
import { test } from "@siteimprove/alfa-test";
import { Alphabet } from "../../../src/alphabet";
import { overflow } from "../../../src/properties/overflow/property";
import { overflowX } from "../../../src/properties/overflow/property-x";
import { overflowY } from "../../../src/properties/overflow/property-y";
import { Values } from "../../../src/values";

const { keyword } = Values;

test("Can parse full shorthand", t => {
  const lexer = lex("clip hidden", Alphabet);
  t.deepEqual(overflow.parse(lexer.result), {
    overflowX: keyword("clip"),
    overflowY: keyword("hidden")
  });
});

test("Can parse short shorthand", t => {
  const lexer = lex("clip", Alphabet);
  t.deepEqual(overflow.parse(lexer.result), {
    overflowX: keyword("clip"),
    overflowY: keyword("clip")
  });
});

test("Cannot parse invalid short shorthand", t => {
  const lexer = lex("foo", Alphabet);
  t.deepEqual(overflow.parse(lexer.result), {
    overflowX: overflowX.initial(),
    overflowY: overflowY.initial()
  });
});

test("Cannot parse invalid full shorthand", t => {
  const lexer = lex("foo bar", Alphabet);
  t.deepEqual(overflow.parse(lexer.result), {
    overflowX: overflowX.initial(),
    overflowY: overflowY.initial()
  });
});
