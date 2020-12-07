import { Document, h } from "@siteimprove/alfa-dom";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import R92 from "../../src/sia-r92/rule";
import { Outcomes } from "../../src/common/diagnostic/text-spacing";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

const outcomes = Outcomes("word-spacing");

test("evaluate() passes on non important style", async (t) => {
  const target = <div style={{ wordSpacing: "0.1em" }}>Hello World</div>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R92, { document }), [
    passed(R92, target, { 1: outcomes.notImportant }),
  ]);
});

test("evaluate() passes on large enough value", async (t) => {
  const target = (
    <div style={{ wordSpacing: "0.16em !important" }}>Hello World</div>
  );

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R92, { document }), [
    passed(R92, target, { 1: outcomes.aboveMinimum }),
  ]);
});

test("evaluate() passes on important cascaded styles", async (t) => {
  const target = <div style={{ wordSpacing: "0.18em" }}>Hello World</div>;

  const document = Document.of(
    [target],
    [h.sheet([h.rule.style("div", { wordSpacing: "0.1em !important" })])]
  );

  t.deepEqual(await evaluate(R92, { document }), [
    passed(R92, target, { 1: outcomes.cascaded }),
  ]);
});

test("evaluate() fails on important small values", async (t) => {
  const target = (
    <div style={{ wordSpacing: "0.1em !important" }}>Hello World</div>
  );

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R92, { document }), [
    failed(R92, target, { 1: outcomes.important }),
  ]);
});

test("evaluate() is inapplicable if word-spacing is not declared in the style", async (t) => {
  const document = Document.of([
    <div style={{ color: "red" }}>Hello World</div>,
  ]);

  t.deepEqual(await evaluate(R92, { document }), [inapplicable(R92)]);
});
