import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R19, { Outcomes } from "../../src/sia-r19/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test(`evaluate() passes an aria-required attribute with a valid true value`, async (t) => {
  const target = <div role="textbox" aria-required="true"></div>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R19, { document }), [
    passed(R19, target.attribute("aria-required").get(), {
      1: Outcomes.HasValidValue,
    }),
  ]);
});

test("evaluate() passes an aria-expanded attribute with a valid undefined value", async (t) => {
  const target = (
    <div role="button" aria-expanded="undefined">
      A button
    </div>
  );

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R19, { document }), [
    passed(R19, target.attribute("aria-expanded").get(), {
      1: Outcomes.HasValidValue,
    }),
  ]);
});

test("evaluate() passes an aria-pressed attribute with a valid tristate value", async (t) => {
  const target = (
    <div role="button" aria-pressed="mixed">
      An other button
    </div>
  );

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R19, { document }), [
    passed(R19, target.attribute("aria-pressed").get(), {
      1: Outcomes.HasValidValue,
    }),
  ]);
});

test("evaluate() passes an aria-errormessage attribute with a valid ID reference value", async (t) => {
  const target = <div role="textbox" aria-errormessage="my-error"></div>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R19, { document }), [
    passed(R19, target.attribute("aria-errormessage").get(), {
      1: Outcomes.HasValidValue,
    }),
  ]);
});

test("evaluate() passes an aria-rowindex attribute with a valid integer value", async (t) => {
  const target = (
    <div role="gridcell" aria-rowindex="2">
      Fred
    </div>
  );

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R19, { document }), [
    passed(R19, target.attribute("aria-rowindex").get(), {
      1: Outcomes.HasValidValue,
    }),
  ]);
});

test(`evaluate() passes aria-valuemin, aria-valuemax and aria-valuenow
     attributes with valid number values`, async (t) => {
  const target = (
    <div
      role="spinbutton"
      aria-valuemin="1.0"
      aria-valuemax="2.0"
      aria-valuenow="1.5"
    ></div>
  );

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R19, { document }), [
    passed(R19, target.attribute("aria-valuemin").get(), {
      1: Outcomes.HasValidValue,
    }),
    passed(R19, target.attribute("aria-valuemax").get(), {
      1: Outcomes.HasValidValue,
    }),
    passed(R19, target.attribute("aria-valuenow").get(), {
      1: Outcomes.HasValidValue,
    }),
  ]);
});

test("evaluate() passes an aria-placeholder attribute with a valid string value", async (t) => {
  const target = (
    <div role="textbox" aria-placeholder="MM-DD-YYYY">
      MM-DD-YYYY
    </div>
  );

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R19, { document }), [
    passed(R19, target.attribute("aria-placeholder").get(), {
      1: Outcomes.HasValidValue,
    }),
  ]);
});

test("evaluate() passes an aria-dropeffect property with a valid token list value", async (t) => {
  const target = <div role="dialog" aria-dropeffect="copy move"></div>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R19, { document }), [
    passed(R19, target.attribute("aria-dropeffect").get(), {
      1: Outcomes.HasValidValue,
    }),
  ]);
});

test("evaluate() fails an aria-expanded state with an invalid true/false/undefined value", async (t) => {
  const target = (
    <div role="button" aria-expanded="mixed">
      A button
    </div>
  );

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R19, { document }), [
    failed(R19, target.attribute("aria-expanded").get(), {
      1: Outcomes.HasNoValidValue,
    }),
  ]);
});

test("evaluate() fails an aria-pressed state with an invalid tristate value", async (t) => {
  const target = (
    <div role="button" aria-pressed="horizontal">
      An other button
    </div>
  );

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R19, { document }), [
    failed(R19, target.attribute("aria-pressed").get(), {
      1: Outcomes.HasNoValidValue,
    }),
  ]);
});

test("evaluate() fails an aria-rowindex property with an invalid integer value", async (t) => {
  const target = (
    <div role="gridcell" aria-rowindex="2.5">
      Fred
    </div>
  );

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R19, { document }), [
    failed(R19, target.attribute("aria-rowindex").get(), {
      1: Outcomes.HasNoValidValue,
    }),
  ]);
});

test("evaluate() fails an aria-live property with an invalid token value", async (t) => {
  const target = <div role="main" aria-live="nope"></div>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R19, { document }), [
    failed(R19, target.attribute("aria-live").get(), {
      1: Outcomes.HasNoValidValue,
    }),
  ]);
});

test("evaluate() fails an aria-rowindex property with an invalid integer value", async (t) => {
  const target = (
    <div
      role="spinbutton"
      aria-valuemin="one"
      aria-valuemax="three"
      aria-valuenow="two"
    ></div>
  );

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R19, { document }), [
    failed(R19, target.attribute("aria-valuemin").get(), {
      1: Outcomes.HasNoValidValue,
    }),
    failed(R19, target.attribute("aria-valuemax").get(), {
      1: Outcomes.HasNoValidValue,
    }),
    failed(R19, target.attribute("aria-valuenow").get(), {
      1: Outcomes.HasNoValidValue,
    }),
  ]);
});

test("evaluate() fails an aria-errormessage property with an invalid ID reference value", async (t) => {
  const target = <div role="textbox" aria-errormessage="error1 error2"></div>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R19, { document }), [
    failed(R19, target.attribute("aria-errormessage").get(), {
      1: Outcomes.HasNoValidValue,
    }),
  ]);
});

test("evaluate() is inapplicable when an element does not have any ARIA attribute", async (t) => {
  const document = Document.of([<div>Some Content</div>]);

  t.deepEqual(await evaluate(R19, { document }), [inapplicable(R19)]);
});

test("evaluate() is inapplicable when aria-checked state has an empty value", async (t) => {
  const document = Document.of([
    <div role="checkbox" aria-checked>
      Accept terms and conditions
    </div>,
  ]);

  t.deepEqual(await evaluate(R19, { document }), [inapplicable(R19)]);
});
