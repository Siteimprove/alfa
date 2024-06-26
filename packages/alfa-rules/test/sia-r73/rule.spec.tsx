import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R73, { Outcomes } from "../../dist/sia-r73/rule.js";

import { evaluate } from "../common/evaluate.js";
import { passed, failed, inapplicable } from "../common/outcome.js";

test("evaluate() passes a paragraph whose line height is at least 1.5", async (t) => {
  const target = <p style={{ lineHeight: "1.5" }}>Hello world</p>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R73, { document }), [
    passed(R73, target, {
      1: Outcomes.IsSufficient,
    }),
  ]);
});

test(`evaluate() passes a paragraph whose line height is at least 1.5 times the
      font size`, async (t) => {
  const target = (
    <p style={{ fontSize: "16px", lineHeight: "24px" }}>Hello world</p>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R73, { document }), [
    passed(R73, target, {
      1: Outcomes.IsSufficient,
    }),
  ]);
});

test("evaluate() fails a paragraph whose line height is less than 1.5", async (t) => {
  const target = <p style={{ lineHeight: "1.2" }}>Hello world</p>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R73, { document }), [
    failed(R73, target, {
      1: Outcomes.IsInsufficient,
    }),
  ]);
});

test(`evaluate() fails a paragraph whose line height is less than 1.5 times the
      font size`, async (t) => {
  const target = (
    <p style={{ fontSize: "16px", lineHeight: "22px" }}>Hello world</p>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R73, { document }), [
    failed(R73, target, {
      1: Outcomes.IsInsufficient,
    }),
  ]);
});

test(`evaluate() fails a paragraph whose line height is "normal"`, async (t) => {
  const target = <p style={{ lineHeight: "normal" }}>Hello world</p>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R73, { document }), [
    failed(R73, target, {
      1: Outcomes.IsNormal,
    }),
  ]);
});

test("evaluate() fails a paragraph that relies on the default line height", async (t) => {
  const target = <p>Hello world</p>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R73, { document }), [
    failed(R73, target, {
      1: Outcomes.IsNormal,
    }),
  ]);
});

test("evaluate() fails an ARIA paragraph whose line height is less than 1.5", async (t) => {
  const target = (
    <div role="paragraph" style={{ lineHeight: "1.2" }}>
      Hello world
    </div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R73, { document }), [
    failed(R73, target, {
      1: Outcomes.IsInsufficient,
    }),
  ]);
});

test("evaluate() ignores a <p> element whose role is changed", async (t) => {
  const target = (
    <p role="generic" style={{ lineHeight: "1.2" }}>
      Hello world
    </p>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R73, { document }), [inapplicable(R73)]);
});
