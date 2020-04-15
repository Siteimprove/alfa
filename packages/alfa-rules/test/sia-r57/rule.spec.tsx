import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document, Element, Text } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";

import R57, { Outcomes } from "../../src/sia-r57/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes a text node that is included in a landmark", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <main>This text is included in a landmark</main>,
      Option.of(self)
    ),
  ]);

  const text = document.descendants().filter(Text.isText).first().get();

  t.deepEqual(await evaluate(R57, { document }), [
    passed(R57, text, { 1: Outcomes.IsIncludedInLandmark }),
  ]);
});

test("evaluate() fails a text node that is not included in a landmark", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <div>This text is not included in a landmark</div>,
      Option.of(self)
    ),
  ]);

  const text = document.descendants().filter(Text.isText).first().get();

  t.deepEqual(await evaluate(R57, { document }), [
    failed(R57, text, { 1: Outcomes.IsNotIncludedInLandmark }),
  ]);
});

test("evaluate() is not applicable to text nodes not in the accessibility tree", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <div hidden>This text is not in the accessibility tree</div>,
      Option.of(self)
    ),
  ]);

  t.deepEqual(await evaluate(R57, { document }), [inapplicable(R57)]);
});
