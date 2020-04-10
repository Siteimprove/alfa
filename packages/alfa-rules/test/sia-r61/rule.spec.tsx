import { Device } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document, Element } from "@siteimprove/alfa-dom";

import R61, { Outcomes } from "../../src/sia-r61/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

const device = Device.standard();

test("Passes when document starts with an explicit level 1 heading", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <html>
        <div role="heading" aria-level="1">
          Prefer using heading elements!
        </div>
      </html>
    ),
  ]);

  t.deepEqual(await evaluate(R61, { device, document }), [
    passed(R61, document, [["1", Outcomes.StartWithLevel1Heading]]),
  ]);
});

test("Passes when document starts with an implicit level 1 heading", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <html>
        <h1>Semantic HTML is good</h1>
      </html>
    ),
  ]);

  t.deepEqual(await evaluate(R61, { device, document }), [
    passed(R61, document, [["1", Outcomes.StartWithLevel1Heading]]),
  ]);
});
