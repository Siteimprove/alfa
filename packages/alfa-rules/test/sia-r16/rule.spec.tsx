import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R16, { Outcomes } from "../../dist/sia-r16/rule.js";

import { evaluate } from "../common/evaluate.js";
import { passed, failed, inapplicable } from "../common/outcome.js";

test(`evaluate() passes a <div> element with a role of checkbox and an
      aria-checked attribute`, async (t) => {
  const target = <div role="checkbox" aria-checked="true" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R16, { document }), [
    passed(R16, target, {
      1: Outcomes.HasAllStates("checkbox", ["aria-checked"], []),
    }),
  ]);
});

test(`evaluate() passes a non-focusable <div> element with a role of separator`, async (t) => {
  const target = <div role="separator" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R16, { document }), [
    passed(R16, target, {
      1: Outcomes.HasAllStates("separator", [], []),
    }),
  ]);
});

test(`evaluate() passes a focusable <div> element with a role of separator and
      an aria-valuenow attribute`, async (t) => {
  const target = <div role="separator" tabindex="0" aria-valuenow="50" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R16, { document }), [
    passed(R16, target, {
      1: Outcomes.HasAllStates("separator", ["aria-valuenow"], []),
    }),
  ]);
});

test(`evaluate() passes a <div> element with a role of combobox,
      aria-expanded value of false and missing aria-controls attribute`, async (t) => {
  const target = <div role="combobox" aria-expanded="false"></div>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R16, { document }), [
    passed(R16, target, {
      1: Outcomes.HasAllStates(
        "combobox",
        ["aria-controls", "aria-expanded"],
        [],
      ),
    }),
  ]);
});

test(`evaluate() fails a <div> element with a role of combobox,
      aria-expanded value of true and missing aria-controls attribute`, async (t) => {
  const target = <div role="combobox" aria-expanded="true"></div>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R16, { document }), [
    failed(R16, target, {
      1: Outcomes.HasNotAllStates(
        "combobox",
        ["aria-controls", "aria-expanded"],
        ["aria-controls"],
      ),
    }),
  ]);
});

test(`evaluate() fails a <div> element with a role of checkbox and no
      aria-checked attribute`, async (t) => {
  const target = <div role="checkbox" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R16, { document }), [
    failed(R16, target, {
      1: Outcomes.HasNotAllStates(
        "checkbox",
        ["aria-checked"],
        ["aria-checked"],
      ),
    }),
  ]);
});

test(`evaluate() fails a focusable <div> element with a role of separator and no
      aria-valuenow attribute`, async (t) => {
  const target = <div role="separator" tabindex="0" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R16, { document }), [
    failed(R16, target, {
      1: Outcomes.HasNotAllStates(
        "separator",
        ["aria-valuenow"],
        ["aria-valuenow"],
      ),
    }),
  ]);
});

test("evaluate() is inapplicable to elements that are not exposed", async (t) => {
  const target = <div role="combobox" style={{ display: "none" }} />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R16, { document }), [inapplicable(R16)]);
});

test("evaluate() is inapplicable to elements with no explicit role", async (t) => {
  const target = <input type="checkbox" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R16, { document }), [inapplicable(R16)]);
});

test("evaluate() is inapplicable to elements with same explicit and implicit role", async (t) => {
  const target = <input type="checkbox" role="checkbox" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R16, { document }), [inapplicable(R16)]);
});
