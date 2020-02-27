import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document, Element } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";

import R2, { Outcomes } from "../../src/sia-r2/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes an image with an accessible name", async t => {
  const document = Document.of(self => [
    Element.fromElement(<img alt="Hello world"></img>, Option.of(self))
  ]);

  const img = document
    .children()
    .filter(Element.isElement)
    .first()
    .get();

  t.deepEqual(await evaluate(R2, { document }), [
    passed(R2, img, [["1", Outcomes.HasAccessibleName]])
  ]);
});

test("evaluate() fails an image that has no accessible name", async t => {
  const document = Document.of(self => [
    Element.fromElement(<img></img>, Option.of(self))
  ]);

  const img = document
    .children()
    .filter(Element.isElement)
    .first()
    .get();

  t.deepEqual(await evaluate(R2, { document }), [
    failed(R2, img, [["1", Outcomes.HasNoAccessibleName]])
  ]);
});

test("evaluate() is inapplicable when a document has no images", async t => {
  const document = Document.empty();

  t.deepEqual(await evaluate(R2, { document }), [inapplicable(R2)]);
});

test("evaluate() is inapplicable to an image that is marked as decorative", async t => {
  const document = Document.of(self => [
    Element.fromElement(<img role="none"></img>, Option.of(self))
  ]);

  const img = document
    .children()
    .filter(Element.isElement)
    .first()
    .get();

  t.deepEqual(await evaluate(R2, { document }), [inapplicable(R2)]);
});

test("evaluate() is inapplicable to an image that is hidden", async t => {
  const document = Document.of(self => [
    Element.fromElement(<img hidden alt="Hello world"></img>, Option.of(self))
  ]);

  const img = document
    .children()
    .filter(Element.isElement)
    .first()
    .get();

  t.deepEqual(await evaluate(R2, { document }), [inapplicable(R2)]);
});
