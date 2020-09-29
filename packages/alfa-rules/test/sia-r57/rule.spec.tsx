import { h } from "@siteimprove/alfa-dom/h";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R57, { Outcomes } from "../../src/sia-r57/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes a text node that is included in a landmark", async (t) => {
  const target = h.text("This text is included in a landmark");

  const document = Document.of([<main>{target}</main>]);

  t.deepEqual(await evaluate(R57, { document }), [
    passed(R57, target, {
      1: Outcomes.IsIncludedInLandmark,
    }),
  ]);
});

test("evaluate() fails a text node that is not included in a landmark", async (t) => {
  const target = h.text("This text is not included in a landmark");

  const document = Document.of([<div>{target}</div>, <main></main>]);

  t.deepEqual(await evaluate(R57, { document }), [
    failed(R57, target, {
      1: Outcomes.IsNotIncludedInLandmark,
    }),
  ]);
});

test("evaluate() is not applicable to text nodes not in the accessibility tree", async (t) => {
  const document = Document.of([
    <div hidden>This text is not in the accessibility tree</div>,
    <main></main>,
  ]);

  t.deepEqual(await evaluate(R57, { document }), [inapplicable(R57)]);
});

test("evaluate() is not applicable when no landmarks are found", async (t) => {
  const document = Document.of([
    <div>This text is in the accessibility tree</div>,
  ]);

  t.deepEqual(await evaluate(R57, { document }), [inapplicable(R57)]);
});

test("evaluate() is not applicable to empty text nodes", async (t) => {
  const document = Document.of([<div>{h.text("")}</div>]);

  t.deepEqual(await evaluate(R57, { document }), [inapplicable(R57)]);
});

test("evaluate() is not applicable to text nodes with only whitespace", async (t) => {
  const document = Document.of([<div>{h.text(" \u00a0")}</div>]);

  t.deepEqual(await evaluate(R57, { document }), [inapplicable(R57)]);
});

test("evaluate() is not applicable to descendants of an <iframe> element", async (t) => {
  const document = Document.of([
    <iframe>
      <span>Hello</span> world
    </iframe>,
  ]);

  t.deepEqual(await evaluate(R57, { document }), [inapplicable(R57)]);
});
