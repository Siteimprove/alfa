import { Outcome } from "@siteimprove/alfa-act";
import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R101, { Outcomes } from "../../src/sia-r101/rule.ts";

import { evaluate } from "../common/evaluate.ts";
import { oracle } from "../common/oracle.ts";
import { cantTell, failed, inapplicable, passed } from "../common/outcome.ts";

test("evaluate() automatically passes when there is no content before the main element", async (t) => {
  const documentWithMainOnly = h.document([
    <html lang="en">
      <head>
        <title>The Three Kingdoms, Chapter 1</title>
      </head>
      <body>
        <main>
          <p>Unity succeeds division and division follows unity.</p>
        </main>
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R101, { document: documentWithMainOnly }), [
    passed(
      R101,
      documentWithMainOnly,
      { 1: Outcomes.HasNoRepeatedContentBeforeMain },
      Outcome.Mode.Automatic,
    ),
  ]);
});

test("evaluate() automatically passes when the only content before main is whitespace-only text", async (t) => {
  const documentWithWhitespaceTextBeforeMain = h.document([
    <html lang="en">
      <head>
        <title>The Three Kingdoms, Chapter 1</title>
      </head>
      <body>
        {h.text(" ")}
        <div role="main">
          <p>Unity succeeds division and division follows unity.</p>
        </div>
      </body>
    </html>,
  ]);

  t.deepEqual(
    await evaluate(R101, {
      document: documentWithWhitespaceTextBeforeMain,
    }),
    [
      passed(
        R101,
        documentWithWhitespaceTextBeforeMain,
        { 1: Outcomes.HasNoRepeatedContentBeforeMain },
        Outcome.Mode.Automatic,
      ),
    ],
  );
});

test("evaluate() automatically passes when a replaced element precedes main", async (t) => {
  const documentWithReplacedElementBeforeMain = h.document([
    <html lang="en">
      <head>
        <title>The Three Kingdoms, Chapter 1</title>
      </head>
      <body>
        <img src="banner.png" alt="" />
        <main>
          <p>Unity succeeds division and division follows unity.</p>
        </main>
      </body>
    </html>,
  ]);

  t.deepEqual(
    await evaluate(R101, {
      document: documentWithReplacedElementBeforeMain,
    }),
    [
      passed(
        R101,
        documentWithReplacedElementBeforeMain,
        { 1: Outcomes.HasNoRepeatedContentBeforeMain },
        Outcome.Mode.Automatic,
      ),
    ],
  );
});

const documentWithAsideThenMain = h.document([
  <html lang="en">
    <head>
      <title>The Three Kingdoms, Chapter 1</title>
    </head>
    <body>
      <aside id="about-book">
        <p>The Romance of the Three Kingdoms is a 14th century novel.</p>
      </aside>
      <main>
        <p>Unity succeeds division and division follows unity.</p>
      </main>
    </body>
  </html>,
]);

test("evaluate() passes when oracle says there is no repeated content before main", async (t) => {
  t.deepEqual(
    await evaluate(
      R101,
      { document: documentWithAsideThenMain },
      oracle({ "has-repeated-content-before-main": false }),
    ),
    [
      passed(
        R101,
        documentWithAsideThenMain,
        { 1: Outcomes.HasNoRepeatedContentBeforeMain },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test("evaluate() fails when oracle says there is repeated content before main", async (t) => {
  t.deepEqual(
    await evaluate(
      R101,
      { document: documentWithAsideThenMain },
      oracle({ "has-repeated-content-before-main": true }),
    ),
    [
      failed(
        R101,
        documentWithAsideThenMain,
        { 1: Outcomes.HasRepeatedContentBeforeMain },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test("evaluate() can't tell when there is content before main but the question is unanswered", async (t) => {
  t.deepEqual(await evaluate(R101, { document: documentWithAsideThenMain }), [
    cantTell(R101, documentWithAsideThenMain),
  ]);
});

const documentWithMainContent = h.document([
  <html lang="en">
    <head>
      <title>The Three Kingdoms, Chapter 1</title>
    </head>
    <body>
      <article>
        <p>Unity succeeds division and division follows unity.</p>
      </article>
    </body>
  </html>,
]);

test("evaluate() can't tell when there is no main-role element and the question is unanswered", async (t) => {
  t.deepEqual(await evaluate(R101, { document: documentWithMainContent }), [
    cantTell(R101, documentWithMainContent),
  ]);
});

test("evaluate() passes when there is no main-role element but oracle says no repeated content", async (t) => {
  t.deepEqual(
    await evaluate(
      R101,
      { document: documentWithMainContent },
      oracle({ "has-repeated-content-before-main": false }),
    ),
    [
      passed(
        R101,
        documentWithMainContent,
        { 1: Outcomes.HasNoRepeatedContentBeforeMain },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test("evaluate() is inapplicable to non-HTML documents", async (t) => {
  const document = h.document([
    <svg xmlns="http://www.w3.org/2000/svg">
      <title>This is an SVG</title>
    </svg>,
  ]);

  t.deepEqual(await evaluate(R101, { document }), [inapplicable(R101)]);
});
