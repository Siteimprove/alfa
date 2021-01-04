import { h } from "@siteimprove/alfa-dom/h";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R63, { Outcomes } from "../../src/sia-r63/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes an object with a non-empty name", async (t) => {
  const target = <object aria-label="Some object"></object>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R63, { document }), [
    passed(R63, target, {
      1: Outcomes.HasName,
    }),
  ]);
});

test("evaluate() fails an object with an empty name", async (t) => {
  const target = <object aria-label=""></object>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R63, { document }), [
    failed(R63, target, {
      1: Outcomes.HasNoName,
    }),
  ]);
});

test("evaluate() fails an object with no name", async (t) => {
  // A content document is needed for the <object> element to be included in the
  // accessibility tree.
  const target = <object>{h.document(["Some nested document"])}</object>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R63, { document }), [
    failed(R63, target, {
      1: Outcomes.HasNoName,
    }),
  ]);
});

test("evaluate() is inapplicable if there is no object", async (t) => {
  const target = <img src="foo.jpg"></img>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R63, { document }), [inapplicable(R63)]);
});

test("evaluate() is inapplicable on empty object", async (t) => {
  const target = <object title="Some object"></object>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R63, { document }), [inapplicable(R63)]);
});
