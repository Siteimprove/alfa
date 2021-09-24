import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R91, { Outcomes } from "../../src/sia-r91/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes on non important style", async (t) => {
  const target = <div style={{ letterSpacing: "0.1em" }}>Hello World</div>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R91, { document }), [
    passed(R91, target, {
      1: Outcomes.NotImportant,
    }),
  ]);
});

test("evaluate() passes on large enough value", async (t) => {
  const target = (
    <div style={{ letterSpacing: "0.12em !important" }}>Hello World</div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R91, { document }), [
    passed(R91, target, {
      1: Outcomes.WideEnough,
    }),
  ]);
});

test("evaluate() passes on important cascaded styles", async (t) => {
  const target = <div style={{ letterSpacing: "0.15em" }}>Hello World</div>;

  const document = h.document(
    [target],
    [h.sheet([h.rule.style("div", { letterSpacing: "0.1em !important" })])]
  );
  
  t.deepEqual(await evaluate(R91, { document }), [
    passed(R91, target, {
      1: Outcomes.WideEnough,
    }),
  ]);
});

test(`evaluate() passes elements whose \`letter-spacing\` is overriden`, async (t) => {
  const target1 = (
    <p style={{ letterSpacing: "2px !important" }}>Hello World</p>
  );
  const target2 = (
    <div style={{ fontSize: "16px", letterSpacing: "1.5px !important" }}>
      {target1}
    </div>
  );

  const document = h.document([target2]);
  
  t.deepEqual(await evaluate(R91, { document }), [
    passed(R91, target2, { 1: Outcomes.WideEnough }),
    passed(R91, target1, { 1: Outcomes.WideEnough }),
  ]);
});

test(`evaluate() passes elements whose \`font-size\` is overriden`, async (t) => {
  const target = (
    <div style={{ fontSize: "16px", letterSpacing: "1.5px !important" }}>
      <p style={{ fontSize: "10px" }}>Hello World</p>
    </div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R91, { document }), [
    passed(R91, target, { 1: Outcomes.WideEnough }),
  ]);
});

test(`evaluate() passes elements with no text`, async (t) => {
  const target = (
    <div style={{ letterSpacing: "0px !important" }}>
      <img src="visible-div.png" />
    </div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R91, { document }), [
    passed(R91, target, { 1: Outcomes.WideEnough }),
  ]);
});

test("evaluate() fails on important small values", async (t) => {
  const target = (
    <div style={{ letterSpacing: "0.1em !important" }}>Hello World</div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R91, { document }), [
    failed(R91, target, {
      1: Outcomes.Important,
    }),
  ]);
});

test("evaluate() is inapplicable if letter-spacing is not declared in the style", async (t) => {
  const document = h.document([
    <div style={{ color: "red" }}>Hello World</div>,
  ]);

  t.deepEqual(await evaluate(R91, { document }), [inapplicable(R91)]);
});



