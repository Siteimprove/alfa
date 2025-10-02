import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R122, { Outcomes } from "../../dist/sia-r122/rule.js";

import { evaluate } from "../common/evaluate.js";
import { passed, failed, inapplicable } from "../common/outcome.js";

test("evaluate() passes a status message with proper ARIA role", async (t) => {
  const target = <div role="status">Form saved successfully</div>;
  const document = h.document([
    <html>
      <body>
        {target}
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R122, { document }), [
    passed(R122, target, {
      1: Outcomes.HasProperRole,
      2: Outcomes.HasProperAttributes,
      3: Outcomes.HasAccessibleContent,
    }),
  ]);
});

test("evaluate() passes an alert message with proper attributes", async (t) => {
  const target = <div role="alert" aria-live="assertive">Error: Please check your input</div>;
  const document = h.document([
    <html>
      <body>
        {target}
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R122, { document }), [
    passed(R122, target, {
      1: Outcomes.HasProperRole,
      2: Outcomes.HasProperAttributes,
      3: Outcomes.HasAccessibleContent,
    }),
  ]);
});

test("evaluate() passes a live region with aria-live", async (t) => {
  const target = <div aria-live="polite" aria-atomic="true">Loading...</div>;
  const document = h.document([
    <html>
      <body>
        {target}
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R122, { document }), [
    passed(R122, target, {
      1: Outcomes.HasProperRole,
      2: Outcomes.HasProperAttributes,
      3: Outcomes.HasAccessibleContent,
    }),
  ]);
});

test("evaluate() passes a log region", async (t) => {
  const target = <div role="log" aria-live="polite">System log: User logged in</div>;
  const document = h.document([
    <html>
      <body>
        {target}
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R122, { document }), [
    passed(R122, target, {
      1: Outcomes.HasProperRole,
      2: Outcomes.HasProperAttributes,
      3: Outcomes.HasAccessibleContent,
    }),
  ]);
});

test("evaluate() passes a timer region", async (t) => {
  const target = <div role="timer" aria-live="off">Time remaining: 5:00</div>;
  const document = h.document([
    <html>
      <body>
        {target}
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R122, { document }), [
    passed(R122, target, {
      1: Outcomes.HasProperRole,
      2: Outcomes.HasProperAttributes,
      3: Outcomes.HasAccessibleContent,
    }),
  ]);
});

test("evaluate() fails a status message without proper role", async (t) => {
  const target = <div>Form saved successfully</div>;
  const document = h.document([
    <html>
      <body>
        {target}
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R122, { document }), [
    failed(R122, target, {
      1: Outcomes.HasNoProperRole,
      2: Outcomes.HasNoProperAttributes,
      3: Outcomes.HasAccessibleContent,
    }),
  ]);
});

test("evaluate() fails a status message with invalid aria-live value", async (t) => {
  const target = <div role="status" aria-live="invalid">Status message</div>;
  const document = h.document([
    <html>
      <body>
        {target}
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R122, { document }), [
    failed(R122, target, {
      1: Outcomes.HasProperRole,
      2: Outcomes.HasNoProperAttributes,
      3: Outcomes.HasAccessibleContent,
    }),
  ]);
});

test("evaluate() fails a status message without accessible content", async (t) => {
  const target = <div role="status"></div>;
  const document = h.document([
    <html>
      <body>
        {target}
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R122, { document }), [
    failed(R122, target, {
      1: Outcomes.HasProperRole,
      2: Outcomes.HasProperAttributes,
      3: Outcomes.HasNoAccessibleContent,
    }),
  ]);
});

test("evaluate() passes a status message with aria-label", async (t) => {
  const target = <div role="status" aria-label="Loading status">Please wait</div>;
  const document = h.document([
    <html>
      <body>
        {target}
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R122, { document }), [
    passed(R122, target, {
      1: Outcomes.HasProperRole,
      2: Outcomes.HasProperAttributes,
      3: Outcomes.HasAccessibleContent,
    }),
  ]);
});

test("evaluate() passes a status message with aria-labelledby", async (t) => {
  const target = <div role="status" aria-labelledby="status-label"></div>;
  const document = h.document([
    <html>
      <body>
        <span id="status-label">Current status</span>
        {target}
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R122, { document }), [
    passed(R122, target, {
      1: Outcomes.HasProperRole,
      2: Outcomes.HasProperAttributes,
      3: Outcomes.HasAccessibleContent,
    }),
  ]);
});

test("evaluate() passes a status message with aria-describedby", async (t) => {
  const target = <div role="status" aria-describedby="status-desc"></div>;
  const document = h.document([
    <html>
      <body>
        {target}
        <div id="status-desc">Detailed status information</div>
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R122, { document }), [
    passed(R122, target, {
      1: Outcomes.HasProperRole,
      2: Outcomes.HasProperAttributes,
      3: Outcomes.HasAccessibleContent,
    }),
  ]);
});

test("evaluate() passes a marquee region", async (t) => {
  const target = <div role="marquee" aria-live="polite">Breaking news: Important update</div>;
  const document = h.document([
    <html>
      <body>
        {target}
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R122, { document }), [
    passed(R122, target, {
      1: Outcomes.HasProperRole,
      2: Outcomes.HasProperAttributes,
      3: Outcomes.HasAccessibleContent,
    }),
  ]);
});

test("evaluate() passes a status message with status keywords", async (t) => {
  const target = <div>Loading complete</div>;
  const document = h.document([
    <html>
      <body>
        {target}
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R122, { document }), [
    passed(R122, target, {
      1: Outcomes.HasNoProperRole,
      2: Outcomes.HasNoProperAttributes,
      3: Outcomes.HasAccessibleContent,
    }),
  ]);
});

test("evaluate() passes a status message with error keywords", async (t) => {
  const target = <div>Error: Connection failed</div>;
  const document = h.document([
    <html>
      <body>
        {target}
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R122, { document }), [
    passed(R122, target, {
      1: Outcomes.HasNoProperRole,
      2: Outcomes.HasNoProperAttributes,
      3: Outcomes.HasAccessibleContent,
    }),
  ]);
});

test("evaluate() passes a status message with success keywords", async (t) => {
  const target = <div>Success: Data saved</div>;
  const document = h.document([
    <html>
      <body>
        {target}
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R122, { document }), [
    passed(R122, target, {
      1: Outcomes.HasNoProperRole,
      2: Outcomes.HasNoProperAttributes,
      3: Outcomes.HasAccessibleContent,
    }),
  ]);
});

test("evaluate() is inapplicable to elements without status content", async (t) => {
  const document = h.document([
    <html>
      <body>
        <div>Regular content</div>
        <p>Paragraph text</p>
        <span>Span content</span>
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R122, { document }), [inapplicable(R122)]);
});

test("evaluate() passes a status message with aria-relevant", async (t) => {
  const target = <div aria-live="polite" aria-relevant="additions text">New message received</div>;
  const document = h.document([
    <html>
      <body>
        {target}
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R122, { document }), [
    passed(R122, target, {
      1: Outcomes.HasProperRole,
      2: Outcomes.HasProperAttributes,
      3: Outcomes.HasAccessibleContent,
    }),
  ]);
});
