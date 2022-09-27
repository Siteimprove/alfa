import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R90, { Outcomes } from "../../src/sia-r90/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes a button with only text node children", async (t) => {
  const target = <button>Foo</button>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R90, { document }), [
    passed(R90, target, { 1: Outcomes.HasNoTabbableDescendants }),
  ]);
});

test("evaluate() passes a button with a span child", async (t) => {
  const target = (
    <button>
      <span>Foo</span>Bar
    </button>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R90, { document }), [
    passed(R90, target, { 1: Outcomes.HasNoTabbableDescendants }),
  ]);
});

test("evaluate() fails a button with a link child", async (t) => {
  const error = <a href="bar">Bar</a>;

  const target = <button>Foo{error}</button>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R90, { document }), [
    failed(R90, target, { 1: Outcomes.HasTabbableDescendants([error]) }),
  ]);
});

test("evaluate() fails an ARIA button with a link child", async (t) => {
  const error = <a href="bar">Bar</a>;

  const target = <span role="button">Foo{error}</span>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R90, { document }), [
    failed(R90, target, { 1: Outcomes.HasTabbableDescendants([error]) }),
  ]);
});

test("evaluate() is inapplicable if there is no role with presentational children", async (t) => {
  const document = h.document([
    <div>
      <span>Foo</span>
    </div>,
  ]);

  t.deepEqual(await evaluate(R90, { document }), [inapplicable(R90)]);
});
