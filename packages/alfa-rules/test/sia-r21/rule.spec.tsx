import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document, Element } from "@siteimprove/alfa-dom";

import R21, { Outcomes } from "../../src/sia-r21/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

const { isElement } = Element;

test("evaluates() passes an element with a single valid role", async (t) => {
  const button = <button role="button">Button</button>;

  const document = Document.of([button]);

  const target = button.attribute("role").get();

  t.deepEqual(await evaluate(R21, { document }), [
    passed(R21, target, {
      1: Outcomes.HasValidRole,
    }),
  ]);
});

test("evaluates() passes an element with multiple valid roles", async (t) => {
  const button = <button role="button link">Button</button>;

  const document = Document.of([button]);

  const target = button.attribute("role").get();

  t.deepEqual(await evaluate(R21, { document }), [
    passed(R21, target, {
      1: Outcomes.HasValidRole,
    }),
  ]);
});

test("evaluates() fails an element with an invalid role", async (t) => {
  const button = <button role="btn">Button</button>;

  const document = Document.of([button]);

  const target = button.attribute("role").get();

  t.deepEqual(await evaluate(R21, { document }), [
    failed(R21, target, {
      1: Outcomes.HasNoValidRole,
    }),
  ]);
});

test("evaluates() fails an element with both a valid and an invalid role", async (t) => {
  const button = <button role="btn link">Button</button>;

  const document = Document.of([button]);

  const target = button.attribute("role").get();

  t.deepEqual(await evaluate(R21, { document }), [
    failed(R21, target, {
      1: Outcomes.HasNoValidRole,
    }),
  ]);
});

test("evaluate() is inapplicable when there is no role attribute", async (t) => {
  const button = <button>Button</button>;

  const document = Document.of([button]);

  t.deepEqual(await evaluate(R21, { document }), [inapplicable(R21)]);
});

test("evaluate() is inapplicable when a role attribute is only whitespace", async (t) => {
  const button = <button role=" " />;

  const document = Document.of([button]);

  t.deepEqual(await evaluate(R21, { document }), [inapplicable(R21)]);
});
