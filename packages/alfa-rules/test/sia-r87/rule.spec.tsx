import { h } from "@siteimprove/alfa-dom/h";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R87, { Outcomes } from "../../src/sia-r87/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test(`evaluate() passes a document`, async (t) => {
  const document = Document.of([
    <html>
      <a href="#main">Skip to content</a>
      <main id="main">Content</main>
    </html>,
  ]);

  t.deepEqual(await evaluate(R87, { document }), [
    passed(R87, document, {
      1: Outcomes.HasTabbable,
      2: Outcomes.FirstTabbableIsLinkToContent,
    }),
  ]);
});

test(`evaluate() fails a document`, async (t) => {
  const document = Document.of([
    <html>
      <main id="main">Content</main>
    </html>,
  ]);

  t.deepEqual(await evaluate(R87, { document }), [
    failed(R87, document, {
      1: Outcomes.HasNoTabbable,
      2: Outcomes.HasNoTabbable,
    }),
  ]);
});

test(`evaluate() fails a document`, async (t) => {
  const document = Document.of([
    <html>
      <a href="#main" hidden>
        Skip to content
      </a>
      <main id="main">Content</main>
    </html>,
  ]);

  t.deepEqual(await evaluate(R87, { document }), [
    failed(R87, document, {
      1: Outcomes.HasNoTabbable,
      2: Outcomes.HasNoTabbable,
    }),
  ]);
});

test(`evaluate() fails a document`, async (t) => {
  const document = Document.of([
    <html>
      <a href="#main" tabindex="-1">
        Skip to content
      </a>
      <button />
      <main id="main">Content</main>
    </html>,
  ]);

  t.deepEqual(await evaluate(R87, { document }), [
    failed(R87, document, {
      1: Outcomes.HasTabbable,
      2: Outcomes.FirstTabbableIsNotLink,
    }),
  ]);
});

test(`evaluate() fails a document`, async (t) => {
  const document = Document.of([
    <html>
      <a href="#main" role="button">
        Skip to content
      </a>
      <main id="main">Content</main>
    </html>,
  ]);

  t.deepEqual(await evaluate(R87, { document }), [
    failed(R87, document, {
      1: Outcomes.HasTabbable,
      2: Outcomes.FirstTabbableIsNotLink,
    }),
  ]);
});

test(`evaluate() fails a document`, async (t) => {
  const document = Document.of([
    <html>
      <a href="#main" aria-hidden="true">
        Skip to content
      </a>
      <main id="main">Content</main>
    </html>,
  ]);

  t.deepEqual(await evaluate(R87, { document }), [
    failed(R87, document, {
      1: Outcomes.HasTabbable,
      2: Outcomes.FirstTabbableIsIgnored,
    }),
  ]);
});

test(`evaluate() fails a document`, async (t) => {
  const document = Document.of(
    [
      <html>
        <a href="#main">Skip to content</a>
        <main id="main">Content</main>
      </html>,
    ],
    [
      h.sheet([
        h.rule.style("a", {
          opacity: "0",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R87, { document }), [
    failed(R87, document, {
      1: Outcomes.HasTabbable,
      2: Outcomes.FirstTabbableIsNotKeyboardActionable,
    }),
  ]);
});

test(`evaluate() passes a document`, async (t) => {
  const document = Document.of(
    [
      <html>
        <a href="#main">Skip to content</a>
        <main id="main">Content</main>
      </html>,
    ],
    [
      h.sheet([
        h.rule.style("a", {
          opacity: "0",
        }),

        h.rule.style("a:focus", {
          opacity: "1",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R87, { document }), [
    passed(R87, document, {
      1: Outcomes.HasTabbable,
      2: Outcomes.FirstTabbableIsLinkToContent,
    }),
  ]);
});
