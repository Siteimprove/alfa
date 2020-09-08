import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R13, { Outcomes } from "../../src/sia-r13/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluates() passes an <iframe> with an accessible name given by the title attribute", async (t) => {
  const iframe = <iframe title="iframe" srcdoc="Hello World!" />;

  const document = Document.of([iframe]);

  t.deepEqual(await evaluate(R13, { document }), [
    passed(R13, iframe, {
      1: Outcomes.HasName,
    }),
  ]);
});

test("evaluates() passes an <iframe> with an accessible name given by the aria-label attribute", async (t) => {
  const iframe = <iframe aria-label="iframe" srcdoc="Hello World!" />;

  const document = Document.of([iframe]);

  t.deepEqual(await evaluate(R13, { document }), [
    passed(R13, iframe, {
      1: Outcomes.HasName,
    }),
  ]);
});

test("evaluates() passes an <iframe> with an accessible name given by the aria-labelledby attribute", async (t) => {
  const label = <span id="label">iframe</span>;

  const iframe = <iframe aria-labelledby="label" srcdoc="Hello World!" />;

  const document = Document.of([label, iframe]);

  t.deepEqual(await evaluate(R13, { document }), [
    passed(R13, iframe, {
      1: Outcomes.HasName,
    }),
  ]);
});

test("evaluates() fails an <iframe> with no accessible name", async (t) => {
  const iframe = <iframe srcdoc="Hello World!" />;

  const document = Document.of([iframe]);

  t.deepEqual(await evaluate(R13, { document }), [
    failed(R13, iframe, {
      1: Outcomes.HasNoName,
    }),
  ]);
});

test("evaluate() is inapplicable when there is no <iframe>", async (t) => {
  const button = <button>Button</button>;

  const document = Document.of([button]);

  t.deepEqual(await evaluate(R13, { document }), [inapplicable(R13)]);
});
