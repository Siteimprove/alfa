import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R61, { Outcomes } from "../../src/sia-r61/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes when the document starts with an explicit level 1 heading", async (t) => {
  const heading = (
    <div role="heading" aria-level="1">
      Prefer using heading elements!
    </div>
  );

  const document = h.document([<html>{heading}</html>]);

  t.deepEqual(await evaluate(R61, { document }), [
    passed(R61, document, {
      1: Outcomes.StartWithLevel1Heading(heading, 1),
    }),
  ]);
});

test("evaluate() passes when the document starts with an implicit level 1 heading", async (t) => {
  const heading = <h1>Semantic HTML is good</h1>;
  const document = h.document([<html>{heading}</html>]);

  t.deepEqual(await evaluate(R61, { document }), [
    passed(R61, document, {
      1: Outcomes.StartWithLevel1Heading(heading, 1),
    }),
  ]);
});

test("evaluate() fails when the document starts with a level 4 heading", async (t) => {
  const heading = <h4>Semantic HTML is good</h4>;
  const document = h.document([<html>{heading}</html>]);

  t.deepEqual(await evaluate(R61, { document }), [
    failed(R61, document, {
      1: Outcomes.StartWithHigherLevelHeading(heading, 4),
    }),
  ]);
});

test("evaluate() is inapplicable when there is no heading", async (t) => {
  const document = h.document([
    <html>
      <p>Hello World!</p>
    </html>,
  ]);

  t.deepEqual(await evaluate(R61, { document }), [inapplicable(R61)]);
});

test("evaluate() skips headings that are not exposed to assistive technologies", async (t) => {
  const heading = <h1>Now you can.</h1>;

  const document = h.document([
    <html>
      <h2 aria-hidden="true">Now you can't see me</h2>
      {heading}
    </html>,
  ]);

  t.deepEqual(await evaluate(R61, { document }), [
    passed(R61, document, { 1: Outcomes.StartWithLevel1Heading(heading, 1) }),
  ]);
});
