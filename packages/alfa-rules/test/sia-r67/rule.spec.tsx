import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { Namespace } from "@siteimprove/alfa-dom";

import R67, { Outcomes } from "../../dist/sia-r67/rule.js";

import { evaluate } from "../common/evaluate.js";
import { passed, failed, inapplicable } from "../common/outcome.js";

test(`evaluate() passes an <img> element that is marked as decorative and not
      included in the accessibility tree`, async (t) => {
  const target = <img src="foo.jpg" alt="" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R67, { document }), [
    passed(R67, target, {
      1: Outcomes.IsNotExposed,
    }),
  ]);
});

test(`evaluate() passes an <svg> element that is marked as decorative and not
      included in the accessibility tree`, async (t) => {
  const target = <svg xmlns={Namespace.SVG} role="presentation" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R67, { document }), [
    passed(R67, target, {
      1: Outcomes.IsNotExposed,
    }),
  ]);
});

test(`evaluate() fails an <img> element that is marked as decorative but is
      still included in the accessiblity tree`, async (t) => {
  const target = <img src="foo.jpg" alt="" aria-label="Foo" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R67, { document }), [
    failed(R67, target, {
      1: Outcomes.IsExposed,
    }),
  ]);
});

test(`evaluate() fails an <svg> element that is marked as decorative but is
      still included in the accessiblity tree`, async (t) => {
  const target = (
    <svg xmlns={Namespace.SVG} role="presentation" aria-label="Foo" />
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R67, { document }), [
    failed(R67, target, {
      1: Outcomes.IsExposed,
    }),
  ]);
});

test("evaluate() is inapplicabale to an <img> that is not marked as decorative", async (t) => {
  const document = h.document([<img src="foo.jpg" />]);

  t.deepEqual(await evaluate(R67, { document }), [inapplicable(R67)]);
});

test("evaluate() is inapplicabale to an <img> that is not marked as decorative", async (t) => {
  const document = h.document([<img src="foo.jpg" />]);

  t.deepEqual(await evaluate(R67, { document }), [inapplicable(R67)]);
});

test(`evaluate() is inapplicable to an <span> element that is marked as
      decorative`, async (t) => {
  const document = h.document([<span role="presentation" />]);

  t.deepEqual(await evaluate(R67, { document }), [inapplicable(R67)]);
});
