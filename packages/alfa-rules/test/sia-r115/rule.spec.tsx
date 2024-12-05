import { Outcome } from "@siteimprove/alfa-act";
import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R115, { Outcomes } from "../../dist/sia-r115/rule.js";

import { evaluate } from "../common/evaluate.js";
import { oracle } from "../common/oracle.js";
import { cantTell, failed, inapplicable, passed } from "../common/outcome.js";

const goodHeading = <h1>Opening hours</h1>;
const goodDocument = h.document([
  goodHeading,
  <p>We are open 10:00 to 18:00 daily.</p>,
]);

const badHeading = <h1>Hello world</h1>;
const badDocument = h.document([
  badHeading,
  <p>We are open 10:00 to 18:00 daily.</p>,
]);

test("evaluate() passes heading describing the following content", async (t) => {
  t.deepEqual(
    await evaluate(
      R115,
      { document: goodDocument },
      oracle({ "is-heading-descriptive": true }),
    ),
    [
      passed(
        R115,
        goodHeading,
        { 1: Outcomes.HeadingIsDescriptive },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test("evaluate() fails headings who do not describe the following content", async (t) => {
  t.deepEqual(
    await evaluate(
      R115,
      { document: badDocument },
      oracle({ "is-heading-descriptive": false }),
    ),
    [
      failed(
        R115,
        badHeading,
        { 1: Outcomes.HeadingIsNotDescriptive },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test("evaluate() can't tell if questions are left unanswered", async (t) => {
  t.deepEqual(await evaluate(R115, { document: goodDocument }), [
    cantTell(R115, goodHeading),
  ]);
});

test("evaluate() is inapplicable when there is no headings", async (t) => {
  const document = h.document([
    <html>
      <div>Some text in English</div>
    </html>,
  ]);

  t.deepEqual(await evaluate(R115, { document }), [inapplicable(R115)]);
});

test("evaluate() is inapplicable to empty headings", async (t) => {
  const document = h.document([
    <h1>
      {" "}
      <span> </span>{" "}
    </h1>,
    <p>Some text in English</p>,
  ]);

  t.deepEqual(await evaluate(R115, { document }), [inapplicable(R115)]);
});
