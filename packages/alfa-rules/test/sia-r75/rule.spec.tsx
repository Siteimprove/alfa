import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R75, { Outcomes } from "../../src/sia-r75/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed } from "../common/outcome";

test("evaluate() passes an element with a font size not smaller than 9 pixels", async (t) => {
  const target = <html style={{ fontSize: "medium" }}>Hello world</html>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R75, { document }), [
    passed(R75, target, {
      1: Outcomes.IsSufficient,
    }),
  ]);
});

test("evaluate() fails an element with a font size smaller than 9 pixels", async (t) => {
  const target = <div style={{ fontSize: "8px" }}>Hello world</div>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R75, { document }), [
    failed(R75, target, {
      1: Outcomes.IsInsufficient,
    }),
  ]);
});

test(`evaluate() fails an element with an accumulated font size smaller than 9
      pixels`, async (t) => {
  const target1 = <p style={{ fontSize: "smaller" }}>Hello world</p>;
  const target2 = <div style={{ fontSize: "10px" }}>{target1}</div>;

  const document = Document.of([target2]);

  t.deepEqual(await evaluate(R75, { document }), [
    passed(R75, target2, {
      1: Outcomes.IsSufficient,
    }),
    failed(R75, target1, {
      1: Outcomes.IsInsufficient,
    }),
  ]);
});
