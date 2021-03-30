import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R74, { Outcomes } from "../../src/sia-r74/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test(`evaluate() passes a paragraph with a font size specified using a relative
      length`, async (t) => {
  const target = <p style={{ fontSize: "1em" }}>Hello world</p>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R74, { document }), [
    passed(R74, target, {
      1: Outcomes.HasRelativeUnit,
    }),
  ]);
});

test(`evaluate() fails a paragraph with a font size specified using an absolute
      length`, async (t) => {
  const target = <p style={{ fontSize: "16px" }}>Hello world</p>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R74, { document }), [
    failed(R74, target, {
      1: Outcomes.HasAbsoluteUnit,
    }),
  ]);
});

test("evaluate() is inapplicable to a paragraph that has no text", async (t) => {
  const document = Document.of([<p style={{ fontSize: "16px" }} />]);

  t.deepEqual(await evaluate(R74, { document }), [inapplicable(R74)]);
});

test("evaluate() is inapplicable to a paragraph that isn't visible", async (t) => {
  const document = Document.of([
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

  const document = Document.of([target]);

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

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R74, { document }), [inapplicable(R74)]);
});
