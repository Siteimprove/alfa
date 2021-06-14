import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R54, { Outcomes } from "../../src/sia-r54/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes an <img> element with aria-live and aria-atomic ", async (t) => {
  const target = <img aria-live="assertive" aria-atomic="true" />;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R54, { document }), [
    passed(R54, target, {
      1: Outcomes.IsAssertive,
    }),
  ]);
});

test("evaluate() fails an <img> element because it's missing an aria-atomic attribute", async (t) => {
  const target = <img aria-live="assertive" />;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R54, { document }), [
    failed(R54, target, {
      1: Outcomes.IsNotAssertive,
    }),
  ]);
});

test("evaluate() fails an <img> element because it has an incorrect aria-atomic attribute", async (t) => {
  const target = <img aria-live="assertive" aria-atomic="wrong" />;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R54, { document }), [
    failed(R54, target, {
      1: Outcomes.IsNotAssertive,
    }),
  ]);
});

//how to fail the condition on the accessibility tree?

test("evaluate() inapplicable to an <img> element because it's has an incorrect aria-live attribute", async (t) => {
  const target = <img aria-live="wrong" aria-atomic="true" />;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R54, { document }), [inapplicable(R54)]);
});

test("evaluate() is inapplicable to an <img> element with an empty aria-live attribute ", async (t) => {
  const target = <img aria-live="" />;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R54, { document }), [inapplicable(R54)]);
});

test("evaluate() is inapplicable to an <img> element without an accessible name", async (t) => {
  const target = <img />;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R54, { document }), [inapplicable(R54)]);
});
