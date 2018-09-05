import { lex, parse } from "@siteimprove/alfa-lang";
import { Assertions, test } from "@siteimprove/alfa-test";
import { Alphabet } from "../../../src/alphabet";
import { TextIndentGrammar } from "../../../src/properties/text-indent/grammar";
import { TextIndent } from "../../../src/properties/text-indent/types";

function textIndent(t: Assertions, input: string, expected: TextIndent | null) {
  t.deepEqual(parse(lex(input, Alphabet), TextIndentGrammar), expected, input);
}

test("Can parse an absolute indent in px", t => {
  textIndent(t, "7px", {
    type: "length",
    value: 7,
    unit: "px"
  });
});

test("Can parse a relative indent in percentage", t => {
  textIndent(t, "25%", {
    type: "percentage",
    value: 0.25
  });
});

test("Can parse a relative indent in em", t => {
  textIndent(t, "2.5em", {
    type: "percentage",
    value: 2.5,
    unit: "em"
  });
});

test("Can parse a absolute hanging indent", t => {
  textIndent(t, "7px hanging", {
    type: "length",
    value: 7,
    unit: "px",
    hanging: true
  });
});

test("Can parse a relative hanging indent in percentage", t => {
  textIndent(t, "7% hanging", {
    type: "percentage",
    value: 0.07,
    hanging: true
  });
});

test("Can parse a relative hanging indent in em", t => {
  textIndent(t, "7em hanging", {
    type: "percentage",
    value: 7,
    unit: "em",
    hanging: true
  });
});

test("Can parse a absolute-hanging-eachline indent", t => {
  textIndent(t, "7px hanging each-line", {
    type: "length",
    value: 7,
    unit: "px",
    hanging: true,
    eachLine: true
  });
});

test("Can parse a absolute-eachline indent", t => {
  textIndent(t, "7px each-line", {
    type: "length",
    value: 7,
    unit: "px",
    eachLine: true
  });
});

test("Does not accept repeated keywords", t => {
  textIndent(t, "7px hanging hanging", null);
  textIndent(t, "7em hanging hanging", null);
});

test("Does not accept incorrectly ordered keywords", t => {
  textIndent(t, "7px each-line hanging", null);
  textIndent(t, "7em each-line hanging", null);
});
