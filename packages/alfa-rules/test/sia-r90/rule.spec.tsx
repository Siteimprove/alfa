import { Document } from "@siteimprove/alfa-dom";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import R90, { Outcomes } from "../../src/sia-r90/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes a button with only text node children", async (t) => {
  const target = <button>Foo</button>;

  const document = Document.of([target]);

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

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R90, { document }), [
    passed(R90, target, { 1: Outcomes.HasNoTabbableDescendants }),
  ]);
});

test("evaluate() fails a button with a link child", async (t) => {
  const target = (
    <button>
      Foo<a href="bar">Bar</a>
    </button>
  );

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R90, { document }), [
    failed(R90, target, { 1: Outcomes.HasTabbableDescendants }),
  ]);
});

test("evaluate() fails an ARIA button with a link child", async (t) => {
  const target = (
    <span role="button">
      Foo<a href="bar">Bar</a>
    </span>
  );

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R90, { document }), [
    failed(R90, target, { 1: Outcomes.HasTabbableDescendants }),
  ]);
});

test("evaluate() is inapplicable if there is no role with presentational children", async (t) => {
  const document = Document.of([
    <div>
      <span>Foo</span>
    </div>,
  ]);

  t.deepEqual(await evaluate(R90, { document }), [inapplicable(R90)]);
});
