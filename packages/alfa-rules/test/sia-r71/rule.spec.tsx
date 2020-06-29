import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document, Element } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";

import R71, { Outcomes } from "../../src/sia-r71/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

const { and } = Predicate;
const { isElement, hasName } = Element;

test("evaluate() passes a paragraph whose text is not justified", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <html>
        <p>Hello world</p>
      </html>,
      Option.of(self)
    ),
  ]);

  const target = document
    .descendants()
    .find(and(isElement, hasName("p")))
    .get();

  t.deepEqual(await evaluate(R71, { document }), [
    passed(R71, target, {
      1: Outcomes.IsNotJustified,
    }),
  ]);
});

test("evaluate() fails a paragraph whose text is justified", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <html>
        <p style={{ textAlign: "justify" }}>Hello world</p>
      </html>,
      Option.of(self)
    ),
  ]);

  const target = document
    .descendants()
    .find(and(isElement, hasName("p")))
    .get();

  t.deepEqual(await evaluate(R71, { document }), [
    failed(R71, target, {
      1: Outcomes.IsJustified,
    }),
  ]);
});

test("evaluate() fails a paragraph whose text is justified by inheritance", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <html style={{ textAlign: "justify" }}>
        <p>Hello world</p>
      </html>,
      Option.of(self)
    ),
  ]);

  const target = document
    .descendants()
    .find(and(isElement, hasName("p")))
    .get();

  t.deepEqual(await evaluate(R71, { document }), [
    failed(R71, target, {
      1: Outcomes.IsJustified,
    }),
  ]);
});
