import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R3, { Outcomes } from "../../src/sia-r3/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes a single id attribute.", async (t) => {
  const target = <div id="my-div">This is my first element</div>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R3, { document }), [
    passed(R3, target, {
      1: Outcomes.HasUniqueId,
    }),
  ]);
});

test("evaluate() passes multiple unique id attributes", async (t) => {
  const target1 = <div id="my-div1">This is my first element</div>;
  const target2 = <div id="my-div2">This is my second element</div>;
  const target3 = <svg id="my-div3">This is my third element</svg>;

  const document = Document.of([target1, target2, target3]);

  t.deepEqual(await evaluate(R3, { document }), [
    passed(R3, target1, {
      1: Outcomes.HasUniqueId,
    }),
    passed(R3, target2, {
      1: Outcomes.HasUniqueId,
    }),
    passed(R3, target3, {
      1: Outcomes.HasUniqueId,
    }),
  ]);
});

test("evaluate() fails duplicated id attributes", async (t) => {
  const target1 = <div id="label">Name</div>;
  const target2 = <div id="label">City</div>;

  const document = Document.of([target1, target2]);

  t.deepEqual(await evaluate(R3, { document }), [
    failed(R3, target1, {
      1: Outcomes.HasNonUniqueId,
    }),
    failed(R3, target2, {
      1: Outcomes.HasNonUniqueId,
    }),
  ]);
});

test("evaluate() fails duplicated id attributes on SVG element", async (t) => {
  const target1 = <div id="label">Name</div>;
  const target2 = (
    <svg id="label">
      <text x="0" y="15">
        City
      </text>
    </svg>
  );

  const document = Document.of([target1, target2]);

  t.deepEqual(await evaluate(R3, { document }), [
    failed(R3, target1, {
      1: Outcomes.HasNonUniqueId,
    }),
    failed(R3, target2, {
      1: Outcomes.HasNonUniqueId,
    }),
  ]);
});

test("evaluate() is inapplicable to a document without id attribute", async (t) => {
  const target1 = <div>This is my first element</div>;

  const document = Document.of([target1]);

  t.deepEqual(await evaluate(R3, { document }), [inapplicable(R3)]);
});
