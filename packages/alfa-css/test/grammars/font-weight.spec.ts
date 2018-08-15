import { lex, parse } from "@siteimprove/alfa-lang";
import { Assertions, test } from "@siteimprove/alfa-test";
import { Alphabet } from "../../src/alphabet";
import { FontWeightGrammar } from "../../src/grammars/font-weight";
import { FontWeight } from "../../src/properties/font-weight";

function fontWeight(t: Assertions, input: string, expected: FontWeight) {
  t.deepEqual(parse(lex(input, Alphabet), FontWeightGrammar), expected, input);
}

test("Can parse a normal font-weight", t => {
  fontWeight(t, "normal", {
    type: "absolute",
    value: 400
  });
});

test("Can parse a bold font-weight", t => {
  fontWeight(t, "bold", {
    type: "absolute",
    value: 700
  });
});

test("Can not parse a out of bounds font-weight", t => {
  fontWeight(t, "1200", {
    type: "absolute",
    value: 400
  });
});

test("Can parse an absolute font-weight", t => {
  fontWeight(t, "100", {
    type: "absolute",
    value: 100
  });
});

test("Can parse a relative font-weight", t => {
  fontWeight(t, "lighter", {
    type: "relative",
    value: "lighter"
  });
});
