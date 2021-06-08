import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R20, { Outcomes } from "../../src/sia-r20/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test(`evaluate() passes an article with a valid aria-atomic attribute`, async (t) => {
  const target = (
    <article aria-atomic="true">
      This is a description of something cool...
    </article>
  );

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R20, { document }), [
    passed(R20, target.attribute("aria-atomic").get(), {
      1: Outcomes.IsDefined,
    }),
  ]);
});

test(`evaluate() passes a div element with a valid aria-modal attribute`, async (t) => {
  const target = <div aria-modal="true">Contains modal content...</div>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R20, { document }), [
    passed(R20, target.attribute("aria-modal").get(), {
      1: Outcomes.IsDefined,
    }),
  ]);
});

test(`evaluate() passes a div element with different valid aria-* attributes`, async (t) => {
  const target = (
    <div
      contenteditable="true"
      aria-multiline="true"
      aria-label="Enter your hobbies"
      aria-required="true"
    ></div>
  );

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R20, { document }), [
    passed(R20, target.attribute("aria-multiline").get(), {
      1: Outcomes.IsDefined,
    }),
    passed(R20, target.attribute("aria-label").get(), {
      1: Outcomes.IsDefined,
    }),
    passed(R20, target.attribute("aria-required").get(), {
      1: Outcomes.IsDefined,
    }),
  ]);
});

test(`evaluate() fails a div element which has a non official aria attribute`, async (t) => {
  const target = <div aria-not-checked="true">List Item</div>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R20, { document }), [
    failed(R20, target.attribute("aria-not-checked").get(), {
      1: Outcomes.IsNotDefined,
    }),
  ]);
});

test(`evaluate() is not applicable to a canvas element with no aria-* attribute`, async (t) => {
  const target = <canvas> </canvas>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R20, { document }), [inapplicable(R20)]);
});
