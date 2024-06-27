import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R53, { Outcomes } from "../../dist/sia-r53/rule.js";

import { evaluate } from "../common/evaluate.js";
import { passed, failed, inapplicable } from "../common/outcome.js";

test("evaluate() passes when the document headings are structured", async (t) => {
  const first = <h1>Part one</h1>;
  const target1 = <h2>Chapter one</h2>;
  const target2 = <h3>Section one</h3>;

  const document = h.document([
    <html>
      {first}
      {target1}
      {target2}
    </html>,
  ]);

  t.deepEqual(await evaluate(R53, { document }), [
    passed(R53, target1, {
      1: Outcomes.IsStructured(first, 2, 1),
    }),
    passed(R53, target2, {
      1: Outcomes.IsStructured(target1, 3, 2),
    }),
  ]);
});

test("evaluate() fails when the document headings are not properly structured", async (t) => {
  const first = <h1>Part one</h1>;
  const target1 = <h3>Chapter one</h3>;
  const target2 = <h2>Part two</h2>;
  const target3 = <h6>Chapter one</h6>;

  const document = h.document([
    <html>
      {first}
      {target1}
      {target2}
      {target3}
    </html>,
  ]);

  t.deepEqual(await evaluate(R53, { document }), [
    failed(R53, target1, {
      1: Outcomes.IsNotStructured(first, 3, 1),
    }),
    passed(R53, target2, {
      1: Outcomes.IsStructured(target1, 2, 3),
    }),
    failed(R53, target3, {
      1: Outcomes.IsNotStructured(target2, 6, 2),
    }),
  ]);
});

test("evaluate() is inapplicable when the document has only one heading", async (t) => {
  const document = h.document([
    <html>
      <h1>Lone heading</h1>
    </html>,
  ]);

  t.deepEqual(await evaluate(R53, { document }), [inapplicable(R53)]);
});

test("evaluate() ignore headings that are not exposed", async (t) => {
  const first = <h1>Part one</h1>;
  const target1 = <h2>Chapter one</h2>;
  const target2 = <h2>Chapter two</h2>;

  const document = h.document([
    <html>
      {first}
      <h3 hidden>I'm not here</h3>
      {target1}
      {target2}
    </html>,
  ]);

  t.deepEqual(await evaluate(R53, { document }), [
    passed(R53, target1, {
      1: Outcomes.IsStructured(first, 2, 1),
    }),
    passed(R53, target2, {
      1: Outcomes.IsStructured(target1, 2, 2),
    }),
  ]);
});
