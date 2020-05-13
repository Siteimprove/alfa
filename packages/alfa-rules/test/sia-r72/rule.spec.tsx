import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document, Element } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";

import R72, { Outcomes } from "../../src/sia-r72/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

const { and } = Predicate;
const { isElement, hasName } = Element;

test("evaluate() passes a paragraph whose text is not uppercased", async (t) => {
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

  t.deepEqual(await evaluate(R72, { document }), [
    passed(R72, target, {
      1: Outcomes.IsNotUppercased,
    }),
  ]);
});

test("evaluate() fails a paragraph whose text is uppercased", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <html>
        <p style="text-transform: uppercase">Hello world</p>
      </html>,
      Option.of(self)
    ),
  ]);

  const target = document
    .descendants()
    .find(and(isElement, hasName("p")))
    .get();

  t.deepEqual(await evaluate(R72, { document }), [
    failed(R72, target, {
      1: Outcomes.IsUppercased,
    }),
  ]);
});

test("evaluate() fails a paragraph whose text is uppercased by inheritance", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <html style="text-transform: uppercase">
        <p>Hello world</p>
      </html>,
      Option.of(self)
    ),
  ]);

  const target = document
    .descendants()
    .find(and(isElement, hasName("p")))
    .get();

  t.deepEqual(await evaluate(R72, { document }), [
    failed(R72, target, {
      1: Outcomes.IsUppercased,
    }),
  ]);
});

test("evaluate() is inapplicable to a paragraph with just a single whitespace", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <html>
        <p> </p>
      </html>,
      Option.of(self)
    ),
  ]);

  t.deepEqual(await evaluate(R72, { document }), [inapplicable(R72)]);
});
