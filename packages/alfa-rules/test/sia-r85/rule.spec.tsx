import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document, Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import R85, { Outcomes } from "../../src/sia-r85/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

const { and } = Predicate;
const { isElement, hasName } = Element;

test("evaluate() passes a paragraph whose text is not italic", async (t) => {
  const document = Document.of([
    <html>
      <p>Hello world</p>
    </html>,
  ]);

  const target = document
    .descendants()
    .find(and(isElement, hasName("p")))
    .get();

  t.deepEqual(await evaluate(R85, { document }), [
    passed(R85, target, {
      1: Outcomes.IsNotItalic,
    }),
  ]);
});

test("evaluate() fails a paragraph whose text is italic", async (t) => {
  const document = Document.of([
    <html>
      <p style={{ fontStyle: "italic" }}>Hello world</p>
    </html>,
  ]);

  const target = document
    .descendants()
    .find(and(isElement, hasName("p")))
    .get();

  t.deepEqual(await evaluate(R85, { document }), [
    failed(R85, target, {
      1: Outcomes.IsItalic,
    }),
  ]);
});

test("evaluate() fails a paragraph whose text is italic by inheritance", async (t) => {
  const document = Document.of([
    <html style={{ fontStyle: "italic" }}>
      <p>Hello world</p>
    </html>,
  ]);

  const target = document
    .descendants()
    .find(and(isElement, hasName("p")))
    .get();

  t.deepEqual(await evaluate(R85, { document }), [
    failed(R85, target, {
      1: Outcomes.IsItalic,
    }),
  ]);
});
