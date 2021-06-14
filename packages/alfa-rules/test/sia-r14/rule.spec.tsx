import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R14, { Outcomes } from "../../src/sia-r14/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed } from "../common/outcome";

test(`evaluate() passes a <button> element whose perceivable text content
      matches its accessible name set by aria-label`, async (t) => {
  const target = <button aria-label="Hello world">Hello world</button>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R14, { document }), [
    passed(R14, target, {
      1: Outcomes.VisibleIsInName("hello world", "hello world"),
    }),
  ]);
});

test(`evaluate() passes a <button> element whose perceivable text content
      is included in its accessible name set by aria-label`, async (t) => {
  const target = <button aria-label="Hello world">Hello</button>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R14, { document }), [
    passed(R14, target, {
      1: Outcomes.VisibleIsInName("hello", "hello world"),
    }),
  ]);
});

test(`evaluate() fails a <button> element whose perceivable text content
      is not included in its accessible name set by aria-label`, async (t) => {
  const target = <button aria-label="Hello">Hello world</button>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R14, { document }), [
    failed(R14, target, {
      1: Outcomes.VisibleIsNotInName("hello world", "hello"),
    }),
  ]);
});

test(`evaluate() ignores non-perceivable text content`, async (t) => {
  const target = (
    <button aria-label="Hello">
      Hello <span aria-hidden="true">world</span>
    </button>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R14, { document }), [
    passed(R14, target, {
      1: Outcomes.VisibleIsInName("hello", "hello"),
    }),
  ]);
});
