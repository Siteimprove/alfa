import { lex, parse } from "@siteimprove/alfa-lang";
import { Assertions, test } from "@siteimprove/alfa-test";
import { Alphabet } from "../../src/alphabet";
import { DisplayGrammar } from "../../src/grammars/display";
import { Display } from "../../src/properties/display";

function display(t: Assertions, input: string, expected: Display) {
  t.deepEqual(parse(lex(input, Alphabet), DisplayGrammar), expected, input);
}

test("Can parse block display", t => {
  display(t, "block", ["block", "flow"]);
});

test("Can parse inline display", t => {
  display(t, "inline", ["inline", "flow"]);
});

test("Can parse run-in display", t => {
  display(t, "run-in", ["run-in", "flow"]);
});

test("Can parse flow display", t => {
  display(t, "flow", ["block", "flow"]);
});

test("Can parse flow-root display", t => {
  display(t, "flow-root", ["block", "flow-root"]);
});

test("Can parse table display", t => {
  display(t, "table", ["block", "table"]);
});

test("Can parse flex display", t => {
  display(t, "flex", ["block", "flex"]);
});

test("Can parse grid display", t => {
  display(t, "grid", ["block", "grid"]);
});

test("Can parse ruby display", t => {
  display(t, "ruby", ["inline", "ruby"]);
});

test("Can parse list-item display", t => {
  display(t, "list-item", ["block", "flow", "list-item"]);
});

test("Can parse contents display", t => {
  display(t, "contents", "contents");
});

test("Can parse none display", t => {
  display(t, "none", "none");
});

test("Can parse inline-block display", t => {
  display(t, "inline-block", ["inline", "flow-root"]);
});

test("Can parse inline-table display", t => {
  display(t, "inline-table", ["inline", "table"]);
});

test("Can parse inline-flex display", t => {
  display(t, "inline-flex", ["inline", "flex"]);
});

test("Can parse inline-grid display", t => {
  display(t, "inline-grid", ["inline", "grid"]);
});
