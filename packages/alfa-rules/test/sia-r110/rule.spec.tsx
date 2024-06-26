import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R110, { Outcomes } from "../../dist/sia-r110/rule.js";

import { evaluate } from "../common/evaluate.js";
import { passed, failed, inapplicable } from "../common/outcome.js";

test("evaluates() passes an element with a single valid role", async (t) => {
  const target = h.attribute("role", "button");

  const document = h.document([h("button", [target])]);

  t.deepEqual(await evaluate(R110, { document }), [
    passed(R110, target, {
      1: Outcomes.HasValidRole,
    }),
  ]);
});

test("evaluates() passes an element with multiple valid roles", async (t) => {
  const target = h.attribute("role", "button link");

  const document = h.document([h("button", [target])]);

  t.deepEqual(await evaluate(R110, { document }), [
    passed(R110, target, {
      1: Outcomes.HasValidRole,
    }),
  ]);
});

test("evaluates() passes an element with both a valid and an invalid role", async (t) => {
  const target = h.attribute("role", "btn link");

  const document = h.document([h("button", [target])]);

  t.deepEqual(await evaluate(R110, { document }), [
    passed(R110, target, {
      1: Outcomes.HasValidRole,
    }),
  ]);
});

test("evaluates() fails an element with an invalid role", async (t) => {
  const target = h.attribute("role", "btn");

  const document = h.document([h("button", [target])]);

  t.deepEqual(await evaluate(R110, { document }), [
    failed(R110, target, {
      1: Outcomes.HasNoValidRole,
    }),
  ]);
});

test("evaluates() fails an element with several invalid roles", async (t) => {
  const target = h.attribute("role", "btn foo");

  const document = h.document([h("button", [target])]);

  t.deepEqual(await evaluate(R110, { document }), [
    failed(R110, target, {
      1: Outcomes.HasNoValidRole,
    }),
  ]);
});

test("evaluates() fails an element with an invalid role and not included in the accessibility tree by default", async (t) => {
  const span = <span role="invalid">Foo</span>;
  const target = span.attribute("role").getUnsafe();

  const document = h.document([span]);

  t.deepEqual(await evaluate(R110, { document }), [
    failed(R110, target, {
      1: Outcomes.HasNoValidRole,
    }),
  ]);
});

test("evaluates() is inapplicable to a hidden element", async (t) => {
  const button = (
    <button hidden role="invalid">
      Hello
    </button>
  );
  const document = h.document([button]);
  t.deepEqual(await evaluate(R110, { document }), [inapplicable(R110)]);
});

test("evaluate() is inapplicable when there is no role attribute", async (t) => {
  const document = h.document([<button />]);

  t.deepEqual(await evaluate(R110, { document }), [inapplicable(R110)]);
});

test("evaluate() is inapplicable when a role attribute is only whitespace", async (t) => {
  const document = h.document([<button role=" " />]);

  t.deepEqual(await evaluate(R110, { document }), [inapplicable(R110)]);
});
