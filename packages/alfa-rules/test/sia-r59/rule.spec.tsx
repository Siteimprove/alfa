import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R59, { Outcomes } from "../../src/sia-r59/rule";

import { evaluate } from "../common/evaluate";
import { failed, inapplicable, passed } from "../common/outcome";

test("evaluate() passes a document with implicit heading", async (t) => {
  const document = h.document([
    <html>
      <h2>Heading</h2>
    </html>,
  ]);

  t.deepEqual(await evaluate(R59, { document }), [
    passed(R59, document, { 1: Outcomes.HasOneHeading }),
  ]);
});

test("evaluate() passes a document with explicit heading", async (t) => {
  const document = h.document([
    <html>
      <div role="heading">Heading</div>
    </html>,
  ]);

  t.deepEqual(await evaluate(R59, { document }), [
    passed(R59, document, { 1: Outcomes.HasOneHeading }),
  ]);
});

test("evaluate() fails a document without heading", async (t) => {
  const document = h.document([
    <html>
      <div>Not heading</div>
    </html>,
  ]);

  t.deepEqual(await evaluate(R59, { document }), [
    failed(R59, document, { 1: Outcomes.HasNoHeadings }),
  ]);
});

test("evaluate() is inapplicable to SVG", async (t) => {
  const document = h.document([
    <svg>
      <text>Heading</text>
    </svg>,
  ]);

  t.deepEqual(await evaluate(R59, { document }), [inapplicable(R59)]);
});
