import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document, Element } from "@siteimprove/alfa-dom";

import R75, { Outcomes } from "../../src/sia-r75/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed } from "../common/outcome";

const { isElement } = Element;

test("evaluate() passes an element with a font size not smaller than 9 pixels", async (t) => {
  const document = Document.of([
    <html style={{ fontSize: "medium" }}>Hello world</html>,
  ]);

  const target = document.children().find(isElement).get();

  t.deepEqual(await evaluate(R75, { document }), [
    passed(R75, target, {
      1: Outcomes.IsSufficient,
    }),
  ]);
});

test("evaluate() fails an element with a font size smaller than 9 pixels", async (t) => {
  const document = Document.of([
    <html style={{ fontSize: "8px" }}>Hello world</html>,
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
  const document = Document.of([
    <html style={{ fontSize: "10px" }}>
      <p style={{ fontSize: "smaller" }}>Hello world</p>
    </html>,
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
