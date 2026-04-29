import { Outcome } from "@siteimprove/alfa-act";
import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R98, { Outcomes } from "../../src/sia-r98/rule.ts";

import { evaluate } from "../common/evaluate.ts";
import { oracle } from "../common/oracle.ts";
import { cantTell, failed, inapplicable, passed } from "../common/outcome.ts";

const article = (
  <article>
    <h1>Three Heroes Swear Brotherhood at a Feast in the Peach Garden</h1>
    <p>Unity succeeds division and division follows unity.</p>
  </article>
);

const documentWithNoMainRole = h.document([
  <html lang="en">
    <head>
      <title>The Three Kingdoms, Chapter 1</title>
    </head>
    <body>{article}</body>
  </html>,
]);

test("evaluate() automatically passes when main content starts with a visible heading", async (t) => {
  const document = h.document([
    <html lang="en">
      <head>
        <title>The Three Kingdoms, Chapter 1</title>
      </head>
      <body>
        <main>
          <h1>Three Heroes Swear Brotherhood at a Feast in the Peach Garden</h1>
          <p>Unity succeeds division and division follows unity.</p>
        </main>
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R98, { document }), [
    passed(
      R98,
      document,
      { 1: Outcomes.HasHeadingAtStartOfMainContent },
      Outcome.Mode.Automatic,
    ),
  ]);
});

test("evaluate() automatically passes when only the second of two main elements starts with a heading", async (t) => {
  const firstMain = (
    <main id="main-1">
      <p>Unity succeeds division and division follows unity.</p>
    </main>
  );

  const secondMain = (
    <main id="main-2">
      <h1>Three Heroes Swear Brotherhood at a Feast in the Peach Garden</h1>
      <p>One realm divides into three parts.</p>
    </main>
  );

  const document = h.document([
    <html lang="en">
      <head>
        <title>The Three Kingdoms, Chapter 1</title>
      </head>
      <body>
        {firstMain}
        {secondMain}
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R98, { document }), [
    passed(
      R98,
      document,
      { 1: Outcomes.HasHeadingAtStartOfMainContent },
      Outcome.Mode.Automatic,
    ),
  ]);
});

test("evaluate() automatically passes when a decorative image precedes the heading in main", async (t) => {
  // The image has alt="" so it gets role=presentation and is not perceivable
  // content, leaving the h1 as the first perceivable content in main.
  const document = h.document([
    <html lang="en">
      <head>
        <title>The Three Kingdoms, Chapter 1</title>
      </head>
      <body>
        <nav id="chapters-navigation">
          <h1>Content</h1>
          <ol>
            <li>
              <a>Chapter 1</a>
            </li>
          </ol>
        </nav>
        <main>
          <img src="./peach-garden-oath.jpg" alt="" />
          <h1>Three Heroes Swear Brotherhood at a Feast in the Peach Garden</h1>
          <p>
            Unity succeeds division and division follows unity. One is bound to
            be replaced by the other after a long span of time.
          </p>
        </main>
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R98, { document }), [
    passed(
      R98,
      document,
      { 1: Outcomes.HasHeadingAtStartOfMainContent },
      Outcome.Mode.Automatic,
    ),
  ]);
});

test("evaluate() automatically passes when the heading contains an image with alt text", async (t) => {
  const document = h.document([
    <html lang="en">
      <head>
        <title>The Three Kingdoms, Chapter 1</title>
      </head>
      <body>
        <nav id="chapters-navigation">
          <h1>Content</h1>
          <ol>
            <li>
              <a>Chapter 1</a>
            </li>
          </ol>
        </nav>
        <main>
          <h1>
            <img
              src="./peach-garden-oath.jpg"
              alt="Three Heroes Swear Brotherhood at a Feast in the Peach Garden"
            />
          </h1>
          <p>
            Unity succeeds division and division follows unity. One is bound to
            be replaced by the other after a long span of time.
          </p>
        </main>
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R98, { document }), [
    passed(
      R98,
      document,
      { 1: Outcomes.HasHeadingAtStartOfMainContent },
      Outcome.Mode.Automatic,
    ),
  ]);
});

test("evaluate() passes when oracle identifies a landmark element starting with a heading", async (t) => {
  t.deepEqual(
    await evaluate(
      R98,
      { document: documentWithNoMainRole },
      oracle({ "main-landmark-elements": [article] }),
    ),
    [
      passed(
        R98,
        documentWithNoMainRole,
        { 1: Outcomes.HasHeadingAtStartOfMainContent },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test("evaluate() automatically fails when main content has a paragraph before the heading", async (t) => {
  const document = h.document([
    <html lang="en">
      <head>
        <title>The Three Kingdoms, Chapter 1</title>
      </head>
      <body>
        <main>
          <p>Unity succeeds division and division follows unity.</p>
          <h1>Three Heroes Swear Brotherhood at a Feast in the Peach Garden</h1>
        </main>
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R98, { document }), [
    failed(
      R98,
      document,
      { 1: Outcomes.HasNoHeadingAtStartOfMainContent },
      Outcome.Mode.Automatic,
    ),
  ]);
});

test("evaluate() automatically fails when main has a styled <strong> but no heading role", async (t) => {
  const document = h.document([
    <html lang="en">
      <head>
        <title>The Three Kingdoms, Chapter 1</title>
      </head>
      <body>
        <nav id="chapters-navigation">
          <ol>
            <li>
              <a>Chapter 1</a>
            </li>
          </ol>
        </nav>
        <main>
          <strong style={{ "font-size": "18pt" }}>
            Three Heroes Swear Brotherhood at a Feast in the Peach Garden
          </strong>
          <p>
            Unity succeeds division and division follows unity. One is bound to
            be replaced by the other after a long span of time.
          </p>
        </main>
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R98, { document }), [
    failed(
      R98,
      document,
      { 1: Outcomes.HasNoHeadingAtStartOfMainContent },
      Outcome.Mode.Automatic,
    ),
  ]);
});

test("evaluate() automatically fails when main has no heading at all", async (t) => {
  const document = h.document([
    <html lang="en">
      <head>
        <title>The Three Kingdoms, Chapter 1</title>
      </head>
      <body>
        <nav id="chapters-navigation">
          <h1>Content</h1>
          <ol>
            <li>
              <a>Chapter 1</a>
            </li>
          </ol>
        </nav>
        <main>
          <p>
            Unity succeeds division and division follows unity. One is bound to
            be replaced by the other after a long span of time.
          </p>
        </main>
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R98, { document }), [
    failed(
      R98,
      document,
      { 1: Outcomes.HasNoHeadingAtStartOfMainContent },
      Outcome.Mode.Automatic,
    ),
  ]);
});

test("evaluate() fails when oracle says there are no main landmark elements", async (t) => {
  t.deepEqual(
    await evaluate(
      R98,
      { document: documentWithNoMainRole },
      oracle({ "main-landmark-elements": [] }),
    ),
    [
      failed(
        R98,
        documentWithNoMainRole,
        { 1: Outcomes.HasNoMainContent },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test("evaluate() fails when oracle identifies a landmark element with no heading at start", async (t) => {
  const articleWithNoHeading = (
    <article>
      <p>Unity succeeds division and division follows unity.</p>
      <h1>Three Heroes Swear Brotherhood at a Feast in the Peach Garden</h1>
    </article>
  );

  const document = h.document([
    <html lang="en">
      <head>
        <title>The Three Kingdoms, Chapter 1</title>
      </head>
      <body>{articleWithNoHeading}</body>
    </html>,
  ]);

  t.deepEqual(
    await evaluate(
      R98,
      { document },
      oracle({ "main-landmark-elements": [articleWithNoHeading] }),
    ),
    [
      failed(
        R98,
        document,
        { 1: Outcomes.HasNoHeadingAtStartOfMainContent },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test("evaluate() can't tell when there is no main-role element and the question is unanswered", async (t) => {
  t.deepEqual(await evaluate(R98, { document: documentWithNoMainRole }), [
    cantTell(R98, documentWithNoMainRole),
  ]);
});

test("evaluate() is inapplicable to non-HTML documents", async (t) => {
  const document = h.document([
    <svg xmlns="http://www.w3.org/2000/svg">
      <title>This is an SVG</title>
    </svg>,
  ]);

  t.deepEqual(await evaluate(R98, { document }), [inapplicable(R98)]);
});
