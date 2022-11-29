import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R57, { Outcomes } from "../../src/sia-r57/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes a text node that is included in a landmark", async (t) => {
  const target = h.text("This text is included in a landmark");

  const document = h.document([<main>{target}</main>]);

  t.deepEqual(await evaluate(R57, { document }), [
    passed(R57, target, { 1: Outcomes.IsIncludedInLandmark }),
  ]);
});

test("evaluate() passes a text node that is part of the first focusable element", async (t) => {
  const target = h.text("Skip to content");

  const document = h.document([
    <a href="#content">
      <span>{target}</span>
    </a>,
    <main />,
  ]);

  t.deepEqual(await evaluate(R57, { document }), [
    passed(R57, target, { 1: Outcomes.IsIncludedInFirstFocusableElement }),
  ]);
});

test("evaluate() passes a text node that is part of a dialog", async (t) => {
  const target = h.text("This text is included in a dialog");

  const document = h.document([<dialog open>{target}</dialog>, <main />]);

  t.deepEqual(await evaluate(R57, { document }), [
    passed(R57, target, { 1: Outcomes.IsIncludedInDialog }),
  ]);
});

test("evaluate() fails a text node that is not included in a landmark", async (t) => {
  const target = h.text("This text is not included in a landmark");

  const document = h.document([<div>{target}</div>, <main />]);

  t.deepEqual(await evaluate(R57, { document }), [
    failed(R57, target, { 1: Outcomes.IsNotIncludedInLandmark }),
  ]);
});

test("evaluate() fails text nodes in nameless sections or form", async (t) => {
  const target1 = h.text("Nameless forms are not landmarks");
  const target2 = h.text("Nameless sections are not landmarks");

  const document = h.document([
    <form>{target1}</form>,
    <section>{target2}</section>,
    <main />,
  ]);

  t.deepEqual(await evaluate(R57, { document }), [
    failed(R57, target1, { 1: Outcomes.IsNotIncludedInLandmark }),
    failed(R57, target2, { 1: Outcomes.IsNotIncludedInLandmark }),
  ]);
});

test("evaluate() is not applicable to text nodes not in the accessibility tree", async (t) => {
  const document = h.document([
    <div hidden>This text is not in the accessibility tree</div>,
    <main />,
  ]);

  t.deepEqual(await evaluate(R57, { document }), [inapplicable(R57)]);
});

test("evaluate() is not applicable when no landmarks are found", async (t) => {
  const document = h.document([
    <div>This text is in the accessibility tree</div>,
    <section>Nameless sections are not landmarks</section>,
  ]);

  t.deepEqual(await evaluate(R57, { document }), [inapplicable(R57)]);
});

test("evaluate() is not applicable to empty text nodes", async (t) => {
  const document = h.document([<div>{h.text("")}</div>]);

  t.deepEqual(await evaluate(R57, { document }), [inapplicable(R57)]);
});

test("evaluate() is not applicable to text nodes with only whitespace", async (t) => {
  const document = h.document([<div>{h.text(" \u00a0")}</div>]);

  t.deepEqual(await evaluate(R57, { document }), [inapplicable(R57)]);
});

test("evaluate() is not applicable to descendants of an <iframe> element", async (t) => {
  const document = h.document([
    <iframe>
      <span>Hello</span> world
    </iframe>,
  ]);

  t.deepEqual(await evaluate(R57, { document }), [inapplicable(R57)]);
});
