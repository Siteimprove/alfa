import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document, Text } from "@siteimprove/alfa-dom";

import R57, { Outcomes } from "../../src/sia-r57/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

const { isText } = Text;

test("evaluate() passes a text node that is included in a landmark", async (t) => {
  const document = Document.of([
    <main>This text is included in a landmark</main>,
  ]);

  const text = document.descendants().find(isText).get();

  t.deepEqual(await evaluate(R57, { document }), [
    passed(R57, text, {
      1: Outcomes.IsIncludedInLandmark,
    }),
  ]);
});

test("evaluate() fails a text node that is not included in a landmark", async (t) => {
  const document = Document.of([
    <div>This text is not included in a landmark</div>,
  ]);

  const text = document.descendants().find(isText).get();

  t.deepEqual(await evaluate(R57, { document }), [
    failed(R57, text, {
      1: Outcomes.IsNotIncludedInLandmark,
    }),
  ]);
});

test("evaluate() is not applicable to text nodes not in the accessibility tree", async (t) => {
  const document = Document.of([
    <div hidden>This text is not in the accessibility tree</div>,
  ]);

  t.deepEqual(await evaluate(R57, { document }), [inapplicable(R57)]);
});

test("evaluate() is not applicable to empty text nodes", async (t) => {
  const document = Document.of([
    <div></div>
  ]);

  t.deepEqual(await evaluate(R57, { document }), [inapplicable(R57)]);
});

test("evaluate() is not applicable to whitespace only text nodes", async (t) => {
  // space, non breaking space
  const document = Document.of([
    <div>  </div>
  ]);

  t.deepEqual(await evaluate(R57, { document }), [inapplicable(R57)]);
});

test("evaluate() is not applicable to descendant of iframe", async (t) => {
  const document = Document.of([
    <iframe ><span>Hello</span> world</iframe>
  ]);

  t.deepEqual(await evaluate(R57, { document }), [inapplicable(R57)]);
});
