import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R74, { Outcomes } from "../../dist/sia-r74/rule.js";

import { evaluate } from "../common/evaluate.js";
import { failed, inapplicable, passed } from "../common/outcome.js";

test(`evaluate() passes a paragraph with a font size specified using a relative
      length`, async (t) => {
  const target = <p style={{ fontSize: "1em" }}>Hello world</p>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R74, { document }), [
    passed(R74, target, {
      1: Outcomes.HasRelativeUnit,
    }),
  ]);
});

test("evaluate() passes a paragraph with a font size specified using an absolute-size keyword", async (t) => {
  const target = <p style={{ fontSize: "large" }}>Hello world</p>;
  const document = h.document([target]);

  t.deepEqual(await evaluate(R74, { document }), [
    passed(R74, target, { 1: Outcomes.HasRelativeUnit }),
  ]);
});

test("evaluate() passes a paragraph with a font size specified using an relative-size keyword", async (t) => {
  const target = <p style={{ fontSize: "larger" }}>Hello world</p>;
  const document = h.document([target]);

  t.deepEqual(await evaluate(R74, { document }), [
    passed(R74, target, { 1: Outcomes.HasRelativeUnit }),
  ]);
});

test(`evaluate() fails a paragraph with a font size specified using an absolute
      length`, async (t) => {
  const target = <p style={{ fontSize: "16px" }}>Hello world</p>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R74, { document }), [
    failed(R74, target, {
      1: Outcomes.HasAbsoluteUnit,
    }),
  ]);
});

test("evaluate() is inapplicable to a paragraph that has no text", async (t) => {
  const document = h.document([<p style={{ fontSize: "16px" }} />]);

  t.deepEqual(await evaluate(R74, { document }), [inapplicable(R74)]);
});

test("evaluate() is inapplicable to a paragraph that has only whitespace text", async (t) => {
  const document = h.document([<p style={{ fontSize: "16px" }}> </p>]);

  t.deepEqual(await evaluate(R74, { document }), [inapplicable(R74)]);
});

test("evaluate() is inapplicable to a paragraph that isn't visible", async (t) => {
  const document = h.document([
    <p style={{ fontSize: "16px" }} hidden>
      Hello world
    </p>,
  ]);

  t.deepEqual(await evaluate(R74, { document }), [inapplicable(R74)]);
});

test(`evaluate() fails an ARIA paragraph with a font size specified using an absolute
      length`, async (t) => {
  const target = (
    <div role="paragraph" style={{ fontSize: "16px" }}>
      Hello world
    </div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R74, { document }), [
    failed(R74, target, {
      1: Outcomes.HasAbsoluteUnit,
    }),
  ]);
});

test(`evaluate() ignores <p> element whose role is changed`, async (t) => {
  const target = (
    <p role="generic" style={{ fontSize: "16px" }}>
      Hello world
    </p>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R74, { document }), [inapplicable(R74)]);
});
