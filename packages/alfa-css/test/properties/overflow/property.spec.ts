import { lex } from "@siteimprove/alfa-lang";
import { Assertions, test } from "@siteimprove/alfa-test";
import { Alphabet } from "../../../src/alphabet";
import { overflow as overflowProperty } from "../../../src/properties/overflow/property";
import { overflowX } from "../../../src/properties/overflow/property-x";
import { overflowY } from "../../../src/properties/overflow/property-y";
import { Overflow } from "../../../src/properties/overflow/types";
import { Values } from "../../../src/values";

const { keyword } = Values;

function overflow(
  t: Assertions,
  input: string,
  expected: { overflowX: Overflow; overflowY: Overflow }
) {
  const lexer = lex(input, Alphabet);

  t.deepEqual(overflowProperty.parse(lexer.result), expected);
}

test("Can parse full shorthand", t => {
  overflow(t, "clip hidden", {
    overflowX: keyword("clip"),
    overflowY: keyword("hidden")
  });
});

test("Can parse short shorthand", t => {
  overflow(t, "clip", {
    overflowX: keyword("clip"),
    overflowY: keyword("clip")
  });
});

test("Cannot parse invalid short shorthand", t => {
  overflow(t, "foo", {
    overflowX: overflowX.initial(),
    overflowY: overflowY.initial()
  });
});

test("Cannot parse invalid full shorthand", t => {
  overflow(t, "foo foo", {
    overflowX: overflowX.initial(),
    overflowY: overflowY.initial()
  });
});
