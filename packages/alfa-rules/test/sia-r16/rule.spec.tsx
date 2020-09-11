import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R16, { Outcomes } from "../../src/sia-r16/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test(`evaluate() passes a <div> element with a role of checkbox and an
      aria-checked attribute`, async (t) => {
  const checkbox = <div role="checkbox" aria-checked="true" />;

  const document = Document.of([checkbox]);

  t.deepEqual(await evaluate(R16, { document }), [
    passed(R16, checkbox, {
      1: Outcomes.HasAllStates,
    }),
  ]);
});

test(`evaluate() passes an <input> element with a type of checkbox`, async (t) => {
  const checkbox = <input type="checkbox" />;

  const document = Document.of([checkbox]);

  t.deepEqual(await evaluate(R16, { document }), [
    passed(R16, checkbox, {
      1: Outcomes.HasAllStates,
    }),
  ]);
});

test(`evaluate() passes an <hr> element`, async (t) => {
  const separator = <hr />;

  const document = Document.of([separator]);

  t.deepEqual(await evaluate(R16, { document }), [
    passed(R16, separator, {
      1: Outcomes.HasAllStates,
    }),
  ]);
});

test(`evaluate() passes a focusable <div> element with a role of separator and
      an aria-valuenow attribute`, async (t) => {
  const separator = <div role="separator" tabindex="0" aria-valuenow="50" />;

  const document = Document.of([separator]);

  t.deepEqual(await evaluate(R16, { document }), [
    passed(R16, separator, {
      1: Outcomes.HasAllStates,
    }),
  ]);
});

test(`evaluate() fails a <div> element with a role of checkbox and no
      aria-checked attribute`, async (t) => {
  const checkbox = <div role="checkbox" />;

  const document = Document.of([checkbox]);

  t.deepEqual(await evaluate(R16, { document }), [
    failed(R16, checkbox, {
      1: Outcomes.HasNotAllStates,
    }),
  ]);
});

test(`evaluate() failed a focusable <div> element with a role of separator and
      no aria-valuenow attribute`, async (t) => {
  const separator = <div role="separator" tabindex="0" />;

  const document = Document.of([separator]);

  t.deepEqual(await evaluate(R16, { document }), [
    failed(R16, separator, {
      1: Outcomes.HasNotAllStates,
    }),
  ]);
});
