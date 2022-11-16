import { Length } from "@siteimprove/alfa-css";
import { h, Namespace } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R93 from "../../src/sia-r93/rule";
import { Outcomes } from "../../src/common/expectation/is-wide-enough";

import { evaluate } from "../common/evaluate";
import { failed, inapplicable, passed } from "../common/outcome";

test("evaluate() passes on large enough value", async (t) => {
  const declaration = h.declaration("line-height", "1.5em", true);
  const target = h.element(
    "div",
    [],
    [h.text("Hello World")],
    [declaration],
    Namespace.HTML
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R93, { document }), [
    passed(R93, target, {
      1: Outcomes.IsWideEnough(
        "line-height",
        Length.of(24, "px"),
        Length.of(16, "px"),
        1.5,
        1.5,
        declaration,
        target
      ),
    }),
  ]);
});

test(`evaluate() ignores elements whose \`line-height\` is never used`, async (t) => {
  const declaration = h.declaration("line-height", "24px", true);
  const target = h.element(
    "p",
    [],
    [h.text("Hello World")],
    [declaration],
    Namespace.HTML
  );

  const document = h.document([
    // line-height on the <div> is too small compared to the font-size,
    // but it affects no text since it is overwritten in the <p>.
    <div style={{ fontSize: "16px", lineHeight: "1.5px !important" }}>
      {target}
    </div>,
  ]);

  t.deepEqual(await evaluate(R93, { document }), [
    passed(R93, target, {
      1: Outcomes.IsWideEnough(
        "line-height",
        Length.of(24, "px"),
        Length.of(16, "px"),
        1.5,
        1.5,
        declaration,
        target
      ),
    }),
  ]);
});

test(`evaluate() considers the latest \`font-size\``, async (t) => {
  const target = <p style={{ fontSize: "10px" }}>Hello World</p>;

  const declarations = [
    h.declaration("font-size", "16px", false),
    h.declaration("line-height", "15px", true),
  ];

  const div = h.element("div", [], [target], declarations, Namespace.HTML);
  const document = h.document([
    // line-height on the <div> is too small compared to the font-size,
    // but this font-size affects no text since it is overwritten in the <p>.
    div,
  ]);

  t.deepEqual(await evaluate(R93, { document }), [
    passed(R93, target, {
      1: Outcomes.IsWideEnough(
        "line-height",
        Length.of(15, "px"),
        Length.of(10, "px"),
        1.5,
        1.5,
        declarations[1],
        div
      ),
    }),
  ]);
});

test("evaluate() fails on important small values", async (t) => {
  const declaration = h.declaration("line-height", "1em", true);
  const target = h.element(
    "div",
    [],
    [h.text("Hello World")],
    [declaration],
    Namespace.HTML
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R93, { document }), [
    failed(R93, target, {
      1: Outcomes.IsNotWideEnough(
        "line-height",
        Length.of(16, "px"),
        Length.of(16, "px"),
        1,
        1.5,
        declaration,
        target
      ),
    }),
  ]);
});

test("evaluate() fails on important small ratio", async (t) => {
  const declaration = h.declaration("line-height", "1", true);
  const target = h.element(
    "div",
    [],
    [h.text("Hello World")],
    [declaration],
    Namespace.HTML
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R93, { document }), [
    failed(R93, target, {
      1: Outcomes.IsNotWideEnough(
        "line-height",
        Length.of(16, "px"),
        Length.of(16, "px"),
        1,
        1.5,
        declaration,
        target
      ),
    }),
  ]);
});

test("evaluate() fails on important `normal` value", async (t) => {
  const declaration = h.declaration("line-height", "normal", true);
  const target = h.element(
    "div",
    [],
    [h.text("Hello World")],
    [declaration],
    Namespace.HTML
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R93, { document }), [
    failed(R93, target, {
      1: Outcomes.IsNotWideEnough(
        "line-height",
        Length.of(19.2, "px"),
        Length.of(16, "px"),
        1.2,
        1.5,
        declaration,
        target
      ),
    }),
  ]);
});

test(`evaluate() is inapplicable to elements with no text`, async (t) => {
  const document = h.document([
    <div style={{ lineHeight: "0px !important" }}>
      <img src="visible-div.png" />
    </div>,
  ]);

  t.deepEqual(await evaluate(R93, { document }), [inapplicable(R93)]);
});

test("evaluate() is inapplicable if line-height is not declared in the style attribute", async (t) => {
  const document = h.document([
    <div style={{ color: "red" }}>Hello World</div>,
  ]);

  t.deepEqual(await evaluate(R93, { document }), [inapplicable(R93)]);
});

test("evaluate() is inapplicable on non important style", async (t) => {
  const document = h.document([
    <div style={{ lineHeight: "0.1em" }}>Hello World</div>,
  ]);

  t.deepEqual(await evaluate(R93, { document }), [inapplicable(R93)]);
});

test("evaluate() is inapplicable on important cascaded styles", async (t) => {
  const document = h.document(
    [<div style={{ lineHeight: "0.15em" }}>Hello World</div>],
    [h.sheet([h.rule.style("div", { lineHeight: "0.1em !important" })])]
  );

  t.deepEqual(await evaluate(R93, { document }), [inapplicable(R93)]);
});
