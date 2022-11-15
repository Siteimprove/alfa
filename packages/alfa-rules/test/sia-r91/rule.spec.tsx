import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R91, { Outcomes } from "../../src/sia-r91/rule";

import { evaluate } from "../common/evaluate";
import { failed, inapplicable, passed } from "../common/outcome";

test("evaluate() passes on large enough value", async (t) => {
  const target = (
    <div style={{ letterSpacing: "0.12em !important" }}>Hello World</div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R91, { document }), [
    passed(R91, target, {
      1: Outcomes.IsWideEnough,
    }),
  ]);
});

test(`evaluate() ignores elements whose \`letter-spacing\` is never used`, async (t) => {
  const target = <p style={{ letterSpacing: "2px !important" }}>Hello World</p>;

  const document = h.document([
    // letter-spacing on the <div> is too small compared to the font-size,
    // but it affects no text since it is overwritten in the <p>.
    <div style={{ fontSize: "16px", letterSpacing: "1.5px !important" }}>
      {target}
    </div>,
  ]);

  t.deepEqual(await evaluate(R91, { document }), [
    passed(R91, target, { 1: Outcomes.IsWideEnough }),
  ]);
});

test(`evaluate() considers the latest \`font-size\``, async (t) => {
  const target = <p style={{ fontSize: "10px" }}>Hello World</p>;

  const document = h.document([
    // letter-spacing on the <div> is too small compared to the font-size,
    // but this font-size affects no text since it is overwritten in the <p>.
    <div style={{ fontSize: "16px", letterSpacing: "1.5px !important" }}>
      {target}
    </div>,
  ]);

  t.deepEqual(await evaluate(R91, { document }), [
    passed(R91, target, { 1: Outcomes.IsWideEnough }),
  ]);
});

test("evaluate() fails on important small values", async (t) => {
  const target = (
    <div style={{ letterSpacing: "0.1em !important" }}>Hello World</div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R91, { document }), [
    failed(R91, target, {
      1: Outcomes.IsNotWideEnough,
    }),
  ]);
});

test(`evaluate() is inapplicable to elements with no text`, async (t) => {
  const document = h.document([
    <div style={{ letterSpacing: "0px !important" }}>
      <img src="visible-div.png" />
    </div>,
  ]);

  t.deepEqual(await evaluate(R91, { document }), [inapplicable(R91)]);
});

test("evaluate() is inapplicable if letter-spacing is not declared in the style attribute", async (t) => {
  const document = h.document([
    <div style={{ color: "red" }}>Hello World</div>,
  ]);

  t.deepEqual(await evaluate(R91, { document }), [inapplicable(R91)]);
});

test("evaluate() is inapplicable on non important style", async (t) => {
  const document = h.document([
    <div style={{ letterSpacing: "0.1em" }}>Hello World</div>,
  ]);

  t.deepEqual(await evaluate(R91, { document }), [inapplicable(R91)]);
});

test("evaluate() is inapplicable on important cascaded styles", async (t) => {
  const document = h.document(
    [<div style={{ letterSpacing: "0.15em" }}>Hello World</div>],
    [h.sheet([h.rule.style("div", { letterSpacing: "0.1em !important" })])]
  );

  t.deepEqual(await evaluate(R91, { document }), [inapplicable(R91)]);
});
