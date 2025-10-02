import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R119, { Outcomes } from "../../dist/sia-r119/rule.js";

import { evaluate } from "../common/evaluate.js";
import { passed, failed, inapplicable } from "../common/outcome.js";

test("evaluate() passes a skip link with valid target and visible text", async (t) => {
  const target = <a href="#main">Skip to main content</a>;
  const document = h.document([
    <html>
      <body>
        {target}
        <main id="main">
          <h1>Main content</h1>
        </main>
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R119, { document }), [
    passed(R119, target, {
      1: Outcomes.HasValidTarget,
      2: Outcomes.HasVisibleText,
      3: Outcomes.IsProperlyPositioned,
    }),
  ]);
});

test("evaluate() fails a skip link with invalid target", async (t) => {
  const target = <a href="#nonexistent">Skip to content</a>;
  const document = h.document([
    <html>
      <body>
        {target}
        <main id="main">
          <h1>Main content</h1>
        </main>
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R119, { document }), [
    failed(R119, target, {
      1: Outcomes.HasInvalidTarget,
      2: Outcomes.HasVisibleText,
      3: Outcomes.IsProperlyPositioned,
    }),
  ]);
});

test("evaluate() fails a skip link without visible text", async (t) => {
  const target = <a href="#main"></a>;
  const document = h.document([
    <html>
      <body>
        {target}
        <main id="main">
          <h1>Main content</h1>
        </main>
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R119, { document }), [
    failed(R119, target, {
      1: Outcomes.HasValidTarget,
      2: Outcomes.HasNoVisibleText,
      3: Outcomes.IsProperlyPositioned,
    }),
  ]);
});

test("evaluate() fails a skip link that is not properly positioned", async (t) => {
  const target = <a href="#main">Skip to main content</a>;
  const document = h.document([
    <html>
      <body>
        <input type="text" />
        <input type="text" />
        <input type="text" />
        {target}
        <main id="main">
          <h1>Main content</h1>
        </main>
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R119, { document }), [
    failed(R119, target, {
      1: Outcomes.HasValidTarget,
      2: Outcomes.HasVisibleText,
      3: Outcomes.IsNotProperlyPositioned,
    }),
  ]);
});

test("evaluate() passes a skip link targeting a main element", async (t) => {
  const target = <a href="#content">Skip to content</a>;
  const document = h.document([
    <html>
      <body>
        {target}
        <div id="content" role="main">
          <h1>Content</h1>
        </div>
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R119, { document }), [
    passed(R119, target, {
      1: Outcomes.HasValidTarget,
      2: Outcomes.HasVisibleText,
      3: Outcomes.IsProperlyPositioned,
    }),
  ]);
});

test("evaluate() passes a skip link targeting any element with ID", async (t) => {
  const target = <a href="#navigation">Skip to navigation</a>;
  const document = h.document([
    <html>
      <body>
        {target}
        <nav id="navigation">
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
          </ul>
        </nav>
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R119, { document }), [
    passed(R119, target, {
      1: Outcomes.HasValidTarget,
      2: Outcomes.HasVisibleText,
      3: Outcomes.IsProperlyPositioned,
    }),
  ]);
});

test("evaluate() is inapplicable to non-skip links", async (t) => {
  const document = h.document([
    <html>
      <body>
        <a href="/page">Regular link</a>
        <a href="https://example.com">External link</a>
        <a href="mailto:test@example.com">Email link</a>
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R119, { document }), [inapplicable(R119)]);
});

test("evaluate() is inapplicable to documents without HTML element", async (t) => {
  const document = h.document([]);

  t.deepEqual(await evaluate(R119, { document }), [inapplicable(R119)]);
});

test("evaluate() fails a skip link with empty href", async (t) => {
  const target = <a href="">Skip to content</a>;
  const document = h.document([
    <html>
      <body>
        {target}
        <main id="main">
          <h1>Main content</h1>
        </main>
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R119, { document }), [
    failed(R119, target, {
      1: Outcomes.HasInvalidTarget,
      2: Outcomes.HasVisibleText,
      3: Outcomes.IsProperlyPositioned,
    }),
  ]);
});

test("evaluate() fails a skip link with whitespace-only text", async (t) => {
  const target = <a href="#main">   </a>;
  const document = h.document([
    <html>
      <body>
        {target}
        <main id="main">
          <h1>Main content</h1>
        </main>
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R119, { document }), [
    failed(R119, target, {
      1: Outcomes.HasValidTarget,
      2: Outcomes.HasNoVisibleText,
      3: Outcomes.IsProperlyPositioned,
    }),
  ]);
});
