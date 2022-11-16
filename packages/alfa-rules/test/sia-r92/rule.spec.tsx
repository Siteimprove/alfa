import { Length } from "@siteimprove/alfa-css";
import { h, Namespace } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R92 from "../../src/sia-r92/rule";
import { Outcomes } from "../../src/common/expectation/is-wide-enough";

import { evaluate } from "../common/evaluate";
import { failed, inapplicable, passed } from "../common/outcome";

test("evaluate() passes on large enough value", async (t) => {
  const declaration = h.declaration("word-spacing", "0.16em", true);
  const target = h.element(
    "div",
    [],
    [h.text("Hello World")],
    [declaration],
    Namespace.HTML
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R92, { document }), [
    passed(R92, target, {
      1: Outcomes.IsWideEnough(
        "word-spacing",
        Length.of(2.56, "px"),
        Length.of(16, "px"),
        0.16,
        0.16,
        declaration,
        target
      ),
    }),
  ]);
});

test(`evaluate() ignores elements whose \`word-spacing\` is never used`, async (t) => {
  const declaration = h.declaration("word-spacing", "3px", true);
  const target = h.element(
    "p",
    [],
    [h.text("Hello World")],
    [declaration],
    Namespace.HTML
  );

  const document = h.document([
    // word-spacing on the <div> is too small compared to the font-size,
    // but it affects no text since it is overwritten in the <p>.
    <div style={{ fontSize: "16px", wordSpacing: "1px !important" }}>
      {target}
    </div>,
  ]);

  t.deepEqual(await evaluate(R92, { document }), [
    passed(R92, target, {
      1: Outcomes.IsWideEnough(
        "word-spacing",
        Length.of(3, "px"),
        Length.of(16, "px"),
        0.1875,
        0.16,
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
    h.declaration("word-spacing", "1.6px", true),
  ];

  const div = h.element("div", [], [target], declarations, Namespace.HTML);
  const document = h.document([
    // word-spacing on the <div> is too small compared to the font-size,
    // but this font-size affects no text since it is overwritten in the <p>.
    div,
  ]);

  t.deepEqual(await evaluate(R92, { document }), [
    passed(R92, target, {
      1: Outcomes.IsWideEnough(
        "word-spacing",
        Length.of(1.6, "px"),
        Length.of(10, "px"),
        0.16,
        0.16,
        declarations[1],
        div
      ),
    }),
  ]);
});

test("evaluate() fails on important small values", async (t) => {
  const declaration = h.declaration("word-spacing", "0.1em", true);
  const target = h.element(
    "div",
    [],
    [h.text("Hello World")],
    [declaration],
    Namespace.HTML
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R92, { document }), [
    failed(R92, target, {
      1: Outcomes.IsNotWideEnough(
        "word-spacing",
        Length.of(1.6, "px"),
        Length.of(16, "px"),
        0.1,
        0.16,
        declaration,
        target
      ),
    }),
  ]);
});

test(`evaluate() is inapplicable to elements with no text`, async (t) => {
  const document = h.document([
    <div style={{ wordSpacing: "0px !important" }}>
      <img src="visible-div.png" />
    </div>,
  ]);

  t.deepEqual(await evaluate(R92, { document }), [inapplicable(R92)]);
});

test("evaluate() is inapplicable if word-spacing is not declared in the style attribute", async (t) => {
  const document = h.document([
    <div style={{ color: "red" }}>Hello World</div>,
  ]);

  t.deepEqual(await evaluate(R92, { document }), [inapplicable(R92)]);
});

test("evaluate() is inapplicable on non important style", async (t) => {
  const document = h.document([
    <div style={{ wordSpacing: "0.1em" }}>Hello World</div>,
  ]);

  t.deepEqual(await evaluate(R92, { document }), [inapplicable(R92)]);
});

test("evaluate() is inapplicable on important cascaded styles", async (t) => {
  const document = h.document(
    [<div style={{ wordSpacing: "0.18em" }}>Hello World</div>],
    [h.sheet([h.rule.style("div", { wordSpacing: "0.1em !important" })])]
  );

  t.deepEqual(await evaluate(R92, { document }), [inapplicable(R92)]);
});
