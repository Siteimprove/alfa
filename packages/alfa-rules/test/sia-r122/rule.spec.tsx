import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R122, { Outcomes } from "../../src/sia-r122/rule.ts";

import { evaluate } from "../common/evaluate.ts";
import { failed, inapplicable, passed } from "../common/outcome.ts";

test(`evaluate() passes elements with distinct access keys`, async (t) => {
  const first = <button accesskey="a">Foo</button>;
  const second = <button accesskey="b">Bar</button>;

  const document = h.document([first, second]);

  t.deepEqual(await evaluate(R122, { document }), [
    passed(R122, first, {
      1: Outcomes.HasUniqueAccesskeys,
      2: Outcomes.HasSingleCharacterAccesskeys,
      3: Outcomes.HasDistinctAccesskeys,
    }),
    passed(R122, second, {
      1: Outcomes.HasUniqueAccesskeys,
      2: Outcomes.HasSingleCharacterAccesskeys,
      3: Outcomes.HasDistinctAccesskeys,
    }),
  ]);
});

test(`evaluate() fails both elements sharing an access key`, async (t) => {
  const first = <button accesskey="a">Foo</button>;
  const second = <button accesskey="a">Bar</button>;

  const document = h.document([first, second]);

  t.deepEqual(await evaluate(R122, { document }), [
    failed(R122, first, {
      1: Outcomes.HasNonUniqueAccesskeys(["a"]),
      2: Outcomes.HasSingleCharacterAccesskeys,
      3: Outcomes.HasDistinctAccesskeys,
    }),
    failed(R122, second, {
      1: Outcomes.HasNonUniqueAccesskeys(["a"]),
      2: Outcomes.HasSingleCharacterAccesskeys,
      3: Outcomes.HasDistinctAccesskeys,
    }),
  ]);
});

test(`evaluate() compares access keys without regard to case`, async (t) => {
  const first = <button accesskey="a">Foo</button>;
  const second = <button accesskey="A">Bar</button>;

  const document = h.document([first, second]);

  t.deepEqual(await evaluate(R122, { document }), [
    failed(R122, first, {
      1: Outcomes.HasNonUniqueAccesskeys(["a"]),
      2: Outcomes.HasSingleCharacterAccesskeys,
      3: Outcomes.HasDistinctAccesskeys,
    }),
    failed(R122, second, {
      1: Outcomes.HasNonUniqueAccesskeys(["a"]),
      2: Outcomes.HasSingleCharacterAccesskeys,
      3: Outcomes.HasDistinctAccesskeys,
    }),
  ]);
});

test(`evaluate() compares access keys with surrounding whitespace removed`, async (t) => {
  const first = <button accesskey="a">Foo</button>;
  const second = <button accesskey=" a ">Bar</button>;

  const document = h.document([first, second]);

  t.deepEqual(await evaluate(R122, { document }), [
    failed(R122, first, {
      1: Outcomes.HasNonUniqueAccesskeys(["a"]),
      2: Outcomes.HasSingleCharacterAccesskeys,
      3: Outcomes.HasDistinctAccesskeys,
    }),
    failed(R122, second, {
      1: Outcomes.HasNonUniqueAccesskeys(["a"]),
      2: Outcomes.HasSingleCharacterAccesskeys,
      3: Outcomes.HasDistinctAccesskeys,
    }),
  ]);
});

test(`evaluate() names only the contested key of a multi-token access key`, async (t) => {
  const both = <button accesskey="a b">Foo</button>;
  const other = <button accesskey="b">Bar</button>;

  const document = h.document([both, other]);

  t.deepEqual(await evaluate(R122, { document }), [
    failed(R122, both, {
      1: Outcomes.HasNonUniqueAccesskeys(["b"]),
      2: Outcomes.HasSingleCharacterAccesskeys,
      3: Outcomes.HasDistinctAccesskeys,
    }),
    failed(R122, other, {
      1: Outcomes.HasNonUniqueAccesskeys(["b"]),
      2: Outcomes.HasSingleCharacterAccesskeys,
      3: Outcomes.HasDistinctAccesskeys,
    }),
  ]);
});

test(`evaluate() names every contested key of a multi-token access key`, async (t) => {
  const both = <button accesskey="a b">Foo</button>;
  const first = <button accesskey="a">Bar</button>;
  const second = <button accesskey="b">Baz</button>;

  const document = h.document([both, first, second]);

  t.deepEqual(await evaluate(R122, { document }), [
    failed(R122, both, {
      1: Outcomes.HasNonUniqueAccesskeys(["a", "b"]),
      2: Outcomes.HasSingleCharacterAccesskeys,
      3: Outcomes.HasDistinctAccesskeys,
    }),
    failed(R122, first, {
      1: Outcomes.HasNonUniqueAccesskeys(["a"]),
      2: Outcomes.HasSingleCharacterAccesskeys,
      3: Outcomes.HasDistinctAccesskeys,
    }),
    failed(R122, second, {
      1: Outcomes.HasNonUniqueAccesskeys(["b"]),
      2: Outcomes.HasSingleCharacterAccesskeys,
      3: Outcomes.HasDistinctAccesskeys,
    }),
  ]);
});

test(`evaluate() passes multi-token access keys that share no token`, async (t) => {
  const first = <button accesskey="a b">Foo</button>;
  const second = <button accesskey="c d">Bar</button>;

  const document = h.document([first, second]);

  t.deepEqual(await evaluate(R122, { document }), [
    passed(R122, first, {
      1: Outcomes.HasUniqueAccesskeys,
      2: Outcomes.HasSingleCharacterAccesskeys,
      3: Outcomes.HasDistinctAccesskeys,
    }),
    passed(R122, second, {
      1: Outcomes.HasUniqueAccesskeys,
      2: Outcomes.HasSingleCharacterAccesskeys,
      3: Outcomes.HasDistinctAccesskeys,
    }),
  ]);
});

test(`evaluate() reports a key the element declares twice`, async (t) => {
  const target = <button accesskey="a a">Foo</button>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R122, { document }), [
    failed(R122, target, {
      1: Outcomes.HasUniqueAccesskeys,
      2: Outcomes.HasSingleCharacterAccesskeys,
      3: Outcomes.HasRepeatedAccesskeys(["a"]),
    }),
  ]);
});

test(`evaluate() reports a key declared twice in different cases`, async (t) => {
  // `A` and `a` reach the same physical key, so this element declares one key
  // twice. Stricter than the W3C checker, which compares the tokens literally
  // and accepts this value.
  const target = <button accesskey="a A">Foo</button>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R122, { document }), [
    failed(R122, target, {
      1: Outcomes.HasUniqueAccesskeys,
      2: Outcomes.HasSingleCharacterAccesskeys,
      3: Outcomes.HasRepeatedAccesskeys(["a"]),
    }),
  ]);
});

test(`evaluate() reports a multi-character key, which no user can press`, async (t) => {
  const first = <button accesskey="aa">Foo</button>;
  const second = <button accesskey="a">Bar</button>;

  const document = h.document([first, second]);

  t.deepEqual(await evaluate(R122, { document }), [
    failed(R122, first, {
      1: Outcomes.HasUniqueAccesskeys,
      2: Outcomes.HasMultiCharacterAccesskeys(["aa"]),
      3: Outcomes.HasDistinctAccesskeys,
    }),
    passed(R122, second, {
      1: Outcomes.HasUniqueAccesskeys,
      2: Outcomes.HasSingleCharacterAccesskeys,
      3: Outcomes.HasDistinctAccesskeys,
    }),
  ]);
});

test(`evaluate() reports two elements sharing a multi-character key`, async (t) => {
  const first = <button accesskey="aa">Foo</button>;
  const second = <button accesskey="aa">Bar</button>;

  const document = h.document([first, second]);

  t.deepEqual(await evaluate(R122, { document }), [
    failed(R122, first, {
      1: Outcomes.HasNonUniqueAccesskeys(["aa"]),
      2: Outcomes.HasMultiCharacterAccesskeys(["aa"]),
      3: Outcomes.HasDistinctAccesskeys,
    }),
    failed(R122, second, {
      1: Outcomes.HasNonUniqueAccesskeys(["aa"]),
      2: Outcomes.HasMultiCharacterAccesskeys(["aa"]),
      3: Outcomes.HasDistinctAccesskeys,
    }),
  ]);
});

test(`evaluate() accepts a single Japanese character as a key`, async (t) => {
  const target = <button accesskey="ぬ">Foo</button>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R122, { document }), [
    passed(R122, target, {
      1: Outcomes.HasUniqueAccesskeys,
      2: Outcomes.HasSingleCharacterAccesskeys,
      3: Outcomes.HasDistinctAccesskeys,
    }),
  ]);
});

test(`evaluate() accepts several Japanese characters as separate keys`, async (t) => {
  const target = <button accesskey="ぬ め">Foo</button>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R122, { document }), [
    passed(R122, target, {
      1: Outcomes.HasUniqueAccesskeys,
      2: Outcomes.HasSingleCharacterAccesskeys,
      3: Outcomes.HasDistinctAccesskeys,
    }),
  ]);
});

test(`evaluate() reports two elements sharing a Japanese key`, async (t) => {
  const first = <button accesskey="ぬ">Foo</button>;
  const second = <button accesskey="ぬ">Bar</button>;

  const document = h.document([first, second]);

  t.deepEqual(await evaluate(R122, { document }), [
    failed(R122, first, {
      1: Outcomes.HasNonUniqueAccesskeys(["ぬ"]),
      2: Outcomes.HasSingleCharacterAccesskeys,
      3: Outcomes.HasDistinctAccesskeys,
    }),
    failed(R122, second, {
      1: Outcomes.HasNonUniqueAccesskeys(["ぬ"]),
      2: Outcomes.HasSingleCharacterAccesskeys,
      3: Outcomes.HasDistinctAccesskeys,
    }),
  ]);
});

test(`evaluate() reports a Japanese key an element declares twice`, async (t) => {
  // Verbatim from the checker's duplicate-key-labels test case.
  const target = <button accesskey="a b ぬ c ぬ">Foo</button>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R122, { document }), [
    failed(R122, target, {
      1: Outcomes.HasUniqueAccesskeys,
      2: Outcomes.HasSingleCharacterAccesskeys,
      3: Outcomes.HasRepeatedAccesskeys(["ぬ"]),
    }),
  ]);
});

test(`evaluate() reports a multi-character Japanese key`, async (t) => {
  // Adapted from the checker's multi-character-key-label test case, which uses
  // `ほげ`. Both kana here sit directly on a JIS keyboard, ほ on the `-` key and
  // す on the `R` key, so the value is plainly two keystrokes rather than one.
  const target = <button accesskey="a b ほす">Foo</button>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R122, { document }), [
    failed(R122, target, {
      1: Outcomes.HasUniqueAccesskeys,
      2: Outcomes.HasMultiCharacterAccesskeys(["ほす"]),
      3: Outcomes.HasDistinctAccesskeys,
    }),
  ]);
});

test(`evaluate() reports every multi-character key of one element`, async (t) => {
  const target = <button accesskey="aa bb c">Foo</button>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R122, { document }), [
    failed(R122, target, {
      1: Outcomes.HasUniqueAccesskeys,
      2: Outcomes.HasMultiCharacterAccesskeys(["aa", "bb"]),
      3: Outcomes.HasDistinctAccesskeys,
    }),
  ]);
});

test(`evaluate() reports every key an element declares twice`, async (t) => {
  const target = <button accesskey="a a b b">Foo</button>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R122, { document }), [
    failed(R122, target, {
      1: Outcomes.HasUniqueAccesskeys,
      2: Outcomes.HasSingleCharacterAccesskeys,
      3: Outcomes.HasRepeatedAccesskeys(["a", "b"]),
    }),
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

  t.deepEqual(await evaluate(R122, { document }), [
    passed(R122, target, {
      1: Outcomes.HasUniqueAccesskeys,
      2: Outcomes.HasSingleCharacterAccesskeys,
      3: Outcomes.HasDistinctAccesskeys,
    }),
  ]);
});

test(`evaluate() reports a key shared across a frame boundary`, async (t) => {
  // Access keys are treated as unique across the whole page, frames included,
  // rather than per document.
  const outer = <button accesskey="a">Parent</button>;
  const inner = <button accesskey="a">Framed</button>;

  const document = h.document([outer, <iframe>{h.document([inner])}</iframe>]);

  t.deepEqual(await evaluate(R122, { document }), [
    failed(R122, outer, {
      1: Outcomes.HasNonUniqueAccesskeys(["a"]),
      2: Outcomes.HasSingleCharacterAccesskeys,
      3: Outcomes.HasDistinctAccesskeys,
    }),
    failed(R122, inner, {
      1: Outcomes.HasNonUniqueAccesskeys(["a"]),
      2: Outcomes.HasSingleCharacterAccesskeys,
      3: Outcomes.HasDistinctAccesskeys,
    }),
  ]);
});

test(`evaluate() passes distinct keys either side of a frame boundary`, async (t) => {
  const outer = <button accesskey="a">Parent</button>;
  const inner = <button accesskey="b">Framed</button>;

  const document = h.document([outer, <iframe>{h.document([inner])}</iframe>]);

  t.deepEqual(await evaluate(R122, { document }), [
    passed(R122, outer, {
      1: Outcomes.HasUniqueAccesskeys,
      2: Outcomes.HasSingleCharacterAccesskeys,
      3: Outcomes.HasDistinctAccesskeys,
    }),
    passed(R122, inner, {
      1: Outcomes.HasUniqueAccesskeys,
      2: Outcomes.HasSingleCharacterAccesskeys,
      3: Outcomes.HasDistinctAccesskeys,
    }),
  ]);
});

test(`evaluate() reports a key shared between two frames`, async (t) => {
  const first = <button accesskey="a">First</button>;
  const second = <button accesskey="a">Second</button>;

  const document = h.document([
    <iframe>{h.document([first])}</iframe>,
    <iframe>{h.document([second])}</iframe>,
  ]);

  t.deepEqual(await evaluate(R122, { document }), [
    failed(R122, first, {
      1: Outcomes.HasNonUniqueAccesskeys(["a"]),
      2: Outcomes.HasSingleCharacterAccesskeys,
      3: Outcomes.HasDistinctAccesskeys,
    }),
    failed(R122, second, {
      1: Outcomes.HasNonUniqueAccesskeys(["a"]),
      2: Outcomes.HasSingleCharacterAccesskeys,
      3: Outcomes.HasDistinctAccesskeys,
    }),
  ]);
});

test(`evaluate() reports a key shared across a shadow boundary in one document`, async (t) => {
  const light = <button accesskey="a">Light</button>;
  const shadowed = <button accesskey="a">Shadowed</button>;

  const document = h.document([light, <div>{h.shadow([shadowed])}</div>]);

  t.deepEqual(await evaluate(R122, { document }), [
    failed(R122, light, {
      1: Outcomes.HasNonUniqueAccesskeys(["a"]),
      2: Outcomes.HasSingleCharacterAccesskeys,
      3: Outcomes.HasDistinctAccesskeys,
    }),
    failed(R122, shadowed, {
      1: Outcomes.HasNonUniqueAccesskeys(["a"]),
      2: Outcomes.HasSingleCharacterAccesskeys,
      3: Outcomes.HasDistinctAccesskeys,
    }),
  ]);
});

test(`evaluate() is inapplicable to a document with no access key`, async (t) => {
  const document = h.document([<button>Foo</button>]);

  t.deepEqual(await evaluate(R122, { document }), [inapplicable(R122)]);
});

test(`evaluate() is inapplicable to an access key that is only whitespace`, async (t) => {
  const document = h.document([<button accesskey=" ">Foo</button>]);

  t.deepEqual(await evaluate(R122, { document }), [inapplicable(R122)]);
});
