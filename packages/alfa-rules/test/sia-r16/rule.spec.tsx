import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R16, {
  Outcomes,
  RoleAndRequiredAttributes,
} from "../../src/sia-r16/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test(`evaluate() passes a <div> element with a role of checkbox and an
      aria-checked attribute`, async (t) => {
  const target = <div role="checkbox" aria-checked="true" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R16, { document }), [
    passed(R16, target, {
      1: Outcomes.HasAllStates(
        RoleAndRequiredAttributes.of("", "checkbox", ["aria-checked"], [])
      ),
    }),
  ]);
});

test(`evaluate() passes an <input> element with a type of checkbox`, async (t) => {
  const target = <input type="checkbox" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R16, { document }), [
    passed(R16, target, {
      1: Outcomes.HasAllStates(
        RoleAndRequiredAttributes.of("", "checkbox", ["aria-checked"], [])
      ),
    }),
  ]);
});

test(`evaluate() passes an <hr> element`, async (t) => {
  const target = <hr />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R16, { document }), [
    passed(R16, target, {
      1: Outcomes.HasAllStates(
        RoleAndRequiredAttributes.of("", "separator", [], [])
      ),
    }),
  ]);
});

test(`evaluate() passes a non-focusable <div> element with a role of separator`, async (t) => {
  const target = <div role="separator" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R16, { document }), [
    passed(R16, target, {
      1: Outcomes.HasAllStates(
        RoleAndRequiredAttributes.of("", "separator", [], [])
      ),
    }),
  ]);
});

test(`evaluate() passes a focusable <div> element with a role of separator and
      an aria-valuenow attribute`, async (t) => {
  const target = <div role="separator" tabindex="0" aria-valuenow="50" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R16, { document }), [
    passed(R16, target, {
      1: Outcomes.HasAllStates(
        RoleAndRequiredAttributes.of("", "separator", ["aria-valuenow"], [])
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
        RoleAndRequiredAttributes.of(
          "",
          "checkbox",
          ["aria-checked"],
          ["aria-checked"]
        )
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
        RoleAndRequiredAttributes.of(
          "",
          "separator",
          ["aria-valuenow"],
          ["aria-valuenow"]
        )
      ),
    }),
  ]);
});

test("evaluate() is inapplicable to elements that are not exposed", async (t) => {
  const target = <div role="combobox" style={{ display: "none" }} />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R16, { document }), [inapplicable(R16)]);
});
