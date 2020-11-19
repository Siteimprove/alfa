import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R10, { Outcomes } from "../../src/sia-r10/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes a valid simple autocomplete attribute on an <input> element", async (t) => {
  const element = <input autocomplete="username" />;
  const target = element.attribute("autocomplete").get()!;

  const document = Document.of([element]);

  t.deepEqual(await evaluate(R10, { document }), [
    passed(R10, target, {
      1: Outcomes.HasValidValue,
    }),
  ]);
});

test("evaluate() passes a valid complex autocomplete attribute on an <input> element", async (t) => {
  const element = (
    <input type="text" autocomplete="section-primary shipping work email" />
  );
  const target = element.attribute("autocomplete").get()!;

  const document = Document.of([element]);

  t.deepEqual(await evaluate(R10, { document }), [
    passed(R10, target, {
      1: Outcomes.HasValidValue,
    }),
  ]);
});

test("evaluate() fails an autocomplete attribute with a non-existing term", async (t) => {
  const element = <input autocomplete="invalid" />;
  const target = element.attribute("autocomplete").get()!;

  const document = Document.of([element]);

  t.deepEqual(await evaluate(R10, { document }), [
    failed(R10, target, {
      1: Outcomes.HasNoValidValue,
    }),
  ]);
});

test("evaluate() fails an autocomplete attribute with terms in wrong order", async (t) => {
  const element = <input autocomplete="work shipping email" />;
  const target = element.attribute("autocomplete").get()!;

  const document = Document.of([element]);

  t.deepEqual(await evaluate(R10, { document }), [
    failed(R10, target, {
      1: Outcomes.HasNoValidValue,
    }),
  ]);
});

test("evaluate() fails an autocomplete attribute with an inappropriate term", async (t) => {
  const element = <input type="number" autocomplete="email" />;
  const target = element.attribute("autocomplete").get()!;

  const document = Document.of([element]);

  t.deepEqual(await evaluate(R10, { document }), [
    failed(R10, target, {
      1: Outcomes.HasNoValidValue,
    }),
  ]);
});

test("evaluate() fails an autocomplete attribute with a comma-separated list of terms", async (t) => {
  const element = <input autocomplete="work,email" />;
  const target = element.attribute("autocomplete").get()!;

  const document = Document.of([element]);

  t.deepEqual(await evaluate(R10, { document }), [
    failed(R10, target, {
      1: Outcomes.HasNoValidValue,
    }),
  ]);
});

test("evaluates() is inapplicable when there is no autocomplete attribute", async (t) => {
  const element = <input />;

  const document = Document.of([element]);

  t.deepEqual(await evaluate(R10, { document }), [inapplicable(R10)]);
});

test("evaluates() is inapplicable on empty autocomplete attribute", async (t) => {
  const element = <input autocomplete=" " />;

  const document = Document.of([element]);

  t.deepEqual(await evaluate(R10, { document }), [inapplicable(R10)]);
});

test("evaluates() is inapplicable on input type who don't support autocomplete", async (t) => {
  const element = <input type="button" autocomplete="username" />;

  const document = Document.of([element]);

  t.deepEqual(await evaluate(R10, { document }), [inapplicable(R10)]);
});

test("evaluates() is inapplicable on invisible elements", async (t) => {
  const element = <input style={{ display: "none" }} autocomplete="email" />;

  const document = Document.of([element]);

  t.deepEqual(await evaluate(R10, { document }), [inapplicable(R10)]);
});

test("evaluates() is inapplicable on aria-disabled elements", async (t) => {
  const element = <input aria-disabled="true" autocomplete="email" />;

  const document = Document.of([element]);

  t.deepEqual(await evaluate(R10, { document }), [inapplicable(R10)]);
});

test("evaluates() is inapplicable on disabled elements", async (t) => {
  const element = <input disabled autocomplete="email" />;

  const document = Document.of([element]);

  t.deepEqual(await evaluate(R10, { document }), [inapplicable(R10)]);
});
