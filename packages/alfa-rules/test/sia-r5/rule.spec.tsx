import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R5, { Outcomes } from "../../src/sia-r5/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test(`evaluate() passes a lang attribute with valid primary tag`, async (t) => {
  const html = <html lang="en"></html>;

  const document = Document.of([html]);

  t.deepEqual(await evaluate(R5, { document }), [
    passed(R5, html.attribute("lang").get(), {
      1: Outcomes.HasValidLanguage,
    }),
  ]);
});

test(`evaluate() passes a lang attribute with valid primary tag and invalid region subtag`, async (t) => {
  const html = <html lang="en-US-GB"></html>;

  const document = Document.of([html]);

  t.deepEqual(await evaluate(R5, { document }), [
    passed(R5, html.attribute("lang").get(), {
      1: Outcomes.HasValidLanguage,
    }),
  ]);
});

test(`evaluate() fails a lang attribute with invalid primary tag.`, async (t) => {
  const html = <html lang="invalid"></html>;

  const document = Document.of([html]);

  t.deepEqual(await evaluate(R5, { document }), [
    failed(R5, html.attribute("lang").get(), {
      1: Outcomes.HasNoValidLanguage,
    }),
  ]);
});

test(`evaluate() is inapplicable to svg elements.`, async (t) => {
  const html = <svg xmlns="http://www.w3.org/2000/svg" lang="fr"></svg>;
  const document = Document.of([html]);

  t.deepEqual(await evaluate(R5, { document }), [inapplicable(R5)]);
});
