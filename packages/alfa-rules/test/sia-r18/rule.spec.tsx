import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R18, { Outcomes } from "../../src/sia-r18/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test(`evaluate() passes a button with aria-pressed state`, async (t) => {
  const target = <button aria-pressed="false">My button</button>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R18, { document }), [
    passed(R18, target.attribute("aria-pressed").get(), {
      1: Outcomes.IsAllowed,
    }),
  ]);
});

test(`evaluate() passes a div element with button role, whose has aria-pressed state`, async (t) => {
  const target = (
    <div role="button" aria-pressed="false">
      My button
    </div>
  );

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R18, { document }), [
    passed(R18, target.attribute("aria-pressed").get(), {
      1: Outcomes.IsAllowed,
    }),
  ]);
});

test(`evaluate() passes a div element with aria busy state`, async (t) => {
  const target = <div aria-busy="true">My busy div</div>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R18, { document }), [
    passed(R18, target.attribute("aria-busy").get(), {
      1: Outcomes.IsAllowed,
    }),
  ]);
});

test(`evaluate() passes a div element with button role, whose has aria-label state`, async (t) => {
  const target = (
    <div role="button" aria-label="OK">
      ✓
    </div>
  );

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R18, { document }), [
    passed(R18, target.attribute("aria-label").get(), {
      1: Outcomes.IsAllowed,
    }),
  ]);
});

test(`evaluate() passes a div element with checkbox role, whose has aria-checked state`, async (t) => {
  const target = (
    <div role="checkbox" aria-checked="false">
      My checkbox
    </div>
  );

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R18, { document }), [
    passed(R18, target.attribute("aria-checked").get(), {
      1: Outcomes.IsAllowed,
    }),
  ]);
});

test(`evaluate() passes a div element with checkbox role, whose has aria-controls state`, async (t) => {
  const target = (
    <div role="combobox" aria-controls="id1" aria-expanded="false">
      My combobox
    </div>
  );

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R18, { document }), [
    passed(R18, target.attribute("aria-controls").get(), {
      1: Outcomes.IsAllowed,
    }),
    passed(R18, target.attribute("aria-expanded").get(), {
      1: Outcomes.IsAllowed,
    }),
  ]);
});

test(`evaluate() passes a div element with checkbox role, whose has aria-controls and aria-expanded state`, async (t) => {
  const target = (
    <div role="combobox" aria-controls="id1" aria-expanded="false">
      My combobox
    </div>
  );

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R18, { document }), [
    passed(R18, target.attribute("aria-controls").get(), {
      1: Outcomes.IsAllowed,
    }),
    passed(R18, target.attribute("aria-expanded").get(), {
      1: Outcomes.IsAllowed,
    }),
  ]);
});

test(`evaluate() passes a div element with checkbox role, whose has aria-expanded and aria-controls (empty) state`, async (t) => {
  const target = (
    <div role="combobox" aria-expanded="false" aria-controls="">
      My combobox
    </div>
  );

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R18, { document }), [
    passed(R18, target.attribute("aria-expanded").get(), {
      1: Outcomes.IsAllowed,
    }),
    passed(R18, target.attribute("aria-controls").get(), {
      1: Outcomes.IsAllowed,
    }),
  ]);
});

test(`evaluate() passes a button element with none role and aria pressed`, async (t) => {
  const target = (
    <button role="none" aria-pressed="false">
      ACT rules are cool!
    </button>
  );

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R18, { document }), [
    passed(R18, target.attribute("aria-pressed").get(), {
      1: Outcomes.IsAllowed,
    }),
  ]);
});

test(`evaluate() fails a button with aria-sort state, but it doesn't have any property`, async (t) => {
  const target = <button aria-sort="">Sort by year</button>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R18, { document }), [
    failed(R18, target.attribute("aria-sort").get(), {
      1: Outcomes.IsNotAllowed,
    }),
  ]);
});

test(`evaluate() is inapplicable for a div element with no aria state / property`, async (t) => {
  const target = <div role="region">A region of content</div>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R18, { document }), [inapplicable(R18)]);
});
