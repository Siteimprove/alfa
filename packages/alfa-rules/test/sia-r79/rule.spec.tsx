import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R79, { Outcomes } from "../../src/sia-r79/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

/*
test(`evaluate() passes a visible <pre> element has all its descendant text nodes included in a <code> element`, async (t) => {
  const target = (
<figure aria-label="Shrug emoji in ASCII art">
    <pre aria-hidden="true">¯\_(ツ)_/¯</pre>
</figure>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R79, { document }), [
    passed(R79, target, {
      1: Outcomes.IsOk,
      2: Outcomes.IsOk,
    }),
  ]);
});
*/

test(`evaluate() passes a visible <pre> element has all its descendant text nodes included in a <code> element`, async (t) => {
  const target = (
    <pre>
      <code>console.log("Hello world");</code>
    </pre>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R79, { document }), [
    passed(R79, target, {
      1: Outcomes.IsOk,
      2: Outcomes.IsOk,
    }),
  ]);
});

test(`evaluate() passes a visible <pre> element has all its descendant text nodes included in <samp> and <kbd> elements`, async (t) => {
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
      1: Outcomes.IsOk,
      2: Outcomes.IsOk,
    }),
  ]);
});

/*
test(`evaluate() passes a visible <pre> element has all its descendant text nodes included in a <code> element`, async (t) => {
  const target = <pre>
    <samp>You are in a room with a door and a desk.</samp>
    <kbd>Open door</kbd>
    <samp>The door is locked.
    You are in a room with a door and a desk.</samp>
</pre>

  const document = h.document([target]);

  t.deepEqual(await evaluate(R79, { document }), [
    failed(R79, target, {
      1: Outcomes.IsOk,
      2: Outcomes.IsNotOk,
    }),
  ]);
});

*/

test(`evaluate() passes a visible <pre> element has all its descendant text nodes included in a <code> element`, async (t) => {
  const target = <pre>¯\_(ツ)_/¯</pre>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R79, { document }), [
    failed(R79, target, {
      1: Outcomes.IsOk,
      2: Outcomes.IsNotOk,
    }),
  ]);
});

test(`evaluate() is inapplicable to non <pre> element:`, async (t) => {
  const target = (
    <figure hidden>
      <pre>¯\_(ツ)_/¯</pre>
    </figure>
  );
  const document = h.document([target]);

  t.deepEqual(await evaluate(R79, { document }), [inapplicable(R79)]);
});

test(`evaluate() is inapplicable to non <pre> element:`, async (t) => {
  const target = <p>Hello world</p>;
  const document = h.document([target]);

  t.deepEqual(await evaluate(R79, { document }), [inapplicable(R79)]);
});
