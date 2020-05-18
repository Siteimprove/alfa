import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document, Element } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";

import R75, { Outcomes } from "../../src/sia-r75/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

const { isElement, hasName } = Element;

test("evaluate() passes an element with a font size not smaller than 9 pixels", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <html style="font-size: medium">Hello world</html>,
      Option.of(self)
    ),
  ]);

  const target = document.children().find(isElement).get();

  t.deepEqual(await evaluate(R75, { document }), [
    passed(R75, target, {
      1: Outcomes.IsSufficient,
    }),
  ]);
});

test("evaluate() fails an element with a font size smaller than 9 pixels", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <html style="font-size: 8px">Hello world</html>,
      Option.of(self)
    ),
  ]);

  const target = document.children().find(isElement).get();

  t.deepEqual(await evaluate(R75, { document }), [
    failed(R75, target, {
      1: Outcomes.IsInsufficient,
    }),
  ]);
});

test(`evaluate() fails an element with an accumulated font size smaller than 9
      pixels`, async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <html style="font-size: 10px">
        <p style="font-size: smaller">Hello world</p>
      </html>,
      Option.of(self)
    ),
  ]);

  const [root, paragraph] = document.descendants().filter(isElement);

  t.deepEqual(await evaluate(R75, { document }), [
    passed(R75, root, {
      1: Outcomes.IsSufficient,
    }),
    failed(R75, paragraph, {
      1: Outcomes.IsInsufficient,
    }),
  ]);
});
