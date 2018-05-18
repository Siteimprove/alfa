import { test, Test } from "@siteimprove/alfa-test";
import { parse, lex } from "@siteimprove/alfa-lang";
import { Alphabet } from "../../src/alphabet";
import { Display } from "../../src/properties/display";
import { DisplayGrammar } from "../../src/grammars/display";

async function display(t: Test, input: string, expected: Display) {
  t.deepEqual(parse(lex(input, Alphabet), DisplayGrammar), expected, t.title);
}

test("Can parse block display", t =>
  display(t, "block", { outside: "block", inside: "flow" }));

test("Can parse inline display", t =>
  display(t, "inline", { outside: "inline", inside: "flow" }));

test("Can parse run-in display", t =>
  display(t, "run-in", { outside: "run-in", inside: "flow" }));

test("Can parse flow display", t =>
  display(t, "flow", { outside: "block", inside: "flow" }));

test("Can parse flow-root display", t =>
  display(t, "flow-root", { outside: "block", inside: "flow-root" }));

test("Can parse table display", t =>
  display(t, "table", { outside: "block", inside: "table" }));

test("Can parse flex display", t =>
  display(t, "flex", { outside: "block", inside: "flex" }));

test("Can parse grid display", t =>
  display(t, "grid", { outside: "block", inside: "grid" }));

test("Can parse ruby display", t =>
  display(t, "ruby", { outside: "inline", inside: "ruby" }));

test("Can parse contents display", t =>
  display(t, "contents", { box: "contents" }));

test("Can parse none display", t => display(t, "none", { box: "none" }));

test("Can parse inline-block display", t =>
  display(t, "inline-block", { outside: "inline", inside: "flow-root" }));

test("Can parse inline-table display", t =>
  display(t, "inline-table", { outside: "inline", inside: "table" }));

test("Can parse inline-flex display", t =>
  display(t, "inline-flex", { outside: "inline", inside: "flex" }));

test("Can parse inline-grid display", t =>
  display(t, "inline-grid", { outside: "inline", inside: "grid" }));
