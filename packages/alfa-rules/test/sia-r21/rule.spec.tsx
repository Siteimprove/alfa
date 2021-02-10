import { h } from "@siteimprove/alfa-dom/h";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R21, { Outcomes } from "../../src/sia-r21/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluates() passes an element with a single valid role", async (t) => {
  const target = h.attribute("role", "button");

  const document = Document.of([h("button", [target])]);

  t.deepEqual(await evaluate(R21, { document }), [
    passed(R21, target, {
      1: Outcomes.HasValidRole,
    }),
  ]);
});

test("evaluates() passes an element with multiple valid roles", async (t) => {
  const target = h.attribute("role", "button link");

  const document = Document.of([h("button", [target])]);

  t.deepEqual(await evaluate(R21, { document }), [
    passed(R21, target, {
      1: Outcomes.HasValidRole,
    }),
  ]);
});

test("evaluates() fails an element with an invalid role", async (t) => {
  const target = h.attribute("role", "btn");

  const document = Document.of([h("button", [target])]);

  t.deepEqual(await evaluate(R21, { document }), [
    failed(R21, target, {
      1: Outcomes.HasNoValidRole,
    }),
  ]);
});

test("evaluates() fails an element with both a valid and an invalid role", async (t) => {
  const target = h.attribute("role", "btn link");

  const document = Document.of([h("button", [target])]);

  t.deepEqual(await evaluate(R21, { document }), [
    failed(R21, target, {
      1: Outcomes.HasNoValidRole,
    }),
  ]);
});

test("evaluate() is inapplicable when there is no role attribute", async (t) => {
  const document = Document.of([<button />]);

  t.deepEqual(await evaluate(R21, { document }), [inapplicable(R21)]);
});

test("evaluate() is inapplicable when a role attribute is only whitespace", async (t) => {
  const document = Document.of([<button role=" " />]);

  t.deepEqual(await evaluate(R21, { document }), [inapplicable(R21)]);
});
