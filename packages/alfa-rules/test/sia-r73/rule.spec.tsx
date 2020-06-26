import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document, Element } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";

import R73, { Outcomes } from "../../src/sia-r73/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed } from "../common/outcome";

const { and } = Predicate;
const { isElement, hasName } = Element;

test("evaluate() passes a paragraph whose line height is at least 1.5", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <html>
        <p style={{ lineHeight: "1.5" }}>Hello world</p>
      </html>,
      Option.of(self)
    ),
  ]);

  const target = document
    .descendants()
    .find(and(isElement, hasName("p")))
    .get();

  t.deepEqual(await evaluate(R73, { document }), [
    passed(R73, target, {
      1: Outcomes.IsSufficient,
    }),
  ]);
});

test(`evaluate() passes a paragraph whose line height is at least 1.5 times the
      font size`, async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <html>
        <p style={{ fontSize: "16px", lineHeight: "24px" }}>Hello world</p>
      </html>,
      Option.of(self)
    ),
  ]);

  const target = document
    .descendants()
    .find(and(isElement, hasName("p")))
    .get();

  t.deepEqual(await evaluate(R73, { document }), [
    passed(R73, target, {
      1: Outcomes.IsSufficient,
    }),
  ]);
});

test("evaluate() fails a paragraph whose line height is less than 1.5", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <html>
        <p style={{ lineHeight: "1.2" }}>Hello world</p>
      </html>,
      Option.of(self)
    ),
  ]);

  const target = document
    .descendants()
    .find(and(isElement, hasName("p")))
    .get();

  t.deepEqual(await evaluate(R73, { document }), [
    failed(R73, target, {
      1: Outcomes.IsInsufficient,
    }),
  ]);
});

test(`evaluate() fails a paragraph whose line height is less than 1.5 times the
      font size`, async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <html>
        <p style={{ fontSize: "16px", lineHeight: "22px" }}>Hello world</p>
      </html>,
      Option.of(self)
    ),
  ]);

  const target = document
    .descendants()
    .find(and(isElement, hasName("p")))
    .get();

  t.deepEqual(await evaluate(R73, { document }), [
    failed(R73, target, {
      1: Outcomes.IsInsufficient,
    }),
  ]);
});

test(`evaluate() fails a paragraph whose line height is "normal"`, async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <html>
        <p style={{ lineHeight: "normal" }}>Hello world</p>
      </html>,
      Option.of(self)
    ),
  ]);

  const target = document
    .descendants()
    .find(and(isElement, hasName("p")))
    .get();

  t.deepEqual(await evaluate(R73, { document }), [
    failed(R73, target, {
      1: Outcomes.IsNormal,
    }),
  ]);
});

test("evaluate() fails a paragraph that relies on the default line height", async (t) => {
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

  t.deepEqual(await evaluate(R73, { document }), [
    failed(R73, target, {
      1: Outcomes.IsNormal,
    }),
  ]);
});
