import { h } from "@siteimprove/alfa-dom/h";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R83, { Outcomes } from "../../src/sia-r83/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes a text node that truncates overflow using ellipsis", async (t) => {
  const target = h.text("Hello world");

  const document = Document.of([
    <div
      style={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
      }}
    >
      {target}
    </div>,
  ]);

  t.deepEqual(await evaluate(R83, { document }), [
    passed(R83, target, {
      1: Outcomes.WrapsText,
    }),
  ]);
});

test(`evaluate() passes a text node that hides overflow by wrapping text using
      the \`height\` property with a value that is equal to the value of the
      \`line-height\` property`, async (t) => {
  const target = h.text("Hello world");

  const document = Document.of([
    <div style={{ overflow: "hidden", height: "1.5em", lineHeight: "1.5" }}>
      {target}
    </div>,
  ]);

  t.deepEqual(await evaluate(R83, { document }), [
    passed(R83, target, {
      1: Outcomes.WrapsText,
    }),
  ]);
});

test(`evaluate() fails a text node that clips overflow by not wrapping text
      using the \`white-space\` property`, async (t) => {
  const target = h.text("Hello world");

  const document = Document.of([
    <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>{target}</div>,
  ]);

  t.deepEqual(await evaluate(R83, { document }), [
    failed(R83, target, {
      1: Outcomes.ClipsText,
    }),
  ]);
});

test(`evaluate() fails a text node that clips overflow by not wrapping text
      using the \`height\` property with a value that is greater than the value
      of the \`line-height\` property`, async (t) => {
  const target = h.text("Hello world");

  const document = Document.of([
    <div style={{ overflow: "hidden", height: "1.5em", lineHeight: "1.2" }}>
      {target}
    </div>,
  ]);

  t.deepEqual(await evaluate(R83, { document }), [
    failed(R83, target, {
      1: Outcomes.ClipsText,
    }),
  ]);
});

test("evaluate() is inapplicable to a text node that is not visible", async (t) => {
  const document = Document.of([
    <div style={{ overflow: "hidden", whiteSpace: "nowrap" }} hidden>
      Hello world
    </div>,
  ]);

  t.deepEqual(await evaluate(R83, { document }), [inapplicable(R83)]);
});

test(`evaluate() is inapplicable to a text node that is excluded from the
      accessibility tree using the \`aria-hidden\` attribute`, async (t) => {
  const document = Document.of([
    <div
      style={{ overflow: "hidden", whiteSpace: "nowrap" }}
      aria-hidden="true"
    >
      Hello world
    </div>,
  ]);

  t.deepEqual(await evaluate(R83, { document }), [inapplicable(R83)]);
});
