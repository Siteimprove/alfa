import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R28, { Outcomes } from "../../src/sia-r28/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test(`evaluate() passes an <input> element with \`image\` type and with an accessible name through the \`alt\` attribute`, async (t) => {
  const target = <input type="image" alt="Submit" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R28, { document }), [
    passed(R28, target, {
      1: Outcomes.HasAccessibleName,
    }),
  ]);
});

test(`evaluate() passes an <input> element with \`image\` type and with an accessible name through the \`aria-label\` attribute`, async (t) => {
  const target = <input type="image" aria-label="Submit" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R28, { document }), [
    passed(R28, target, {
      1: Outcomes.HasAccessibleName,
    }),
  ]);
});

test(`evaluate() passes an <input> element with \`image\` type and with an accessible name through the \`aria-labelledby\` attribute`, async (t) => {
  const target = <input type="image" aria-labelledby="id" />;

  const label = <div id="id">Submit</div>;

  const document = h.document([label, target]);

  t.deepEqual(await evaluate(R28, { document }), [
    passed(R28, target, {
      1: Outcomes.HasAccessibleName,
    }),
  ]);
});

test(`evaluate() fails an <input> element with \`image\` type and with incorrectly set \`aria-labelledby\` attribute`, async (t) => {
  const target = <input type="image" aria-labelledby="id" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R28, { document }), [
    failed(R28, target, {
      1: Outcomes.HasNoAccessibleName,
    }),
  ]);
});

test(`evaluate() fails an <input> element with \`image\` type without an accessible name`, async (t) => {
  const target = <input type="image" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R28, { document }), [
    failed(R28, target, {
      1: Outcomes.HasNoAccessibleName,
    }),
  ]);
});

test(`evaluate() fails an <input> element with \`image\` type with an empty \`alt\` attribute`, async (t) => {
  const target = <input type="image" name="Submit" alt="" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R28, { document }), [
    failed(R28, target, {
      1: Outcomes.HasNoAccessibleName,
    }),
  ]);
});

test(`evaluate() is inapplicable for an <input> element with \`image\` type that is not in the accessibility tree`, async (t) => {
  const target = <input type="image" style={{ display: "none" }} />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R28, { document }), [inapplicable(R28)]);
});
