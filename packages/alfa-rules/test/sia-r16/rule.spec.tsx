import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R16, { Outcomes } from "../../src/sia-r16/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed } from "../common/outcome";

test(`evaluate() passes a <div> element with a role of checkbox and an
      aria-checked attribute`, async (t) => {
  const target = <div role="checkbox" aria-checked="true" />;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R16, { document }), [
    passed(R16, target, {
      1: Outcomes.HasAllStates,
    }),
  ]);
});

test(`evaluate() passes an <input> element with a type of checkbox`, async (t) => {
  const target = <input type="checkbox" />;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R16, { document }), [
    passed(R16, target, {
      1: Outcomes.HasAllStates,
    }),
  ]);
});

test(`evaluate() passes an <hr> element`, async (t) => {
  const target = <hr />;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R16, { document }), [
    passed(R16, target, {
      1: Outcomes.HasAllStates,
    }),
  ]);
});

test(`evaluate() passes a non-focusable <div> element with a role of separator`, async (t) => {
  const target = <div role="separator" />;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R16, { document }), [
    passed(R16, target, {
      1: Outcomes.HasAllStates,
    }),
  ]);
});

test(`evaluate() passes a focusable <div> element with a role of separator and
      an aria-valuenow attribute`, async (t) => {
  const target = <div role="separator" tabindex="0" aria-valuenow="50" />;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R16, { document }), [
    passed(R16, target, {
      1: Outcomes.HasAllStates,
    }),
  ]);
});

test(`evaluate() fails a <div> element with a role of checkbox and no
      aria-checked attribute`, async (t) => {
  const target = <div role="checkbox" />;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R16, { document }), [
    failed(R16, target, {
      1: Outcomes.HasNotAllStates,
    }),
  ]);
});

test(`evaluate() fails a focusable <div> element with a role of separator and no
      aria-valuenow attribute`, async (t) => {
  const target = <div role="separator" tabindex="0" />;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R16, { document }), [
    failed(R16, target, {
      1: Outcomes.HasNotAllStates,
    }),
  ]);
});
