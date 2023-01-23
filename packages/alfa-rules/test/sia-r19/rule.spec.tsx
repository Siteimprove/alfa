import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R19, { Outcomes } from "../../src/sia-r19/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test(`evaluate() passes an aria-required attribute with a valid true value`, async (t) => {
  const target = <div role="textbox" aria-required="true"></div>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R19, { document }), [
    passed(R19, target.attribute("aria-required").getUnsafe(), {
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

  const document = h.document([target]);

  t.deepEqual(await evaluate(R19, { document }), [
    passed(R19, target.attribute("aria-expanded").getUnsafe(), {
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

  const document = h.document([target]);

  t.deepEqual(await evaluate(R19, { document }), [
    passed(R19, target.attribute("aria-pressed").getUnsafe(), {
      1: Outcomes.HasValidValue,
    }),
  ]);
});

test("evaluate() passes a non-required aria-errormessage attribute with a valid but non-existent ID reference value", async (t) => {
  const target = <div role="textbox" aria-errormessage="my-error"></div>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R19, { document }), [
    passed(R19, target.attribute("aria-errormessage").getUnsafe(), {
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

  const document = h.document([target]);

  t.deepEqual(await evaluate(R19, { document }), [
    passed(R19, target.attribute("aria-rowindex").getUnsafe(), {
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

  const document = h.document([target]);

  t.deepEqual(await evaluate(R19, { document }), [
    passed(R19, target.attribute("aria-valuemin").getUnsafe(), {
      1: Outcomes.HasValidValue,
    }),
    passed(R19, target.attribute("aria-valuemax").getUnsafe(), {
      1: Outcomes.HasValidValue,
    }),
    passed(R19, target.attribute("aria-valuenow").getUnsafe(), {
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

  const document = h.document([target]);

  t.deepEqual(await evaluate(R19, { document }), [
    passed(R19, target.attribute("aria-placeholder").getUnsafe(), {
      1: Outcomes.HasValidValue,
    }),
  ]);
});

test("evaluate() passes an aria-dropeffect property with a valid token list value", async (t) => {
  const target = <div role="dialog" aria-dropeffect="copy move"></div>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R19, { document }), [
    passed(R19, target.attribute("aria-dropeffect").getUnsafe(), {
      1: Outcomes.HasValidValue,
    }),
  ]);
});

test("evaluate() passes an aria-setsize property with the value -1 when the total number of items is unknown", async (t) => {
  const target = (
    <li role="option" aria-setsize="-1">
      apples
    </li>
  );

  const document = h.document([<ul role="listbox">{target}</ul>]);

  t.deepEqual(await evaluate(R19, { document }), [
    passed(R19, target.attribute("aria-setsize").getUnsafe(), {
      1: Outcomes.HasValidValue,
    }),
  ]);
});

test("evaluate() passes an aria-controls property on a combobox pointing to a non-existent ID", async (t) => {
  const target = <div role="combobox" aria-controls="content"></div>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R19, { document }), [
    passed(R19, target.attribute("aria-controls").getUnsafe(), {
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

  const document = h.document([target]);

  t.deepEqual(await evaluate(R19, { document }), [
    failed(R19, target.attribute("aria-expanded").getUnsafe(), {
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

  const document = h.document([target]);

  t.deepEqual(await evaluate(R19, { document }), [
    failed(R19, target.attribute("aria-pressed").getUnsafe(), {
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

  const document = h.document([target]);

  t.deepEqual(await evaluate(R19, { document }), [
    failed(R19, target.attribute("aria-rowindex").getUnsafe(), {
      1: Outcomes.HasNoValidValue,
    }),
  ]);
});

test("evaluate() fails an aria-live property with an invalid token value", async (t) => {
  const target = <div role="main" aria-live="nope"></div>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R19, { document }), [
    failed(R19, target.attribute("aria-live").getUnsafe(), {
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

  const document = h.document([target]);

  t.deepEqual(await evaluate(R19, { document }), [
    failed(R19, target.attribute("aria-valuemin").getUnsafe(), {
      1: Outcomes.HasNoValidValue,
    }),
    failed(R19, target.attribute("aria-valuemax").getUnsafe(), {
      1: Outcomes.HasNoValidValue,
    }),
    failed(R19, target.attribute("aria-valuenow").getUnsafe(), {
      1: Outcomes.HasNoValidValue,
    }),
  ]);
});

test("evaluate() fails an aria-errormessage property with an invalid ID reference value", async (t) => {
  const target = <div role="textbox" aria-errormessage="error1 error2"></div>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R19, { document }), [
    failed(R19, target.attribute("aria-errormessage").getUnsafe(), {
      1: Outcomes.HasNoValidValue,
    }),
  ]);
});

test("evaluate() fails a required aria-controls property pointing to a non-existent ID", async (t) => {
  const target = <div role="scrollbar" aria-controls="content"></div>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R19, { document }), [
    failed(R19, target.attribute("aria-controls").getUnsafe(), {
      1: Outcomes.HasNoValidValue,
    }),
  ]);
});

test("evaluate() is inapplicable when an element does not have any ARIA attribute", async (t) => {
  const document = h.document([<div>Some Content</div>]);

  t.deepEqual(await evaluate(R19, { document }), [inapplicable(R19)]);
});

test("evaluate() is inapplicable when aria-checked state has an empty value", async (t) => {
  const document = h.document([
    <div role="checkbox" aria-checked>
      Accept terms and conditions
    </div>,
  ]);

  t.deepEqual(await evaluate(R19, { document }), [inapplicable(R19)]);
});
