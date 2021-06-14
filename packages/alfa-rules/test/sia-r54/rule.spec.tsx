import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R54, { Outcomes } from "../../src/sia-r54/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes <div> element with aria-live and aria-atomic ", async (t) => {
  const target = (
    <div aria-live="assertive" aria-atomic="true">
      Some words
    </div>
  );

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R54, { document }), [
    passed(R54, target, {
      1: Outcomes.IsAssertive,
    }),
  ]);
});

test("evaluate() fails an <div> element because it's missing an aria-atomic attribute", async (t) => {
  const target = <div aria-live="assertive"> Some words </div>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R54, { document }), [
    failed(R54, target, {
      1: Outcomes.IsNotAssertive,
    }),
  ]);
});

test("evaluate() fails an <div> element because it has an incorrect aria-atomic attribute", async (t) => {
  const target = (
    <div aria-live="assertive" aria-atomic="wrong">
      Some words
    </div>
  );

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R54, { document }), [
    failed(R54, target, {
      1: Outcomes.IsNotAssertive,
    }),
  ]);
});

test("evaluate() fails an <div> element because it has not an accessible tree", async (t) => {
  const target = (
    <div hidden aria-live="assertive" aria-atomic="true">
      Some words
    </div>
  );

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R54, { document }), [inapplicable(R54)]);
});

test("evaluate() inapplicable to a <div> element because it has an incorrect aria-live attribute", async (t) => {
  const target = (
    <div aria-live="wrong" aria-atomic="true">
      Some words
    </div>
  );

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R54, { document }), [inapplicable(R54)]);
});

test("evaluate() is inapplicable to an <img> element with an empty aria-live attribute ", async (t) => {
  const target = <div aria-live="">Some words</div>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R54, { document }), [inapplicable(R54)]);
});

test("evaluate() is inapplicable to an <img> element without an accessible name", async (t) => {
  const target = <div></div>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R54, { document }), [inapplicable(R54)]);
});
