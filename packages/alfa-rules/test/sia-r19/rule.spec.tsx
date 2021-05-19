import { h } from "@siteimprove/alfa-dom/h";
import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";
import { Response } from "@siteimprove/alfa-http";
import { URL } from "@siteimprove/alfa-url";

import R19, { Outcomes } from "../../src/sia-r19/rule";

import { Group } from "../../src/common/group";

import { evaluate } from "../common/evaluate";
import { oracle } from "../common/oracle";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes a div element with aria-required property, whose has a valid true value", async (t) => {
  const target = (
    <div
      role="textbox"
      aria-required="true"
    ></div>
  );

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R19, { document }), [
    passed(R19, target.attribute("aria-required").get(), {
      1: Outcomes.HasValidValue,
    }),
  ]);
});

test("evaluate() passes a div element with aria-expanded state, whose has a valid undefined value", async (t) => {
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

test("evaluate() passes a div element with aria-pressed state, whose has a valid tristate value", async (t) => {
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

test("evaluate() passes a div element with aria-errormessage property, whose has a valid ID reference value", async (t) => {
  const target = (
    <div
      role="textbox"
      aria-errormessage="my-error"
    ></div>
  );

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R19, { document }), [
    passed(R19, target.attribute("aria-errormessage").get(), {
      1: Outcomes.HasValidValue,
    }),
  ]);
});

test("evaluate() passes a div element with aria-rowindex property, whose has a valid integer value", async (t) => {
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

test("evaluate() passes a div element with aria-valuemin, aria-valuemax and aria-valuenow properties with valid number values", async (t) => {
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

test("evaluate() passes a div element with aria-placeholder property, whose has a valid string value", async (t) => {
  const target = (
    <div
      role="textbox"
      aria-placeholder="MM-DD-YYYY"
    >
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

test("evaluate() passes a div element with aria-dropeffect property, whose has a valid token list value", async (t) => {
  const target = <div role="dialog" aria-dropeffect="copy move"></div>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R19, { document }), [
    passed(R19, target.attribute("aria-dropeffect").get(), {
      1: Outcomes.HasValidValue,
    }),
  ]);
});

test("evaluate() fails a div element with aria-expanded state, whose has a invalid true/false/undefined value", async (t) => {
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

test("evaluate() fails a div element with aria-pressed state, whose has a invalid tristate value", async (t) => {
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

test("evaluate() fails a div element with aria-rowindex property, whose has a invalid integer value", async (t) => {
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

test("evaluate() fails a div element with aria-live property, whose has a invalid token value", async (t) => {
  const target = <div role="main" aria-live="nope"></div>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R19, { document }), [
    failed(R19, target.attribute("aria-live").get(), {
      1: Outcomes.HasNoValidValue,
    }),
  ]);
});

test("evaluate() fails a div element with aria-rowindex property, whose has a invalid integer value", async (t) => {
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

test("evaluate() fails a div element with aria-errormessage property, whose has a invalid ID reference value", async (t) => {
  const target = <div role="textbox" aria-errormessage="error1 error2"></div>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R19, { document }), [
    failed(R19, target.attribute("aria-errormessage").get(), {
      1: Outcomes.HasNoValidValue,
    }),
  ]);
});

test("evaluate() is inapplicable when an element does not have any ARIA states or properties", async (t) => {
  const document = Document.of([<div>Some Content</div>]);

  t.deepEqual(await evaluate(R19, { document }), [inapplicable(R19)]);
});

test("evaluate() is inapplicable when aria-checked state has empty value", async (t) => {
  const document = Document.of([
    <div role="checkbox" aria-checked>
      Accept terms and conditions
    </div>,
  ]);

  t.deepEqual(await evaluate(R19, { document }), [inapplicable(R19)]);
});
