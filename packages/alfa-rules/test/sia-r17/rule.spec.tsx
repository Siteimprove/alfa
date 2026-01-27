import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R17, { Outcomes } from "../../dist/sia-r17/rule.js";

import { evaluate } from "../common/evaluate.js";
import { passed, failed, inapplicable } from "../common/outcome.js";

test(`evaluate() passes an element which is not focusable by default`, async (t) => {
  const target = <p aria-hidden="true">Some text</p>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R17, { document }), [
    passed(R17, target, {
      1: Outcomes.IsNotTabbable,
    }),
  ]);
});

test(`evaluate() passes an element which content is hidden`, async (t) => {
  const target = (
    <div aria-hidden="true">
      <a href="/" style={{ display: "none" }}>
        Link
      </a>
    </div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R17, { document }), [
    passed(R17, target, {
      1: Outcomes.IsNotTabbable,
    }),
  ]);
});

test(`evaluate() passes an element whose content is taken out of sequential
     focus order using tabindex`, async (t) => {
  const target = (
    <div aria-hidden="true">
      <button tabindex="-1">Some button</button>
    </div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R17, { document }), [
    passed(R17, target, {
      1: Outcomes.IsNotTabbable,
    }),
  ]);
});

test(`evaluate() passes an element which is disabled`, async (t) => {
  const target = <input disabled aria-hidden="true" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R17, { document }), [
    passed(R17, target, {
      1: Outcomes.IsNotTabbable,
    }),
  ]);
});

test(`evaluate() fails an element with focusable content`, async (t) => {
  const error = <a href="/">Link</a>;

  const target = <div aria-hidden="true">{error}</div>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R17, { document }), [
    failed(R17, target, {
      1: Outcomes.IsTabbable([error]),
    }),
  ]);
});

test(`evaluate() fails an element with an \`aria-hidden\` ancestor`, async (t) => {
  const error = <button>Some button</button>;

  const target = (
    <div aria-hidden="true">
      <div aria-hidden="false">{error}</div>
    </div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R17, { document }), [
    failed(R17, target, {
      1: Outcomes.IsTabbable([error]),
    }),
  ]);
});

test(`evaluate() fails an element with focusable content through tabindex`, async (t) => {
  const target = (
    <p tabindex="0" aria-hidden="true">
      Some text
    </p>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R17, { document }), [
    failed(R17, target, {
      1: Outcomes.IsTabbable([target]),
    }),
  ]);
});

test(`evaluate() fails a focusable summary element`, async (t) => {
  const error = <summary>Some button</summary>;

  const target = (
    <details aria-hidden="true">
      {error}
      <p>Some details</p>
    </details>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R17, { document }), [
    failed(R17, target, {
      1: Outcomes.IsTabbable([error]),
    }),
  ]);
});

test(`evaluate() is inapplicable when aria-hidden has incorrect value`, async (t) => {
  const target = (
    <div aria-hidden="yes">
      <p>Some text</p>
    </div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R17, { document }), [inapplicable(R17)]);
});

test(`evaluate() passes an element with the inert attribute`, async (t) => {
  const target = (
    <div aria-hidden="true" inert>
      <a href="/">Link</a>
    </div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R17, { document }), [
    passed(R17, target, {
      1: Outcomes.IsNotTabbable,
    }),
  ]);
});

test(`evaluate() passes an element with inert ancestor`, async (t) => {
  const target = (
    <div aria-hidden="true">
      <a href="/">Link</a>
    </div>
  );

  const document = h.document([<div inert>{target}</div>]);

  t.deepEqual(await evaluate(R17, { document }), [
    passed(R17, target, {
      1: Outcomes.IsNotTabbable,
    }),
  ]);
});

test(`evaluate() fails an inert element with a descendant that escapes inertness`, async (t) => {
  const button = <button>Click me in popup</button>;
  const target = (
    <div aria-hidden="true" inert>
      <dialog open>{button}</dialog>
    </div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R17, { document }), [
    failed(R17, target, {
      1: Outcomes.IsTabbable([button]),
    }),
  ]);
});
