import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R60, { Outcomes } from "../../src/sia-r60/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes when the document starts with an explicit level 1 heading", async (t) => {
  const target = h.document(
    <div role="group" aria-labelledby="ssn">
      <span id="ssn">Social Security Number</span>
      <input size="3" type="text" aria-required="true" title="First 3 digits" />
      <input size="2" type="text" aria-required="true" title="Next 2 digits" />
      <input size="4" type="text" aria-required="true" title="Last 4 digits" />
    </div>
  );

  t.deepEqual(await evaluate(R60, { target }), [
    passed(R60, document, {
      1: Outcomes.StartWithLevel1Heading,
    }),
  ]);
});
