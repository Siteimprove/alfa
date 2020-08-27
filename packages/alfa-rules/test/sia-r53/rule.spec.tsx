import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document, Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import R53, { Outcomes } from "../../src/sia-r53/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

const { and } = Predicate;
const { isElement, hasName } = Element;

test("evaluate() passes when the document headings are structured", async (t) => {
  const document = Document.of([
    <html>
      <h1>Part one</h1>
      <h2>Chapter one</h2>
      <h3>Section one</h3>
    </html>,
  ]);

  const [, h2, h3] = document
    .descendants()
    .filter(and(isElement, hasName("h1", "h2", "h3")));

  t.deepEqual(await evaluate(R53, { document }), [
    passed(R53, h2, {
      1: Outcomes.IsStructured,
    }),
    passed(R53, h3, {
      1: Outcomes.IsStructured,
    }),
  ]);
});

test("evaluate() fails when the document headings are not properly structured", async (t) => {
  const document = Document.of([
    <html>
      <h1>Part one</h1>
      <h3>Chapter one</h3>
      <h2>Part two</h2>
      <h6>Chapter one</h6>
    </html>,
  ]);

  const [, h3, h2, h6] = document
    .descendants()
    .filter(and(isElement, hasName("h1", "h2", "h3", "h6")));

  t.deepEqual(await evaluate(R53, { document }), [
    failed(R53, h3, {
      1: Outcomes.IsNotStructured,
    }),
    passed(R53, h2, {
      1: Outcomes.IsStructured,
    }),
    failed(R53, h6, {
      1: Outcomes.IsNotStructured,
    }),
  ]);
});

test("evaluate() is inapplicable when the document has only one heading", async (t) => {
  const document = Document.of([
    <html>
      <h1>Lone heading</h1>
    </html>,
  ]);

  t.deepEqual(await evaluate(R53, { document }), [inapplicable(R53)]);
});
