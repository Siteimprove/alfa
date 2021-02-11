import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R13, { Outcomes } from "../../src/sia-r13/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test(`evaluates() passes an <iframe> element with an accessible name given by
      the title attribute`, async (t) => {
  const target = <iframe title="iframe" srcdoc="Hello World!" />;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R13, { document }), [
    passed(R13, target, {
      1: Outcomes.HasName,
    }),
  ]);
});

test(`evaluates() passes an <iframe> element with an accessible name given by
      the aria-label attribute`, async (t) => {
  const target = <iframe aria-label="iframe" srcdoc="Hello World!" />;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R13, { document }), [
    passed(R13, target, {
      1: Outcomes.HasName,
    }),
  ]);
});

test(`evaluates() passes an <iframe> element with an accessible name given by
      the aria-labelledby attribute`, async (t) => {
  const target = <iframe aria-labelledby="label" srcdoc="Hello World!" />;

  const document = Document.of([<span id="label">iframe</span>, target]);

  t.deepEqual(await evaluate(R13, { document }), [
    passed(R13, target, {
      1: Outcomes.HasName,
    }),
  ]);
});

test("evaluates() fails an <iframe> element without an accessible name", async (t) => {
  const target = <iframe srcdoc="Hello World!" />;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R13, { document }), [
    failed(R13, target, {
      1: Outcomes.HasNoName,
    }),
  ]);
});

test("evaluate() is inapplicable to a document without <iframe> elements", async (t) => {
  const document = Document.empty();

  t.deepEqual(await evaluate(R13, { document }), [inapplicable(R13)]);
});
