import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document, Element } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";

import R21, { Outcomes } from "../../src/sia-r21/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

const { isElement } = Element;

test("evaluates() passes when element has correct explicit role", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(<div role="button">Button</div>, Option.of(self)),
  ]);

  const target = document
    .children()
    .find(isElement)
    .get()
    .attribute("role")
    .get();

  t.deepEqual(await evaluate(R21, { document }), [
    passed(R21, target, {
      1: Outcomes.HasValidRole,
    }),
  ]);
});

test("evaluates() passes when element has correct implicit role", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(<button role="btn">Button</button>, Option.of(self)),
  ]);

  const target = document
    .children()
    .find(isElement)
    .get()
    .attribute("role")
    .get();

  t.deepEqual(await evaluate(R21, { document }), [
    passed(R21, target, {
      1: Outcomes.HasValidRole,
    }),
  ]);
});

test("evaluates() fails when element has no role", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(<div role="btn">Button</div>, Option.of(self)),
  ]);

  const target = document
    .children()
    .find(isElement)
    .get()
    .attribute("role")
    .get();

  t.deepEqual(await evaluate(R21, { document }), [
    failed(R21, target, {
      1: Outcomes.HasNoValidRole,
    }),
  ]);
});

test("evaluate() is inapplicable when there is no role attribute", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(<button>Button</button>, Option.of(self)),
  ]);

  t.deepEqual(await evaluate(R21, { document }), [inapplicable(R21)]);
});

test("evaluate() is inapplicable on role attribute that are only whitespace", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(<div role="   " />, Option.of(self)),
  ]);

  t.deepEqual(await evaluate(R21, { document }), [inapplicable(R21)]);
});
