import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R18, { Outcomes } from "../../dist/sia-dr18/rule.js";

import { evaluate } from "../common/evaluate.js";
import { passed, failed, inapplicable } from "../common/outcome.js";

test(`evaluate() passes input with type password field and aria-required state`, async (t) => {
  const target = (
    <input type="password" aria-required="true">
      My password
    </input>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R18, { document }), [
    passed(R18, target.attribute("aria-required").getUnsafe(), {
      1: Outcomes.IsAllowed,
    }),
  ]);
});

test(`evaluate() passes a button with aria-pressed state`, async (t) => {
  const target = <button aria-pressed="false">My button</button>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R18, { document }), [
    passed(R18, target.attribute("aria-pressed").getUnsafe(), {
      1: Outcomes.IsAllowed,
    }),
  ]);
});

test(`evaluate() passes a div element with button role, and an aria-pressed state`, async (t) => {
  const target = (
    <div role="button" aria-pressed="false">
      My button
    </div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R18, { document }), [
    passed(R18, target.attribute("aria-pressed").getUnsafe(), {
      1: Outcomes.IsAllowed,
    }),
  ]);
});

test(`evaluate() passes a div element with aria busy state`, async (t) => {
  const target = <div aria-busy="true">My busy div</div>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R18, { document }), [
    passed(R18, target.attribute("aria-busy").getUnsafe(), {
      1: Outcomes.IsAllowed,
    }),
  ]);
});

test(`evaluate() passes a div element with button role, and an aria-label attribute`, async (t) => {
  const target = (
    <div role="button" aria-label="OK">
      ✓
    </div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R18, { document }), [
    passed(R18, target.attribute("aria-label").getUnsafe(), {
      1: Outcomes.IsAllowed,
    }),
  ]);
});

test(`evaluate() passes a div element with checkbox role, and an aria-checked state`, async (t) => {
  const target = (
    <div role="checkbox" aria-checked="false">
      My checkbox
    </div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R18, { document }), [
    passed(R18, target.attribute("aria-checked").getUnsafe(), {
      1: Outcomes.IsAllowed,
    }),
  ]);
});

test(`evaluate() passes a div element with checkbox role, and an aria-controls state`, async (t) => {
  const target = (
    <div role="combobox" aria-controls="id1" aria-expanded="false">
      My combobox
    </div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R18, { document }), [
    passed(R18, target.attribute("aria-controls").getUnsafe(), {
      1: Outcomes.IsAllowed,
    }),
    passed(R18, target.attribute("aria-expanded").getUnsafe(), {
      1: Outcomes.IsAllowed,
    }),
  ]);
});

test(`evaluate() passes a div element with checkbox role, and both
     aria-controls and aria-expanded states`, async (t) => {
  const target = (
    <div role="combobox" aria-controls="id1" aria-expanded="false">
      My combobox
    </div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R18, { document }), [
    passed(R18, target.attribute("aria-controls").getUnsafe(), {
      1: Outcomes.IsAllowed,
    }),
    passed(R18, target.attribute("aria-expanded").getUnsafe(), {
      1: Outcomes.IsAllowed,
    }),
  ]);
});

test(`evaluate() passes a div element with checkbox role, with both
     aria-expanded and empty aria-controls state`, async (t) => {
  const target = (
    <div role="combobox" aria-expanded="false" aria-controls="">
      My combobox
    </div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R18, { document }), [
    passed(R18, target.attribute("aria-expanded").getUnsafe(), {
      1: Outcomes.IsAllowed,
    }),
    passed(R18, target.attribute("aria-controls").getUnsafe(), {
      1: Outcomes.IsAllowed,
    }),
  ]);
});

test(`evaluate() passes a button element with none role and aria-pressed`, async (t) => {
  const target = (
    <button role="none" aria-pressed="false">
      ACT rules are cool!
    </button>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R18, { document }), [
    passed(R18, target.attribute("aria-pressed").getUnsafe(), {
      1: Outcomes.IsAllowed,
    }),
  ]);
});

test(`evaluate() fails a button with aria-sort state, and no property`, async (t) => {
  const target = <button aria-sort="">Sort by year</button>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R18, { document }), [
    failed(R18, target.attribute("aria-sort").getUnsafe(), {
      1: Outcomes.IsNotAllowed,
    }),
  ]);
});

test(`evaluate() is inapplicable for a div element with no aria attribute`, async (t) => {
  const target = <div role="region">A region of content</div>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R18, { document }), [inapplicable(R18)]);
});
