import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R40, { Outcomes } from "../../src/sia-r40/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes a region with an accessible name", async (t) => {
  const target = (
    <div role="region" aria-label="Hello">
      Hello world
    </div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R40, { document }), [
    passed(R40, target, { 1: Outcomes.HasName }),
  ]);
});

test("evaluate() fails a region without accessible name", async (t) => {
  const target = <div role="region">Hello world</div>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R40, { document }), [
    failed(R40, target, { 1: Outcomes.HasNoName }),
  ]);
});

test("evaluate() is inapplicable when there is no region", async (t) => {
  const document = h.document([<div>Hello</div>]);

  t.deepEqual(await evaluate(R40, { document }), [inapplicable(R40)]);
});
