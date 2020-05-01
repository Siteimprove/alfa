import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document, Element } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";

import R64, { Outcomes } from "../../src/sia-r64/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes a heading that has an accessible name", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(<h1>Hello world</h1>, Option.of(self)),
  ]);

  const heading = document
    .descendants()
    .filter(Element.isElement)
    .first()
    .get();

  t.deepEqual(await evaluate(R64, { document }), [
    passed(R64, heading, { 1: Outcomes.HasAccessibleName }),
  ]);
});

test("evaluate() fails a heading that has no accessible name", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(<h1></h1>, Option.of(self)),
  ]);

  const heading = document
    .descendants()
    .filter(Element.isElement)
    .first()
    .get();

  t.deepEqual(await evaluate(R64, { document }), [
    failed(R64, heading, { 1: Outcomes.HasNoAccessibleName }),
  ]);
});

test("evaluate() is not applicable when a document has no headings", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(<p>Hello world</p>, Option.of(self)),
  ]);

  t.deepEqual(await evaluate(R64, { document }), [inapplicable(R64)]);
});
