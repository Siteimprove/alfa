import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R53, { Outcomes } from "../../src/sia-r53/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes when the document headings are structured", async (t) => {
  const target1 = <h2>Chapter one</h2>;
  const target2 = <h3>Section one</h3>;

  const document = Document.of([
    <html>
      <h1>Part one</h1>
      {target1}
      {target2}
    </html>,
  ]);

  t.deepEqual(await evaluate(R53, { document }), [
    passed(R53, target1, {
      1: Outcomes.IsStructured,
    }),
    passed(R53, target2, {
      1: Outcomes.IsStructured,
    }),
  ]);
});

test("evaluate() fails when the document headings are not properly structured", async (t) => {
  const target1 = <h3>Chapter one</h3>;
  const target2 = <h2>Part two</h2>;
  const target3 = <h6>Chapter one</h6>;

  const document = Document.of([
    <html>
      <h1>Part one</h1>
      {target1}
      {target2}
      {target3}
    </html>,
  ]);

  t.deepEqual(await evaluate(R53, { document }), [
    failed(R53, target1, {
      1: Outcomes.IsNotStructured,
    }),
    passed(R53, target2, {
      1: Outcomes.IsStructured,
    }),
    failed(R53, target3, {
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
