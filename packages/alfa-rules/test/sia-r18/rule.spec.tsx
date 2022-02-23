import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R18, { Outcomes } from "../../src/sia-r18/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test(`evaluate() passes input with type password field, textbox role and aria-required state`, async (t) => {
  const target = (
    <input type="password" role="textbox" aria-required="true">
      My password
    </input>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R18, { document }), [
    passed(R18, target.attribute("aria-required").get(), {
      1: Outcomes.IsAllowed,
    }),
  ]);
});

test(`evaluate() passes a button with aria-pressed state`, async (t) => {
  const target = <button aria-pressed="false">My button</button>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R18, { document }), [
    passed(R18, target.attribute("aria-pressed").get(), {
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
    passed(R18, target.attribute("aria-pressed").get(), {
      1: Outcomes.IsAllowed,
    }),
  ]);
});

test(`evaluate() passes a div element with aria busy state`, async (t) => {
  const target = <div aria-busy="true">My busy div</div>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R18, { document }), [
    passed(R18, target.attribute("aria-busy").get(), {
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
    passed(R18, target.attribute("aria-label").get(), {
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
    passed(R18, target.attribute("aria-checked").get(), {
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
    passed(R18, target.attribute("aria-controls").get(), {
      1: Outcomes.IsAllowed,
    }),
    passed(R18, target.attribute("aria-expanded").get(), {
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
    passed(R18, target.attribute("aria-controls").get(), {
      1: Outcomes.IsAllowed,
    }),
    passed(R18, target.attribute("aria-expanded").get(), {
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
    passed(R18, target.attribute("aria-expanded").get(), {
      1: Outcomes.IsAllowed,
    }),
    passed(R18, target.attribute("aria-controls").get(), {
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
    passed(R18, target.attribute("aria-pressed").get(), {
      1: Outcomes.IsAllowed,
    }),
  ]);
});

test(`evaluate() fails a button with aria-sort state, and no property`, async (t) => {
  const target = <button aria-sort="">Sort by year</button>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R18, { document }), [
    failed(R18, target.attribute("aria-sort").get(), {
      1: Outcomes.IsNotAllowed,
    }),
  ]);
});

test(`evaluate() is inapplicable for a div element with no aria attribute`, async (t) => {
  const target = <div role="region">A region of content</div>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R18, { document }), [inapplicable(R18)]);
});
