import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R4, { Outcomes } from "../../dist/sia-r4/rule.js";

import { evaluate } from "../common/evaluate.js";
import { passed, failed, inapplicable } from "../common/outcome.js";

test(`evaluate() passes an html element with lang attribute which has a
     non-empty ("") value`, async (t) => {
  const target = <html lang="en"></html>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R4, { document }), [
    passed(R4, target, {
      1: Outcomes.HasLanguage,
    }),
  ]);
});

test(`evaluate() fails an html element with no lang attribute.`, async (t) => {
  const target = <html></html>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R4, { document }), [
    failed(R4, target, {
      1: Outcomes.HasNoLanguage,
    }),
  ]);
});

test(`evaluate() fails an html element with lang attribute whose value is
     only ASCII whitespace`, async (t) => {
  const target = <html lang=" "></html>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R4, { document }), [
    failed(R4, target, {
      1: Outcomes.HasNoLanguage,
    }),
  ]);
});

test(`evaluate() fails an html element with only an xml:lang attribute.`, async (t) => {
  const attribute = h.attribute("xml:lang", "en");
  const target = h.element("html", [attribute]);

  const document = h.document([target]);

  t.deepEqual(await evaluate(R4, { document }), [
    failed(R4, target, {
      1: Outcomes.HasNoLanguage,
    }),
  ]);
});

test(`evaluate() is inapplicable to svg element.`, async (t) => {
  const target = <svg xmlns="http://www.w3.org/2000/svg"></svg>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R4, { document }), [inapplicable(R4)]);
});
