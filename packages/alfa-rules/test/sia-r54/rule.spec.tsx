import { test } from "@siteimprove/alfa-test";

import { h } from "@siteimprove/alfa-dom";

import R54, { Outcomes } from "../../dist/sia-r54/rule.js";

import { evaluate } from "../common/evaluate.js";
import { passed, failed, inapplicable } from "../common/outcome.js";

test("evaluate() passes an assertive and lower-cased atomic element", async (t) => {
  const target = (
    <div aria-live="assertive" aria-atomic="true">
      <span>Some words</span>
    </div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R54, { document }), [
    passed(R54, target, {
      1: Outcomes.IsAtomic,
    }),
  ]);
});

test("evaluate() passes an assertive and mixed-cased atomic element", async (t) => {
  const target = (
    <div aria-live="assertive" aria-atomic="TRUe">
      <span>Some words</span>
    </div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R54, { document }), [
    passed(R54, target, {
      1: Outcomes.IsAtomic,
    }),
  ]);
});
test("evaluate() fails an element which is assertive but not atomic", async (t) => {
  const target = (
    <div aria-live="assertive">
      <span>Some words</span>
    </div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R54, { document }), [
    failed(R54, target, {
      1: Outcomes.IsNotAtomic,
    }),
  ]);
});

test("evaluate() fails an assertive element with an incorrect aria-atomic attribute", async (t) => {
  const target = (
    <div aria-live="assertive" aria-atomic="wrong">
      <span>Some words</span>
    </div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R54, { document }), [
    failed(R54, target, {
      1: Outcomes.IsNotAtomic,
    }),
  ]);
});

test("evaluate() is inapplicable to elements that are not in the accessibility tree", async (t) => {
  const target = (
    <div hidden aria-live="assertive" aria-atomic="true">
      <span>Some words</span>
    </div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R54, { document }), [inapplicable(R54)]);
});

test("evaluate() is inapplicable to an element which is not assertive", async (t) => {
  const target = (
    <div>
      <span>Some words</span>
    </div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R54, { document }), [inapplicable(R54)]);
});

test("evaluate() is inapplicable to empty elements", async (t) => {
  const target = <div aria-live="assertive"></div>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R54, { document }), [inapplicable(R54)]);
});

test("evaluate() is inapplicable elements who only contain a text node", async (t) => {
  const target = <div aria-live="assertive">Some words</div>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R54, { document }), [inapplicable(R54)]);
});
