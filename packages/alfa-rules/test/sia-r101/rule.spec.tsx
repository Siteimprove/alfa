import { Diagnostic, Outcome } from "@siteimprove/alfa-act";
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

test("evaluate() automatically passes when only a decorative replaced element precedes main", async (t) => {
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

const documentWithBannerThenMain = h.document([
  <html lang="en">
    <head>
      <title>The Three Kingdoms, Chapter 1</title>
    </head>
    <body>
      <img src="banner.png" alt="Site banner" />
      <main>
        <p>Unity succeeds division and division follows unity.</p>
      </main>
    </body>
  </html>,
]);

test("evaluate() can't tell when a non-decorative replaced element precedes main but the question is unanswered", async (t) => {
  t.deepEqual(
    await evaluate(R101, { document: documentWithBannerThenMain }),
    [cantTell(R101, documentWithBannerThenMain)],
  );
});

test("evaluate() passes when oracle says the non-decorative replaced element before main is not repeated content", async (t) => {
  t.deepEqual(
    await evaluate(
      R101,
      { document: documentWithBannerThenMain },
      oracle({ "has-repeated-content-before-main": false }),
    ),
    [
      passed(
        R101,
        documentWithBannerThenMain,
        { 1: Outcomes.HasNoRepeatedContentBeforeMain },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test("evaluate() fails when oracle says the non-decorative replaced element before main is repeated content", async (t) => {
  t.deepEqual(
    await evaluate(
      R101,
      { document: documentWithBannerThenMain },
      oracle({ "has-repeated-content-before-main": true }),
    ),
    [
      failed(
        R101,
        documentWithBannerThenMain,
        { 1: Outcomes.HasRepeatedContentBeforeMain },
        Outcome.Mode.SemiAuto,
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

const articleAsMain = (
  <article>
    <p>Unity succeeds division and division follows unity.</p>
  </article>
);

const documentWithMainContent = h.document([
  <html lang="en">
    <head>
      <title>The Three Kingdoms, Chapter 1</title>
    </head>
    <body>{articleAsMain}</body>
  </html>,
]);

test("evaluate() can't tell when there is no main-role element and the question is unanswered", async (t) => {
  t.deepEqual(await evaluate(R101, { document: documentWithMainContent }), [
    cantTell(R101, documentWithMainContent),
  ]);
});

test("evaluate() passes vacuously when oracle says there are no main landmark elements", async (t) => {
  t.deepEqual(
    await evaluate(
      R101,
      { document: documentWithMainContent },
      oracle({ "main-landmark-elements": [] }),
    ),
    [
      passed(
        R101,
        documentWithMainContent,
        { 1: Outcomes.HasNoMainContent },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test("evaluate() passes when oracle identifies the main element and there is no content before it", async (t) => {
  t.deepEqual(
    await evaluate(
      R101,
      { document: documentWithMainContent },
      oracle({ "main-landmark-elements": [articleAsMain] }),
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

const articleAsMainWithNavBefore = (
  <article>
    <p>Unity succeeds division and division follows unity.</p>
  </article>
);

const documentWithNavThenArticle = h.document([
  <html lang="en">
    <head>
      <title>The Three Kingdoms, Chapter 1</title>
    </head>
    <body>
      <nav>
        <a href="/">Home</a>
      </nav>
      {articleAsMainWithNavBefore}
    </body>
  </html>,
]);

test("evaluate() can't tell when oracle identifies main but repeated-content question is unanswered", async (t) => {
  t.deepEqual(
    await evaluate(
      R101,
      { document: documentWithNavThenArticle },
      oracle({ "main-landmark-elements": [articleAsMainWithNavBefore] }),
    ),
    [cantTell(R101, documentWithNavThenArticle, Diagnostic.empty(), Outcome.Mode.SemiAuto)],
  );
});

test("evaluate() passes when oracle identifies main with content before it and says no repeated content", async (t) => {
  t.deepEqual(
    await evaluate(
      R101,
      { document: documentWithNavThenArticle },
      oracle({
        "main-landmark-elements": [articleAsMainWithNavBefore],
        "has-repeated-content-before-main": false,
      }),
    ),
    [
      passed(
        R101,
        documentWithNavThenArticle,
        { 1: Outcomes.HasNoRepeatedContentBeforeMain },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test("evaluate() fails when oracle identifies main with content before it and says there is repeated content", async (t) => {
  t.deepEqual(
    await evaluate(
      R101,
      { document: documentWithNavThenArticle },
      oracle({
        "main-landmark-elements": [articleAsMainWithNavBefore],
        "has-repeated-content-before-main": true,
      }),
    ),
    [
      failed(
        R101,
        documentWithNavThenArticle,
        { 1: Outcomes.HasRepeatedContentBeforeMain },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test("evaluate() automatically passes when a page has multiple main landmarks and no content precedes the first", async (t) => {
  const documentWithMultipleMains = h.document([
    <html lang="en">
      <head>
        <title>The Three Kingdoms, Chapter 1</title>
      </head>
      <body>
        <main id="main-1">
          <p>Unity succeeds division and division follows unity.</p>
        </main>
        <main id="main-2">
          <p>One realm divides into three parts.</p>
        </main>
      </body>
    </html>,
  ]);

  t.deepEqual(
    await evaluate(R101, { document: documentWithMultipleMains }),
    [
      passed(
        R101,
        documentWithMultipleMains,
        { 1: Outcomes.HasNoRepeatedContentBeforeMain },
        Outcome.Mode.Automatic,
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
