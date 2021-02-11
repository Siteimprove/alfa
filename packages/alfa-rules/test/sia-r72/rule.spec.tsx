import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R72, { Outcomes } from "../../src/sia-r72/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed } from "../common/outcome";

test("evaluate() passes a paragraph whose text is not uppercased", async (t) => {
  const target = <p>Hello world</p>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R72, { document }), [
    passed(R72, target, {
      1: Outcomes.IsNotUppercased,
    }),
  ]);
});

test("evaluate() fails a paragraph whose text is uppercased", async (t) => {
  const target = <p style={{ textTransform: "uppercase" }}>Hello world</p>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R72, { document }), [
    failed(R72, target, {
      1: Outcomes.IsUppercased,
    }),
  ]);
});

test("evaluate() fails a paragraph whose text is uppercased by inheritance", async (t) => {
  const target = <p>Hello world</p>;

  const document = Document.of([
    <div style={{ textTransform: "uppercase" }}>{target}</div>,
  ]);

  t.deepEqual(await evaluate(R72, { document }), [
    failed(R72, target, {
      1: Outcomes.IsUppercased,
    }),
  ]);
});
