import { h, Namespace } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R119, { Outcomes } from "../../src/sia-r119/rule.ts";

import { evaluate } from "../common/evaluate.ts";
import { failed, inapplicable, passed } from "../common/outcome.ts";

/* <ul> and <ol> */

test(`evaluate() passes a <ul> whose children are all <li>`, async (t) => {
  const target = (
    <ul>
      <li>Foo</li>
      <li>Bar</li>
    </ul>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R119, { document }), [
    passed(R119, target, { 1: Outcomes.HasValidContent }),
  ]);
});

test(`evaluate() passes an <ol> that intermixes script-supporting elements`, async (t) => {
  const target = (
    <ol>
      <script>{"const foo = 1;"}</script>
      <li>Foo</li>
      <template></template>
    </ol>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R119, { document }), [
    passed(R119, target, { 1: Outcomes.HasValidContent }),
  ]);
});

test(`evaluate() passes an empty <ul>`, async (t) => {
  const target = <ul></ul>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R119, { document }), [
    passed(R119, target, { 1: Outcomes.HasValidContent }),
  ]);
});

test(`evaluate() fails a <ul> with a <div> child`, async (t) => {
  const error = <div>Foo</div>;

  const target = <ul>{error}</ul>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R119, { document }), [
    failed(R119, target, {
      1: Outcomes.HasDisallowedElements([error]),
    }),
  ]);
});

test(`evaluate() fails a <ul> containing text outside of a list item`, async (t) => {
  const target = (
    <ul>
      Foo
      <li>Bar</li>
    </ul>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R119, { document }), [
    failed(R119, target, { 1: Outcomes.HasDisallowedText }),
  ]);
});

test(`evaluate() fails a <ul> whose items carry the listitem role without being <li>`, async (t) => {
  const error = <div role="listitem">Foo</div>;

  const target = <ul role="list">{error}</ul>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R119, { document }), [
    failed(R119, target, {
      1: Outcomes.HasDisallowedElements([error]),
    }),
  ]);
});

test(`evaluate() fails a <ul> with an SVG-namespaced <li> child`, async (t) => {
  // Content models are written in terms of HTML elements, so sharing a local
  // name is not enough. No HTML syntax produces this; it has to be built with
  // createElementNS or moved out of an inline SVG.
  const error = h.element("li", [], ["Foo"], [], Namespace.SVG);

  const target = <ul>{error}</ul>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R119, { document }), [
    failed(R119, target, {
      1: Outcomes.HasDisallowedElements([error]),
    }),
  ]);
});

/* <dl> with groups written out directly */

test(`evaluate() passes a <dl> with a single name-value group`, async (t) => {
  const target = (
    <dl>
      <dt>Foo</dt>
      <dd>Bar</dd>
    </dl>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R119, { document }), [
    passed(R119, target, { 1: Outcomes.HasValidContent }),
  ]);
});

test(`evaluate() passes a <dl> with several names and values per group`, async (t) => {
  const target = (
    <dl>
      <dt>Foo</dt>
      <dt>Bar</dt>
      <dd>Baz</dd>
      <dd>Qux</dd>
    </dl>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R119, { document }), [
    passed(R119, target, { 1: Outcomes.HasValidContent }),
  ]);
});

test(`evaluate() passes a <dl> with consecutive name-value groups`, async (t) => {
  const target = (
    <dl>
      <dt>Foo</dt>
      <dd>Bar</dd>
      <dt>Baz</dt>
      <dd>Qux</dd>
    </dl>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R119, { document }), [
    passed(R119, target, { 1: Outcomes.HasValidContent }),
  ]);
});

test(`evaluate() passes an empty <dl>`, async (t) => {
  const target = <dl></dl>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R119, { document }), [
    passed(R119, target, { 1: Outcomes.HasValidContent }),
  ]);
});

test(`evaluate() passes a <dl> that intermixes script-supporting elements`, async (t) => {
  const target = (
    <dl>
      <script>{"const foo = 1;"}</script>
      <dt>Foo</dt>
      <script>{"const bar = 2;"}</script>
      <dd>Bar</dd>
      <template></template>
    </dl>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R119, { document }), [
    passed(R119, target, { 1: Outcomes.HasValidContent }),
  ]);
});

test(`evaluate() passes a <dl> that contains only script-supporting elements`, async (t) => {
  const target = (
    <dl>
      <script>{"const foo = 1;"}</script>
      <template></template>
    </dl>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R119, { document }), [
    passed(R119, target, { 1: Outcomes.HasValidContent }),
  ]);
});

test(`evaluate() fails a <dl> with a description without a term`, async (t) => {
  const error = <dd>Foo</dd>;

  const target = (
    <dl>
      {error}
      <dt>Bar</dt>
      <dd>Baz</dd>
    </dl>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R119, { document }), [
    failed(R119, target, {
      1: Outcomes.HasMalformedGroups([error]),
    }),
  ]);
});

test(`evaluate() fails a <dl> with a trailing term that is given no description`, async (t) => {
  const error = <dt>Baz</dt>;

  const target = (
    <dl>
      <dt>Foo</dt>
      <dd>Bar</dd>
      {error}
    </dl>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R119, { document }), [
    failed(R119, target, {
      1: Outcomes.HasMalformedGroups([error]),
    }),
  ]);
});

test(`every malformed group in a <dl> is evaluated, not only the first`, async (t) => {
  const first = <dd>Foo</dd>;
  const last = <dt>Qux</dt>;

  const target = (
    <dl>
      {first}
      <dt>Bar</dt>
      <dd>Baz</dd>
      {last}
    </dl>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R119, { document }), [
    failed(R119, target, {
      1: Outcomes.HasMalformedGroups([first, last]),
    }),
  ]);
});

test(`evaluate() fails a <dl> with a child that is neither <dt>, <dd> nor <div>`, async (t) => {
  const error = <p>Foo</p>;

  const target = (
    <dl>
      {error}
      <dt>Bar</dt>
      <dd>Baz</dd>
    </dl>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R119, { document }), [
    failed(R119, target, {
      1: Outcomes.HasDisallowedElements([error]),
    }),
  ]);
});

test(`evaluate() fails a <dl> containing text outside of a name or value`, async (t) => {
  const target = (
    <dl>
      Foo
      <dt>Bar</dt>
      <dd>Baz</dd>
    </dl>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R119, { document }), [
    failed(R119, target, { 1: Outcomes.HasDisallowedText }),
  ]);
});

/* <dl> with groups wrapped in <div> */

test(`evaluate() passes a <dl> whose groups are each wrapped in a <div>`, async (t) => {
  const target = (
    <dl>
      <div>
        <dt>Foo</dt>
        <dd>Bar</dd>
      </div>
      <div>
        <dt>Baz</dt>
        <dd>Qux</dd>
      </div>
    </dl>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R119, { document }), [
    passed(R119, target, { 1: Outcomes.HasValidContent }),
  ]);
});

test(`evaluate() passes a <dl> with a script-supporting element between wrappers`, async (t) => {
  const target = (
    <dl>
      <div>
        <dt>Foo</dt>
        <dd>Bar</dd>
      </div>
      <script>{"const foo = 1;"}</script>
      <div>
        <dt>Baz</dt>
        <dd>Qux</dd>
      </div>
    </dl>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R119, { document }), [
    passed(R119, target, { 1: Outcomes.HasValidContent }),
  ]);
});

test(`evaluate() passes a <dl> with a script-supporting element inside a wrapper`, async (t) => {
  const target = (
    <dl>
      <div>
        <dt>Foo</dt>
        <script>{"const foo = 1;"}</script>
        <dd>Bar</dd>
      </div>
    </dl>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R119, { document }), [
    passed(R119, target, { 1: Outcomes.HasValidContent }),
  ]);
});

test(`evaluate() fails a <dl> that mixes wrapped and unwrapped groups`, async (t) => {
  const name = <dt>Baz</dt>;
  const value = <dd>Qux</dd>;

  const target = (
    <dl>
      <div>
        <dt>Foo</dt>
        <dd>Bar</dd>
      </div>
      {name}
      {value}
    </dl>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R119, { document }), [
    failed(R119, target, {
      1: Outcomes.HasMixedGroups([name, value]),
    }),
  ]);
});

test(`evaluate() fails a <dl> with a wrapper that holds a name and no value`, async (t) => {
  const error = (
    <div>
      <dt>Foo</dt>
    </div>
  );

  const target = <dl>{error}</dl>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R119, { document }), [
    failed(R119, target, {
      1: Outcomes.HasMalformedGroups([error]),
    }),
  ]);
});

test(`a <dl> with a wrapper with wrong order of elements`, async (t) => {
  const error = (
    <div>
      <dd>Foo</dd>
      <dt>Bar</dt>
    </div>
  );

  const target = <dl>{error}</dl>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R119, { document }), [
    failed(R119, target, {
      1: Outcomes.HasMalformedGroups([error]),
    }),
  ]);
});

test(`evaluate() fails a <dl> with a wrapper that holds more than one group`, async (t) => {
  const error = (
    <div>
      <dt>Foo</dt>
      <dd>Bar</dd>
      <dt>Baz</dt>
      <dd>Qux</dd>
    </div>
  );

  const target = <dl>{error}</dl>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R119, { document }), [
    failed(R119, target, {
      1: Outcomes.HasMalformedGroups([error]),
    }),
  ]);
});

test(`evaluate() fails a <dl> with a wrapper that holds a disallowed element`, async (t) => {
  const error = (
    <div>
      <dt>Foo</dt>
      <dd>Bar</dd>
      <p>Baz</p>
    </div>
  );

  const target = <dl>{error}</dl>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R119, { document }), [
    failed(R119, target, {
      1: Outcomes.HasMalformedGroups([error]),
    }),
  ]);
});

/* Applicability */

test(`evaluate() is inapplicable to a document with no list`, async (t) => {
  const document = h.document([
    <div>
      <p>Foo</p>
    </div>,
  ]);

  t.deepEqual(await evaluate(R119, { document }), [inapplicable(R119)]);
});

test(`evaluate() is inapplicable to a list that is not rendered`, async (t) => {
  const document = h.document([
    <ul style={{ display: "none" }}>
      <div>Foo</div>
    </ul>,
  ]);

  t.deepEqual(await evaluate(R119, { document }), [inapplicable(R119)]);
});
