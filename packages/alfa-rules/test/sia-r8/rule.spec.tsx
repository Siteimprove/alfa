import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R8, { Outcomes } from "../../src/sia-r8/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes an input element with accessible name", async (t) => {
  const target = <input />;

  const label = (
    <label>
      first name
      {target}
    </label>
  );

  const document = Document.of([label]);

  t.deepEqual(await evaluate(R8, { document }), [
    passed(R8, target, {
      1: Outcomes.HasName,
    }),
  ]);
});

test("evaluate() passes an input element with aria label", async (t) => {
  const target = <input aria-label="last name" disabled />;

  const label = <div>last name</div>;

  const document = Document.of([label, target]);

  t.deepEqual(await evaluate(R8, { document }), [
    passed(R8, target, {
      1: Outcomes.HasName,
    }),
  ]);
});

test("evaluate() passes a select element with accessible options", async (t) => {
  const target = (
    <select id="country">
      <option>England</option>
      <option>Scotland</option>
      <option>Wales</option>
      <option>Northern Ireland</option>
    </select>
  );

  const label = <label for="country">Country</label>;

  const document = Document.of([label, target]);

  t.deepEqual(await evaluate(R8, { document }), [
    passed(R8, target, {
      1: Outcomes.HasName,
    }),
  ]);
});

test("evaluate() passes a textarea element with aria labelledby", async (t) => {
  const target = <textarea aria-labelledby="country"></textarea>;

  const label = <div id="country">Country</div>;

  const document = Document.of([label, target]);

  t.deepEqual(await evaluate(R8, { document }), [
    passed(R8, target, {
      1: Outcomes.HasName,
    }),
  ]);
});

test("evaluate() passes a input element with placeholder attribute", async (t) => {
  const target = <input placeholder="Your search query" />;

  const label = <button type="submit">search</button>;

  const document = Document.of([label, target]);

  t.deepEqual(await evaluate(R8, { document }), [
    passed(R8, target, {
      1: Outcomes.HasName,
    }),
  ]);
});

test("evaluate() passes a input element with combobox role, whose has an aria-label attribute", async (t) => {
  const target = (
    <div aria-label="country" role="combobox" aria-disabled="true">
      England
    </div>
  );

  const label = <div>Country</div>;

  const document = Document.of([label, target]);

  t.deepEqual(await evaluate(R8, { document }), [
    passed(R8, target, {
      1: Outcomes.HasName,
    }),
  ]);
});

test("evaluate() fails a input element with not attribute", async (t) => {
  const target = <input />;

  const label = <div>last name</div>;

  const document = Document.of([label, target]);

  t.deepEqual(await evaluate(R8, { document }), [
    failed(R8, target, {
      1: Outcomes.HasNoName,
    }),
  ]);
});

test("evaluate() fails a input element with trimmed aria label", async (t) => {
  const target = <input aria-label=" " />;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R8, { document }), [
    failed(R8, target, {
      1: Outcomes.HasNoName,
    }),
  ]);
});

test("evaluate() fails a select element with div, whose has no text", async (t) => {
  const target = (
    <select aria-labelledby="country">
      <option>England</option>
    </select>
  );

  const label = <div id="country"></div>;

  const document = Document.of([label, target]);

  t.deepEqual(await evaluate(R8, { document }), [
    failed(R8, target, {
      1: Outcomes.HasNoName,
    }),
  ]);
});

test("evaluate() fails a text box element with no accessible name", async (t) => {
  const target = <div role="textbox"></div>;

  const label = (
    <label>
      first name
      {target}
    </label>
  );
  const document = Document.of([label, target]);

  t.deepEqual(await evaluate(R8, { document }), [
    failed(R8, target, {
      1: Outcomes.HasNoName,
    }),
  ]);
});

test("evaluate() is inapplicable for an input element with aria-hidden", async (t) => {
  const target = <input disabled aria-hidden="true" aria-label="firstname" />;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R8, { document }), [inapplicable(R8)]);
});

test("evaluate() is inapplicable for a select element because it's disabled ", async (t) => {
  const target = (
    <select role="none" disabled>
      <option value="volvo">Volvo</option>
      <option value="saab">Saab</option>
      <option value="opel">Opel</option>
    </select>
  );

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R8, { document }), [inapplicable(R8)]);
});

test("evaluate() is inapplicable for an input element with style element set to none ", async (t) => {
  const target = <input aria-label="firstname" style={{ display: "none" }} />;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R8, { document }), [inapplicable(R8)]);
});
