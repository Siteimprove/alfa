import { lex, parse } from "@siteimprove/alfa-lang";
import { Assertions, test } from "@siteimprove/alfa-test";
import { Alphabet } from "../../../src/alphabet";
import { DisplayGrammar } from "../../../src/properties/display/grammar";
import { Display } from "../../../src/properties/display/types";
import { Values } from "../../../src/values";

const { tuple, keyword } = Values;

function display(t: Assertions, input: string, expected: Display) {
  const lexer = lex(input, Alphabet);
  const parser = parse(lexer.result, DisplayGrammar);

  t.deepEqual(parser.result, expected, input);
}

test("Can parse block display", t => {
  display(t, "block", tuple(keyword("block"), keyword("flow")));
});

test("Can parse inline display", t => {
  display(t, "inline", tuple(keyword("inline"), keyword("flow")));
});

test("Can parse run-in display", t => {
  display(t, "run-in", tuple(keyword("run-in"), keyword("flow")));
});

test("Can parse flow display", t => {
  display(t, "flow", tuple(keyword("block"), keyword("flow")));
});

test("Can parse flow-root display", t => {
  display(t, "flow-root", tuple(keyword("block"), keyword("flow-root")));
});

test("Can parse table display", t => {
  display(t, "table", tuple(keyword("block"), keyword("table")));
});

test("Can parse flex display", t => {
  display(t, "flex", tuple(keyword("block"), keyword("flex")));
});

test("Can parse grid display", t => {
  display(t, "grid", tuple(keyword("block"), keyword("grid")));
});

test("Can parse ruby display", t => {
  display(t, "ruby", tuple(keyword("inline"), keyword("ruby")));
});

test("Can parse list-item display", t => {
  display(
    t,
    "list-item",
    tuple(keyword("block"), keyword("flow"), keyword("list-item"))
  );
});

test("Can parse contents display", t => {
  display(t, "contents", keyword("contents"));
});

test("Can parse none display", t => {
  display(t, "none", keyword("none"));
});

test("Can parse inline-block display", t => {
  display(t, "inline-block", tuple(keyword("inline"), keyword("flow-root")));
});

test("Can parse inline-table display", t => {
  display(t, "inline-table", tuple(keyword("inline"), keyword("table")));
});

test("Can parse inline-flex display", t => {
  display(t, "inline-flex", tuple(keyword("inline"), keyword("flex")));
});

test("Can parse inline-grid display", t => {
  display(t, "inline-grid", tuple(keyword("inline"), keyword("grid")));
});
