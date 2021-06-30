import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R64, { Outcomes } from "../../src/sia-r64/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes a heading that has an accessible name", async (t) => {
  const target = <h1>Hello world</h1>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R64, { document }), [
    passed(R64, target, {
      1: Outcomes.HasAccessibleName,
    }),
  ]);
});

test("evaluate() fails a heading that has no accessible name", async (t) => {
  const target = <h1 />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R64, { document }), [
    failed(R64, target, {
      1: Outcomes.HasNoAccessibleName,
    }),
  ]);
});

test("evaluate() is not applicable when a document has no headings", async (t) => {
  const document = h.document([<p>Hello world</p>]);

  t.deepEqual(await evaluate(R64, { document }), [inapplicable(R64)]);
});

test("evaluate() fails a heading whose content is aria-hidden", async (t) => {
  const target = (
    <h1>
      <span aria-hidden="true">This is not exposed to AT</span>
    </h1>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R64, { document }), [
    failed(R64, target, {
      1: Outcomes.HasNoAccessibleName,
    }),
  ]);
});
