import { Outcome } from "@siteimprove/alfa-act";
import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R114, { Outcomes } from "../../dist/sia-r114/rule.js";

import { evaluate } from "../common/evaluate.js";
import { oracle } from "../common/oracle.js";
import { cantTell, failed, inapplicable, passed } from "../common/outcome.js";

const goodTitle = <title>Opening hours</title>;
const goodDocument = h.document([
  <html>
    <head>{goodTitle}</head>
    <body>
      <div>We are open 10:00 to 18:00 daily.</div>
    </body>
  </html>,
]);

const badTitle = <title>Hello world</title>;
const badDocument = h.document([
  <html>
    <head>{badTitle}</head>
    <body>
      <div>We are open 10:00 to 18:00 daily.</div>
    </body>
  </html>,
]);

test("evaluate() passes title describing the content", async (t) => {
  t.deepEqual(
    await evaluate(
      R114,
      { document: goodDocument },
      oracle({ "is-title-descriptive": true }),
    ),
    [
      passed(
        R114,
        goodTitle,
        {
          1: Outcomes.TitleIsDescriptive,
        },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test("evaluate() fails titles who do not describe the content of the document", async (t) => {
  t.deepEqual(
    await evaluate(
      R114,
      { document: badDocument },
      oracle({ "is-title-descriptive": false }),
    ),
    [
      failed(
        R114,
        badTitle,
        { 1: Outcomes.TitleIsNotDescriptive },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test("evaluate() only considers the first title", async (t) => {
  const title = <title>Opening hours</title>;
  const document = h.document([
    <html>
      <head>
        {title}
        <title>Hello</title>
      </head>
      <body>
        <div>We are open 10:00 to 18:00 daily.</div>
      </body>
    </html>,
  ]);

  // The only target is `title`, not the second `<title>`.
  t.deepEqual(
    await evaluate(
      R114,
      { document },
      oracle({ "is-title-descriptive": true }),
    ),
    [
      passed(
        R114,
        title,
        {
          1: Outcomes.TitleIsDescriptive,
        },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test("evaluate() can't tell if questions are left unanswered", async (t) => {
  t.deepEqual(await evaluate(R114, { document: goodDocument }), [
    cantTell(R114, goodTitle),
  ]);
});

test("evaluate() is inapplicable to documents without title", async (t) => {
  const document = h.document([
    <html>
      <div>Some text in English</div>
    </html>,
  ]);

  t.deepEqual(await evaluate(R114, { document }), [inapplicable(R114)]);
});

test("evaluate() is inapplicable if the title contains only whitespace", async (t) => {
  const document = h.document([
    <html>
      <head>
        <title>
          {" "}
          <span> </span>{" "}
        </title>
      </head>
      <body>
        <div>Some text in English</div>
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R114, { document }), [inapplicable(R114)]);
});
