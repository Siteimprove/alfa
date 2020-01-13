import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document, Element } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";

import R1, { Outcomes } from "../../src/sia-r1/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes a document that that a non-empty <title> element", async t => {
  const document = Document.of(self => [
    Element.fromElement(
      <html>
        <head>
          <title>Hello world</title>
        </head>
      </html>,
      Option.of(self)
    )
  ]);

  t.deepEqual(await evaluate(R1, { document }), [
    passed(R1, document, [
      ["1", Outcomes.HasTitle],
      ["2", Outcomes.HasNonEmptyTitle]
    ])
  ]);
});

test("evaluate() fails a document that has no <title> element", async t => {
  const document = Document.of(self => [
    Element.fromElement(<html></html>, Option.of(self))
  ]);

  t.deepEqual(await evaluate(R1, { document }), [
    failed(R1, document, [
      ["1", Outcomes.HasNoTitle],
      ["2", Outcomes.HasEmptyTitle]
    ])
  ]);
});

test("evaluate() fails a document that has an empty <title> element", async t => {
  const document = Document.of(self => [
    Element.fromElement(
      <html>
        <head>
          <title></title>
        </head>
      </html>,
      Option.of(self)
    )
  ]);

  t.deepEqual(await evaluate(R1, { document }), [
    failed(R1, document, [
      ["1", Outcomes.HasTitle],
      ["2", Outcomes.HasEmptyTitle]
    ])
  ]);
});

test("evaluate() is inapplicable when a document is not an HTML document", async t => {
  const document = Document.of();

  t.deepEqual(await evaluate(R1, { document }), [inapplicable(R1)]);
});
