import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R80, { Outcomes } from "../../dist/sia-r80/rule.js";

import { evaluate } from "../common/evaluate.js";
import { passed, failed, inapplicable } from "../common/outcome.js";

test(`evaluate() passes an element with a line height specified using a relative
      length`, async (t) => {
  const target = <p style={{ lineHeight: "1.5em" }}>Hello world</p>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R80, { document }), [
    passed(R80, target, {
      1: Outcomes.HasRelativeUnit,
    }),
  ]);
});

test(`evaluate() fails an element with a line height specified using an absolute
      length`, async (t) => {
  const target = <p style={{ lineHeight: "24px" }}>Hello world</p>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R80, { document }), [
    failed(R80, target, {
      1: Outcomes.HasAbsoluteUnit,
    }),
  ]);
});

test("evaluate() is inapplicable to an element that has no text", async (t) => {
  const document = h.document([<p style={{ lineHeight: "24px" }} />]);

  t.deepEqual(await evaluate(R80, { document }), [inapplicable(R80)]);
});

test("evaluate() is inapplicable to an element that isn't visible", async (t) => {
  const document = h.document([
    <p style={{ lineHeight: "24px" }} hidden>
      Hello world
    </p>,
  ]);

  t.deepEqual(await evaluate(R80, { document }), [inapplicable(R80)]);
});

test(`evaluate() fails an element with a line height specified using an absolute
      length`, async (t) => {
  const target = <p style={{ lineHeight: "24px" }}>Hello world</p>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R80, { document }), [
    failed(R80, target, {
      1: Outcomes.HasAbsoluteUnit,
    }),
  ]);
});

test(`evaluate() is inapplicable to non-paragraph elements`, async (t) => {
  const target = <div style={{ lineHeight: "24px" }}>Hello world</div>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R80, { document }), [inapplicable(R80)]);
});

test(`evaluate() fails an ARIA paragraph with a line height specified using an
      absolute length`, async (t) => {
  const target = (
    <div role="paragraph" style={{ lineHeight: "24px" }}>
      Hello world
    </div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R80, { document }), [
    failed(R80, target, {
      1: Outcomes.HasAbsoluteUnit,
    }),
  ]);
});
