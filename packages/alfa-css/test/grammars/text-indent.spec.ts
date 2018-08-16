import { lex, parse } from "@siteimprove/alfa-lang";
import { Assertions, test } from "@siteimprove/alfa-test";
import { Alphabet } from "../../src/alphabet";
import { TextIndentGrammar } from "../../src/grammars/text-indent";
import { TextIndent } from "../../src/properties/text-indent";

function textIndent(t: Assertions, input: string, expected: TextIndent) {
  t.deepEqual(parse(lex(input, Alphabet), TextIndentGrammar), expected, input);
}

test("Can parse an absolute indent", t => {
  textIndent(t, "7px", {
    type: "length",
    value: 7,
    unit: "px"
  });
});

test("Can parse a relative indent", t => {
  textIndent(t, "25%", {
    type: "percentage",
    value: 0.25
  });
});

test("Can parse a absolute-hanging indent", t => {
  textIndent(t, "7px hanging", {
    type: "length",
    value: 7,
    unit: "px",
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
});
