import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R2, { Outcomes } from "../../src/sia-r2/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes an <img> element with an accessible name", async (t) => {
  const target = <img alt="Hello world" />;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R2, { document }), [
    passed(R2, target, {
      1: Outcomes.HasAccessibleName,
    }),
  ]);
});

test("evaluate() fails an <img> element without an accessible name", async (t) => {
  const target = <img />;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R2, { document }), [
    failed(R2, target, {
      1: Outcomes.HasNoAccessibleName,
    }),
  ]);
});

test("evaluate() is inapplicable to an <img> element with a presentational role", async (t) => {
  const document = Document.of([<img role="none"></img>]);

  t.deepEqual(await evaluate(R2, { document }), [inapplicable(R2)]);
});

test(`evaluate() is inapplicable to a non-draggable <img> element with a
      presentational role`, async (t) => {
  const document = Document.of([<img role="none" draggable="false"></img>]);

  t.deepEqual(await evaluate(R2, { document }), [inapplicable(R2)]);
});

test("evaluate() is inapplicable to an <img> element that is hidden", async (t) => {
  const document = Document.of([<img hidden alt="Hello world"></img>]);

  t.deepEqual(await evaluate(R2, { document }), [inapplicable(R2)]);
});

test("evaluate() is inapplicable to a document without images", async (t) => {
  const document = Document.empty();

  t.deepEqual(await evaluate(R2, { document }), [inapplicable(R2)]);
});
