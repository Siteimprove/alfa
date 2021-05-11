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

test(`evaluates() passes an input element with accessible value attribute `, async (t) => {
  const input = <input type="submit" value="Submit" />;

  const document = Document.of([input]);

  t.deepEqual(await evaluate(R12, { document }), [
    passed(R12, input, {
      1: Outcomes.HasName,
    }),
  ]);
});

test(`evaluates() passes a <button> with aria label attribute`, async (t) => {
  const target = <button aria-label="My button"></button>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R12, { document }), [
    passed(R12, target, {
      1: Outcomes.HasName,
    }),
  ]);
});

test(`evaluates() fails <button> with no attribute`, async (t) => {
  const target = <button></button>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R12, { document }), [
    failed(R12, target, {
      1: Outcomes.HasNoName,
    }),
  ]);
});

test(`evaluates() fails <button> element with no accessible name`, async (t) => {
  const target = <button type="button" value="read more"></button>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R12, { document }), [
    failed(R12, target, {
      1: Outcomes.HasNoName,
    }),
  ]);
});

test(`evaluates() fails element with <button> role because it doesn't have a content with accessible name`, async (t) => {
  const target = <span role="button"></span>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R12, { document }), [
    failed(R12, target, {
      1: Outcomes.HasNoName,
    }),
  ]);
});

test(`evaluates() fails element with <button> role because it doesn't have a content with accessible name`, async (t) => {
  const target = <span role="button"></span>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R12, { document }), [
    failed(R12, target, {
      1: Outcomes.HasNoName,
    }),
  ]);
});
