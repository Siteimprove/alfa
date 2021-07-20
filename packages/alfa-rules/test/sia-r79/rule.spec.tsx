import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R79, { Outcomes } from "../../src/sia-r79/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test(`evaluate() passes a visible <pre> element which is part of a <figure>`, async (t) => {
  const target = <pre aria-hidden="true">¯\_(ツ)_/¯</pre>;

  const document = h.document([
    <figure aria-label="Shrug emoji in ASCII art">{target}</figure>,
  ]);

  t.deepEqual(await evaluate(R79, { document }), [
    passed(R79, target, {
      1: Outcomes.IsVisible,
      2: Outcomes.IsDescendant,
    }),
  ]);
});

test(`evaluate() passes an aria-hidden <pre> element that is part of a <figure>`, async (t) => {
  const target = (
    <pre style={{ position: "absolute", left: "-9999px" }}>¯\_(ツ)_/¯</pre>
  );

  const document = h.document([<figure aria-hidden="true">{target}</figure>]);

  t.deepEqual(await evaluate(R79, { document }), [
    passed(R79, target, {
      1: Outcomes.IsHidden,
      2: Outcomes.IsDescendant,
    }),
  ]);
});

test(`evaluate() passes a visible <pre> element that has all its descendant text nodes included in a <code> element`, async (t) => {
  const target = (
    <pre>
      <code>console.log("Hello world");</code>
    </pre>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R79, { document }), [
    passed(R79, target, {
      1: Outcomes.IsVisible,
      2: Outcomes.IsDescendant,
    }),
  ]);
});

test(`evaluate() passes a visible <pre> element that has all its descendant text nodes included in <samp> and <kbd> elements`, async (t) => {
  const target = (
    <pre>
      <samp>You are in a room with a door and a desk.</samp>
      <kbd>Open door</kbd>
      <samp>The door is locked. You are in a room with a door and a desk.</samp>
    </pre>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R79, { document }), [
    passed(R79, target, {
      1: Outcomes.IsVisible,
      2: Outcomes.IsDescendant,
    }),
  ]);
});

test(`evaluate() fails <pre> element that is only exposed to assistive technologies`, async (t) => {
  const target = (
    <pre style={{ position: "absolute", left: "-9999px" }}>¯\_(ツ)_/¯</pre>
  );

  const document = h.document([<figure>{target}</figure>]);

  t.deepEqual(await evaluate(R79, { document }), [
    failed(R79, target, {
      1: Outcomes.IsNotVisibleAndNotHidden,
      2: Outcomes.IsDescendant,
    }),
  ]);
});

test(`evaluate() fails a <pre> element which neither is the descendant of a <figure> element, nor has its text nodes included in the correct elements`, async (t) => {
  const target = <pre>¯\_(ツ)_/¯</pre>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R79, { document }), [
    failed(R79, target, {
      1: Outcomes.IsVisible,
      2: Outcomes.IsNotDescendant,
    }),
  ]);
});

test(`evaluate() is inapplicable to non rendered <pre> element:`, async (t) => {
  const target = (
    <figure hidden>
      <pre>¯\_(ツ)_/¯</pre>
    </figure>
  );
  const document = h.document([target]);

  t.deepEqual(await evaluate(R79, { document }), [inapplicable(R79)]);
});

test(`evaluate() is inapplicable to a page with not <pre> element:`, async (t) => {
  const target = <p>Hello world</p>;
  const document = h.document([target]);

  t.deepEqual(await evaluate(R79, { document }), [inapplicable(R79)]);
});
