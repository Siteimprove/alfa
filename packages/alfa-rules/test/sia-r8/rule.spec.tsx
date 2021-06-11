import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R8, { Outcomes } from "../../src/sia-r8/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes an input element with implicit label", async (t) => {
  const target = <input />;

  const label = (
    <label>
      first name
      {target}
    </label>
  );

  const document = h.document([label]);

  t.deepEqual(await evaluate(R8, { document }), [
    passed(R8, target, {
      1: Outcomes.HasName,
    }),
  ]);
});

test("evaluate() passes an input element with aria-label", async (t) => {
  const target = <input aria-label="last name" disabled />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R8, { document }), [
    passed(R8, target, {
      1: Outcomes.HasName,
    }),
  ]);
});

test("evaluate() passes a select element with explicit label", async (t) => {
  const target = (
    <select id="country">
      <option>England</option>
      <option>Scotland</option>
      <option>Wales</option>
      <option>Northern Ireland</option>
    </select>
  );

  const label = <label for="country">Country</label>;

  const document = h.document([label, target]);

  t.deepEqual(await evaluate(R8, { document }), [
    passed(R8, target, {
      1: Outcomes.HasName,
    }),
  ]);
});

test("evaluate() passes a textarea element with aria-labelledby", async (t) => {
  const target = <textarea aria-labelledby="country"></textarea>;

  const label = <div id="country">Country</div>;

  const document = h.document([label, target]);

  t.deepEqual(await evaluate(R8, { document }), [
    passed(R8, target, {
      1: Outcomes.HasName,
    }),
  ]);
});

test("evaluate() passes a input element with placeholder attribute", async (t) => {
  const target = <input placeholder="Your search query" />;

  const label = <button type="submit">search</button>;

  const document = h.document([label, target]);

  t.deepEqual(await evaluate(R8, { document }), [
    passed(R8, target, {
      1: Outcomes.HasName,
    }),
  ]);
});

test(`evaluate() passes a div element with explicit combobox role and an
     aria-label attribute`, async (t) => {
  const target = (
    <div aria-label="country" role="combobox" aria-disabled="true">
      England
    </div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R8, { document }), [
    passed(R8, target, {
      1: Outcomes.HasName,
    }),
  ]);
});

test("evaluate() fails a input element without accessible name", async (t) => {
  const target = <input />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R8, { document }), [
    failed(R8, target, {
      1: Outcomes.HasNoName,
    }),
  ]);
});

test("evaluate() fails a input element with empty aria-label", async (t) => {
  const target = <input aria-label=" " />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R8, { document }), [
    failed(R8, target, {
      1: Outcomes.HasNoName,
    }),
  ]);
});

test(`evaluate() fails a select element with aria-labelledby pointing to an
     empty element`, async (t) => {
  const target = (
    <select aria-labelledby="country">
      <option>England</option>
    </select>
  );

  const label = <div id="country"></div>;

  const document = h.document([label, target]);

  t.deepEqual(await evaluate(R8, { document }), [
    failed(R8, target, {
      1: Outcomes.HasNoName,
    }),
  ]);
});

test("evaluate() fails a textbox with no accessible name", async (t) => {
  const target = <div role="textbox"></div>;

  const label = (
    <label>
      first name
      {target}
    </label>
  );
  const document = h.document([label, target]);

  t.deepEqual(await evaluate(R8, { document }), [
    failed(R8, target, {
      1: Outcomes.HasNoName,
    }),
  ]);
});

test("evaluate() is inapplicable for an element with aria-hidden", async (t) => {
  const target = <input disabled aria-hidden="true" aria-label="firstname" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R8, { document }), [inapplicable(R8)]);
});

test("evaluate() is inapplicable for a disabled element", async (t) => {
  const target = (
    <select role="none" disabled>
      <option value="volvo">Volvo</option>
      <option value="saab">Saab</option>
      <option value="opel">Opel</option>
    </select>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R8, { document }), [inapplicable(R8)]);
});

test("evaluate() is inapplicable for an element which is not displayed", async (t) => {
  const target = <input aria-label="firstname" style={{ display: "none" }} />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R8, { document }), [inapplicable(R8)]);
});
