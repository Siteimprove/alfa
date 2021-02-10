import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R85, { Outcomes } from "../../src/sia-r85/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed } from "../common/outcome";

test("evaluate() passes a paragraph whose text is not italic", async (t) => {
  const target = <p>Hello world</p>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R85, { document }), [
    passed(R85, target, {
      1: Outcomes.IsNotItalic,
    }),
  ]);
});

test("evaluate() fails a paragraph whose text is italic", async (t) => {
  const target = <p style={{ fontStyle: "italic" }}>Hello world</p>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R85, { document }), [
    failed(R85, target, {
      1: Outcomes.IsItalic,
    }),
  ]);
});

test("evaluate() fails a paragraph whose text is italic by inheritance", async (t) => {
  const target = <p>Hello world</p>;

  const document = Document.of([
    <div style={{ fontStyle: "italic" }}>{target}</div>,
  ]);

  t.deepEqual(await evaluate(R85, { document }), [
    failed(R85, target, {
      1: Outcomes.IsItalic,
    }),
  ]);
});
