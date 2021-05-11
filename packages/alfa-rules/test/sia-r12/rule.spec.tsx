import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R12, { Outcomes } from "../../src/sia-r12/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test(`evaluates() passes a <button> with accessible name `, async (t) => {
  const target = <button>My button</button>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R12, { document }), [
    passed(R12, target, {
      1: Outcomes.HasName,
    }),
  ]);
});

test(`evaluates() passes a submit button element with an accessible name given by the value attribute `, async (t) => {
  const input = <input type="submit" value="Submit" />;

  const document = Document.of([input]);

  t.deepEqual(await evaluate(R12, { document }), [
    passed(R12, input, {
      1: Outcomes.HasName,
    }),
  ]);
});

test(`evaluates() passes a <button> with a name given by the \`aria-label\` attribute`, async (t) => {
  const target = <button aria-label="My button"></button>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R12, { document }), [
    passed(R12, target, {
      1: Outcomes.HasName,
    }),
  ]);
});

test(`evaluates() fails a button with no accessible name`, async (t) => {
  const target = <button></button>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R12, { document }), [
    failed(R12, target, {
      1: Outcomes.HasNoName,
    }),
  ]);
});

test(`evaluates() fails an element with \`button\` role without an accessible name`, async (t) => {
  const target = <span role="button"></span>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R12, { document }), [
    failed(R12, target, {
      1: Outcomes.HasNoName,
    }),
  ]);
});

test(`evaluate() is inapplicable to image buttons`, async (t) => {
  const target = <input type="image" value="download" alt="Download" />;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R12, { document }), [inapplicable(R12)]);
});

test(`evaluate() is inapplicabile to element with no button role`, async (t) => {
  const target = <div>Press Here</div>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R12, { document }), [inapplicable(R12)]);
});

test(`evaluate() is inapplicabile to button element with none role`, async (t) => {
  const target = <button role="none" disabled></button>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R12, { document }), [inapplicable(R12)]);
});
