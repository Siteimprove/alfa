import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R10, { Outcomes } from "../../src/sia-r10/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes a valid simple autocomplete attribute on an <input> element", async (t) => {
  const element = <input autocomplete="username" />;
  const target = element.attribute("autocomplete").getUnsafe();

  const document = h.document([element]);

  t.deepEqual(await evaluate(R10, { document }), [
    passed(R10, target, {
      1: Outcomes.HasValidValue,
    }),
  ]);
});

test("evaluate() passes a valid simple autocomplete attribute on an <input> element", async (t) => {
  const element = <input autocomplete="username" />;
  const target = element.attribute("autocomplete").getUnsafe();

  const document = h.document([element]);

  t.deepEqual(await evaluate(R10, { document }), [
    passed(R10, target, {
      1: Outcomes.HasValidValue,
    }),
  ]);
});

test("evaluate() fails autocomplete attribute with missing required term", async (t) => {
  const element = <input autocomplete="section-blue shipping" />;
  const target = element.attribute("autocomplete").getUnsafe();

  const document = h.document([element]);

  t.deepEqual(await evaluate(R10, { document }), [
    failed(R10, target, {
      1: Outcomes.HasNoValidValue,
    }),
  ]);
});

test("evaluate() passes autocomplete attribute with \`section-blue shipping name webauthn\`", async (t) => {
  const element = <input autocomplete="section-blue shipping name webauthn" />;
  const target = element.attribute("autocomplete").getUnsafe();

  const document = h.document([element]);

  t.deepEqual(await evaluate(R10, { document }), [
    passed(R10, target, {
      1: Outcomes.HasValidValue,
    }),
  ]);
});

test("evaluate() passes autocomplete attribute with \`section-blue shipping home tel webauthn\`", async (t) => {
  const element = <input autocomplete="section-blue shipping name webauthn" />;
  const target = element.attribute("autocomplete").getUnsafe();

  const document = h.document([element]);

  t.deepEqual(await evaluate(R10, { document }), [
    passed(R10, target, {
      1: Outcomes.HasValidValue,
    }),
  ]);
});

test("evaluate() fails an autocomplete attribute with a non-existing term", async (t) => {
  const element = <input autocomplete="invalid" />;
  const target = element.attribute("autocomplete").getUnsafe();

  const document = h.document([element]);

  t.deepEqual(await evaluate(R10, { document }), [
    failed(R10, target, {
      1: Outcomes.HasNoValidValue,
    }),
  ]);
});

test("evaluate() fails an autocomplete attribute with terms in wrong order", async (t) => {
  const element = <input autocomplete="work shipping email" />;
  const target = element.attribute("autocomplete").getUnsafe();

  const document = h.document([element]);

  t.deepEqual(await evaluate(R10, { document }), [
    failed(R10, target, {
      1: Outcomes.HasNoValidValue,
    }),
  ]);
});

test("evaluate() fails an autocomplete attribute with valid tokens followed by an invalid token", async (t) => {
  const element = <input autocomplete="name home tel invalid" />;
  const target = element.attribute("autocomplete").getUnsafe();

  const document = h.document([element]);

  t.deepEqual(await evaluate(R10, { document }), [
    failed(R10, target, {
      1: Outcomes.HasNoValidValue,
    }),
  ]);
});

test("evaluate() fails an autocomplete attribute with \`home\` followed by nothing", async (t) => {
  const element = <input autocomplete="home" />;
  const target = element.attribute("autocomplete").getUnsafe();

  const document = h.document([element]);

  t.deepEqual(await evaluate(R10, { document }), [
    failed(R10, target, {
      1: Outcomes.HasNoValidValue,
    }),
  ]);
});

test("evaluate() fails an autocomplete attribute with \`home webauthn\`", async (t) => {
  const element = <input autocomplete="home webauthn" />;
  const target = element.attribute("autocomplete").getUnsafe();

  const document = h.document([element]);

  t.deepEqual(await evaluate(R10, { document }), [
    failed(R10, target, {
      1: Outcomes.HasNoValidValue,
    }),
  ]);
});

test("evaluate() fails an autocomplete attribute with a comma-separated list of terms", async (t) => {
  const element = <input autocomplete="work,email" />;
  const target = element.attribute("autocomplete").getUnsafe();

  const document = h.document([element]);

  t.deepEqual(await evaluate(R10, { document }), [
    failed(R10, target, {
      1: Outcomes.HasNoValidValue,
    }),
  ]);
});

test("evaluates() is inapplicable when there is no autocomplete attribute", async (t) => {
  const element = <input />;

  const document = h.document([element]);

  t.deepEqual(await evaluate(R10, { document }), [inapplicable(R10)]);
});

test("evaluates() is inapplicable on empty autocomplete attribute", async (t) => {
  const element = <input autocomplete=" " />;

  const document = h.document([element]);

  t.deepEqual(await evaluate(R10, { document }), [inapplicable(R10)]);
});

test("evaluates() is inapplicable on input type who don't support autocomplete", async (t) => {
  const element = <input type="button" autocomplete="username" />;

  const document = h.document([element]);

  t.deepEqual(await evaluate(R10, { document }), [inapplicable(R10)]);
});

test("evaluates() is inapplicable on invisible elements", async (t) => {
  const element = <input style={{ display: "none" }} autocomplete="email" />;

  const document = h.document([element]);

  t.deepEqual(await evaluate(R10, { document }), [inapplicable(R10)]);
});

test("evaluates() is inapplicable on aria-disabled elements", async (t) => {
  const element = <input aria-disabled="true" autocomplete="email" />;

  const document = h.document([element]);

  t.deepEqual(await evaluate(R10, { document }), [inapplicable(R10)]);
});

test("evaluates() is inapplicable on disabled elements", async (t) => {
  const element = <input disabled autocomplete="email" />;

  const document = h.document([element]);

  t.deepEqual(await evaluate(R10, { document }), [inapplicable(R10)]);
});

test("evaluates() is inapplicable when there is an ´  OfF ´ autocomplete attribute", async (t) => {
  const element = <input autocomplete="  OfF " />;

  const document = h.document([element]);

  t.deepEqual(await evaluate(R10, { document }), [inapplicable(R10)]);
});
