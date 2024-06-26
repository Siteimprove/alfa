import { Length } from "@siteimprove/alfa-css";
import { h, Namespace } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R91 from "../../dist/sia-r91/rule.js";
import { Outcomes } from "../../dist/common/expectation/is-wide-enough.js";

import { evaluate } from "../common/evaluate.js";
import { failed, inapplicable, passed } from "../common/outcome.js";

test("evaluate() passes on large enough value", async (t) => {
  const declaration = h.declaration("letter-spacing", "0.12em", true);
  const target = h.element(
    "div",
    [],
    [h.text("Hello World")],
    [declaration],
    Namespace.HTML,
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R91, { document }), [
    passed(R91, target, {
      1: Outcomes.IsWideEnough(
        "letter-spacing",
        Length.of(1.92, "px"),
        Length.of(16, "px"),
        0.12,
        0.12,
        declaration,
        target,
      ),
    }),
  ]);
});

test(`evaluate() ignores elements whose \`letter-spacing\` is never used`, async (t) => {
  const declaration = h.declaration("letter-spacing", "2px", true);
  const target = h.element(
    "p",
    [],
    [h.text("Hello World")],
    [declaration],
    Namespace.HTML,
  );

  const document = h.document([
    // letter-spacing on the <div> is too small compared to the font-size,
    // but it affects no text since it is overwritten in the <p>.
    <div style={{ fontSize: "16px", letterSpacing: "1.5px !important" }}>
      {target}
    </div>,
  ]);

  t.deepEqual(await evaluate(R91, { document }), [
    passed(R91, target, {
      1: Outcomes.IsWideEnough(
        "letter-spacing",
        Length.of(2, "px"),
        Length.of(16, "px"),
        0.125,
        0.12,
        declaration,
        target,
      ),
    }),
  ]);
});

test(`evaluate() considers the latest \`font-size\``, async (t) => {
  const target = <p style={{ fontSize: "10px" }}>Hello World</p>;

  const declarations = [
    h.declaration("font-size", "16px", false),
    h.declaration("letter-spacing", "1.5px", true),
  ];

  const div = h.element("div", [], [target], declarations, Namespace.HTML);
  const document = h.document([
    // letter-spacing on the <div> is too small compared to the font-size,
    // but this font-size affects no text since it is overwritten in the <p>.
    div,
  ]);

  t.deepEqual(await evaluate(R91, { document }), [
    passed(R91, target, {
      1: Outcomes.IsWideEnough(
        "letter-spacing",
        Length.of(1.5, "px"),
        Length.of(10, "px"),
        0.15,
        0.12,
        declarations[1],
        div,
      ),
    }),
  ]);
});

test("evaluate() fails on important small values", async (t) => {
  const declaration = h.declaration("letter-spacing", "0.1em", true);
  const target = h.element(
    "div",
    [],
    [h.text("Hello World")],
    [declaration],
    Namespace.HTML,
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R91, { document }), [
    failed(R91, target, {
      1: Outcomes.IsNotWideEnough(
        "letter-spacing",
        Length.of(1.6, "px"),
        Length.of(16, "px"),
        0.1,
        0.12,
        declaration,
        target,
      ),
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
    [h.sheet([h.rule.style("div", { letterSpacing: "0.1em !important" })])],
  );

  t.deepEqual(await evaluate(R91, { document }), [inapplicable(R91)]);
});
