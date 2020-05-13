import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document, Element } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";

import R80, { Outcomes } from "../../src/sia-r80/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

const { isElement } = Element;

test(`evaluate() passes an element with a line height specified using a relative
      length`, async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <html style="line-height: 1.5em">Hello world</html>,
      Option.of(self)
    ),
  ]);

  const target = document.children().find(isElement).get();

  t.deepEqual(await evaluate(R80, { document }), [
    passed(R80, target, {
      1: Outcomes.HasRelativeUnit,
    }),
  ]);
});

test(`evaluate() fails an element with a line height specified using an absolute
      length`, async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <html style="line-height: 24px">Hello world</html>,
      Option.of(self)
    ),
  ]);

  const target = document.children().find(isElement).get();

  t.deepEqual(await evaluate(R80, { document }), [
    failed(R80, target, {
      1: Outcomes.HasAbsoluteUnit,
    }),
  ]);
});

test("evaluate() is inapplicable to an element that has no text", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <html style="line-height: 24px"></html>,
      Option.of(self)
    ),
  ]);

  t.deepEqual(await evaluate(R80, { document }), [inapplicable(R80)]);
});

test("evaluate() is inapplicable to an element that isn't visible", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <html style="line-height: 24px" hidden>
        Hello world
      </html>,
      Option.of(self)
    ),
  ]);

  t.deepEqual(await evaluate(R80, { document }), [inapplicable(R80)]);
});
