import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document, Namespace } from "@siteimprove/alfa-dom";

import R67, { Outcomes } from "../../src/sia-r67/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test(`evaluate() passes an <img> element that is marked as decorative and not
      included in the accessibility tree`, async (t) => {
  const target = <img src="foo.jpg" alt="" />;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R67, { document }), [
    passed(R67, target, {
      1: Outcomes.IsNotExposed,
    }),
  ]);
});

test(`evaluate() passes an <svg> element that is marked as decorative and not
      included in the accessibility tree`, async (t) => {
  const target = <svg xmlns={Namespace.SVG} role="presentation" />;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R67, { document }), [
    passed(R67, target, {
      1: Outcomes.IsNotExposed,
    }),
  ]);
});

test(`evaluate() fails an <img> element that is marked as decorative but is
      still included in the accessiblity tree`, async (t) => {
  const target = <img src="foo.jpg" alt="" aria-label="Foo" />;

  const document = Document.of([target]);

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

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R67, { document }), [
    failed(R67, target, {
      1: Outcomes.IsExposed,
    }),
  ]);
});

test("evaluate() is inapplicabale to an <img> that is not marked as decorative", async (t) => {
  const document = Document.of([<img src="foo.jpg" />]);

  t.deepEqual(await evaluate(R67, { document }), [inapplicable(R67)]);
});

test("evaluate() is inapplicabale to an <img> that is not marked as decorative", async (t) => {
  const document = Document.of([<img src="foo.jpg" />]);

  t.deepEqual(await evaluate(R67, { document }), [inapplicable(R67)]);
});

test(`evaluate() is inapplicable to an <span> element that is marked as
      decorative`, async (t) => {
  const document = Document.of([<span role="presentation" />]);

  t.deepEqual(await evaluate(R67, { document }), [inapplicable(R67)]);
});
