import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";
import { Document } from "@siteimprove/alfa-dom";

import R61, { Outcomes } from "../../src/sia-r61/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

const device = Device.standard();

test("evaluate() passes when the document starts with an explicit level 1 heading", async (t) => {
  const document = Document.of([
    <html>
      <div role="heading" aria-level="1">
        Prefer using heading elements!
      </div>
    </html>,
  ]);

  t.deepEqual(await evaluate(R61, { device, document }), [
    passed(R61, document, { 1: Outcomes.StartWithLevel1Heading }),
  ]);
});

test("evaluate() passes when the document starts with an implicit level 1 heading", async (t) => {
  const document = Document.of([
    <html>
      <h1>Semantic HTML is good</h1>
    </html>,
  ]);

  t.deepEqual(await evaluate(R61, { device, document }), [
    passed(R61, document, { 1: Outcomes.StartWithLevel1Heading }),
  ]);
});

test("evaluate() fails when the document starts with a level 4 heading", async (t) => {
  const document = Document.of([
    <html>
      <h4>Semantic HTML is good</h4>
    </html>,
  ]);

  t.deepEqual(await evaluate(R61, { device, document }), [
    failed(R61, document, { 1: Outcomes.StartWithHigherLevelHeading }),
  ]);
});

test("evaluate() is inapplicable when there is no heading", async (t) => {
  const document = Document.of([
    <html>
      <p>Hello World!</p>
    </html>,
  ]);

  t.deepEqual(await evaluate(R61, { device, document }), [inapplicable(R61)]);
});
