import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R86, { Outcomes } from "../../src/sia-r86/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test(`evaluate() passes an <img> element that is marked as decorative and not
      included in the accessibility tree`, async (t) => {
  const target = <img src="foo.jpg" alt="" />;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R86, { document }), [
    passed(R86, target, {
      1: Outcomes.IsNotExposed,
    }),
  ]);
});

test(`evaluate() fails an <img> element that is marked as decorative but is
      still included in the accessiblity tree`, async (t) => {
  const target = <img src="foo.jpg" alt="" aria-label="Foo" />;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R86, { document }), [
    failed(R86, target, {
      1: Outcomes.IsExposed,
    }),
  ]);
});

test("evaluate() is inapplicabale to an <img> that is not marked as decorative", async (t) => {
  const document = Document.of([<img src="foo.jpg" />]);

  t.deepEqual(await evaluate(R86, { document }), [inapplicable(R86)]);
});
