import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R120, { Outcomes } from "../../src/sia-r120/rule.ts";

import { evaluate } from "../common/evaluate.ts";
import { failed, inapplicable, passed } from "../common/outcome.ts";

test(`evaluate() passes elements with distinct access keys`, async (t) => {
  const first = <button accesskey="a">Foo</button>;
  const second = <button accesskey="b">Bar</button>;

  const document = h.document([first, second]);

  t.deepEqual(await evaluate(R120, { document }), [
    passed(R120, first, { 1: Outcomes.HasUniqueAccesskeys }),
    passed(R120, second, { 1: Outcomes.HasUniqueAccesskeys }),
  ]);
});

test(`evaluate() fails both elements sharing an access key`, async (t) => {
  const first = <button accesskey="a">Foo</button>;
  const second = <button accesskey="a">Bar</button>;

  const document = h.document([first, second]);

  t.deepEqual(await evaluate(R120, { document }), [
    failed(R120, first, { 1: Outcomes.HasNonUniqueAccesskeys(["a"]) }),
    failed(R120, second, { 1: Outcomes.HasNonUniqueAccesskeys(["a"]) }),
  ]);
});

test(`evaluate() compares access keys without regard to case`, async (t) => {
  const first = <button accesskey="a">Foo</button>;
  const second = <button accesskey="A">Bar</button>;

  const document = h.document([first, second]);

  t.deepEqual(await evaluate(R120, { document }), [
    failed(R120, first, { 1: Outcomes.HasNonUniqueAccesskeys(["a"]) }),
    failed(R120, second, { 1: Outcomes.HasNonUniqueAccesskeys(["a"]) }),
  ]);
});

test(`evaluate() compares access keys with surrounding whitespace removed`, async (t) => {
  const first = <button accesskey="a">Foo</button>;
  const second = <button accesskey=" a ">Bar</button>;

  const document = h.document([first, second]);

  t.deepEqual(await evaluate(R120, { document }), [
    failed(R120, first, { 1: Outcomes.HasNonUniqueAccesskeys(["a"]) }),
    failed(R120, second, { 1: Outcomes.HasNonUniqueAccesskeys(["a"]) }),
  ]);
});

test(`evaluate() names only the contested key of a multi-token access key`, async (t) => {
  const both = <button accesskey="a b">Foo</button>;
  const other = <button accesskey="b">Bar</button>;

  const document = h.document([both, other]);

  t.deepEqual(await evaluate(R120, { document }), [
    failed(R120, both, { 1: Outcomes.HasNonUniqueAccesskeys(["b"]) }),
    failed(R120, other, { 1: Outcomes.HasNonUniqueAccesskeys(["b"]) }),
  ]);
});

test(`evaluate() names every contested key of a multi-token access key`, async (t) => {
  const both = <button accesskey="a b">Foo</button>;
  const first = <button accesskey="a">Bar</button>;
  const second = <button accesskey="b">Baz</button>;

  const document = h.document([both, first, second]);

  t.deepEqual(await evaluate(R120, { document }), [
    failed(R120, both, { 1: Outcomes.HasNonUniqueAccesskeys(["a", "b"]) }),
    failed(R120, first, { 1: Outcomes.HasNonUniqueAccesskeys(["a"]) }),
    failed(R120, second, { 1: Outcomes.HasNonUniqueAccesskeys(["b"]) }),
  ]);
});

test(`evaluate() passes multi-token access keys that share no token`, async (t) => {
  const first = <button accesskey="a b">Foo</button>;
  const second = <button accesskey="c d">Bar</button>;

  const document = h.document([first, second]);

  t.deepEqual(await evaluate(R120, { document }), [
    passed(R120, first, { 1: Outcomes.HasUniqueAccesskeys }),
    passed(R120, second, { 1: Outcomes.HasUniqueAccesskeys }),
  ]);
});

test(`evaluate() passes an access key shared only with an element that is not rendered`, async (t) => {
  const target = <button accesskey="a">Foo</button>;

  const document = h.document([
    target,
    <button accesskey="a" style={{ display: "none" }}>
      Bar
    </button>,
  ]);

  t.deepEqual(await evaluate(R120, { document }), [
    passed(R120, target, { 1: Outcomes.HasUniqueAccesskeys }),
  ]);
});

test(`evaluate() reports a key shared across a frame boundary`, async (t) => {
  // Access keys are treated as unique across the whole page, frames included,
  // rather than per document.
  const outer = <button accesskey="a">Parent</button>;
  const inner = <button accesskey="a">Framed</button>;

  const document = h.document([outer, <iframe>{h.document([inner])}</iframe>]);

  t.deepEqual(await evaluate(R120, { document }), [
    failed(R120, outer, { 1: Outcomes.HasNonUniqueAccesskeys(["a"]) }),
    failed(R120, inner, { 1: Outcomes.HasNonUniqueAccesskeys(["a"]) }),
  ]);
});

test(`evaluate() passes distinct keys either side of a frame boundary`, async (t) => {
  const outer = <button accesskey="a">Parent</button>;
  const inner = <button accesskey="b">Framed</button>;

  const document = h.document([outer, <iframe>{h.document([inner])}</iframe>]);

  t.deepEqual(await evaluate(R120, { document }), [
    passed(R120, outer, { 1: Outcomes.HasUniqueAccesskeys }),
    passed(R120, inner, { 1: Outcomes.HasUniqueAccesskeys }),
  ]);
});

test(`evaluate() reports a key shared between two frames`, async (t) => {
  const first = <button accesskey="a">First</button>;
  const second = <button accesskey="a">Second</button>;

  const document = h.document([
    <iframe>{h.document([first])}</iframe>,
    <iframe>{h.document([second])}</iframe>,
  ]);

  t.deepEqual(await evaluate(R120, { document }), [
    failed(R120, first, { 1: Outcomes.HasNonUniqueAccesskeys(["a"]) }),
    failed(R120, second, { 1: Outcomes.HasNonUniqueAccesskeys(["a"]) }),
  ]);
});

test(`evaluate() reports a key shared across a shadow boundary in one document`, async (t) => {
  const light = <button accesskey="a">Light</button>;
  const shadowed = <button accesskey="a">Shadowed</button>;

  const document = h.document([light, <div>{h.shadow([shadowed])}</div>]);

  t.deepEqual(await evaluate(R120, { document }), [
    failed(R120, light, { 1: Outcomes.HasNonUniqueAccesskeys(["a"]) }),
    failed(R120, shadowed, { 1: Outcomes.HasNonUniqueAccesskeys(["a"]) }),
  ]);
});

test(`evaluate() is inapplicable to a document with no access key`, async (t) => {
  const document = h.document([<button>Foo</button>]);

  t.deepEqual(await evaluate(R120, { document }), [inapplicable(R120)]);
});

test(`evaluate() is inapplicable to an access key that is only whitespace`, async (t) => {
  const document = h.document([<button accesskey=" ">Foo</button>]);

  t.deepEqual(await evaluate(R120, { document }), [inapplicable(R120)]);
});
