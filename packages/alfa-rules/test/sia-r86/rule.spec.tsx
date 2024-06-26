import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R86, { Outcomes } from "../../dist/sia-r86/rule.js";

import { evaluate } from "../common/evaluate.js";
import { passed, failed, inapplicable } from "../common/outcome.js";

test(`evaluate() passes an <img> element that is marked as decorative and not
      included in the accessibility tree`, async (t) => {
  const target = <img src="foo.jpg" alt="" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R86, { document }), [
    passed(R86, target, {
      1: Outcomes.IsNotExposed,
    }),
  ]);
});

test(`evaluate() fails an <img> element that is marked as decorative but is
      still included in the accessiblity tree`, async (t) => {
  const target = <img src="foo.jpg" alt="" aria-label="Foo" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R86, { document }), [
    failed(R86, target, {
      1: Outcomes.IsExposed,
    }),
  ]);
});

test("evaluate() is inapplicabale to an <img> that is not marked as decorative", async (t) => {
  const document = h.document([<img src="foo.jpg" />]);

  t.deepEqual(await evaluate(R86, { document }), [inapplicable(R86)]);
});
