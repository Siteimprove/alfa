import { Document, h } from "@siteimprove/alfa-dom";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import R91 from "../../src/sia-r91/rule";
import { Outcomes } from "../../src/common/diagnostic/text-spacing";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

const outcomes = Outcomes("letter-spacing");

test("evaluate() passes on non important style", async (t) => {
  const target = <div style={{ letterSpacing: "0.1em" }}>Hello World</div>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R91, { document }), [
    passed(R91, target, { 1: outcomes.notImportant }),
  ]);
});

test("evaluate() passes on large enough value", async (t) => {
  const target = (
    <div style={{ letterSpacing: "0.12em !important" }}>Hello World</div>
  );

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R91, { document }), [
    passed(R91, target, { 1: outcomes.aboveMinimum }),
  ]);
});

test("evaluate() passes on important cascaded styles", async (t) => {
  const target = <div style={{ letterSpacing: "0.15em" }}>Hello World</div>;

  const document = Document.of(
    [target],
    [h.sheet([h.rule.style("div", { letterSpacing: "0.1em !important" })])]
  );

  t.deepEqual(await evaluate(R91, { document }), [
    passed(R91, target, { 1: outcomes.cascaded }),
  ]);
});

test("evaluate() fails on important small values", async (t) => {
  const target = (
    <div style={{ letterSpacing: "0.1em !important" }}>Hello World</div>
  );

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R91, { document }), [
    failed(R91, target, { 1: outcomes.important }),
  ]);
});

test("evaluate() is inapplicable if letter-spacing is not declared in the style", async (t) => {
  const document = Document.of([
    <div style={{ color: "red" }}>Hello World</div>,
  ]);

  t.deepEqual(await evaluate(R91, { document }), [inapplicable(R91)]);
});
