import { Outcome } from "@siteimprove/alfa-act";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R20 } from "../../src/sia-r20/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("SIA-R20 passes when aria attributes specified is defined in ARIA 1.1", t => {
  const div = (
    <div role="alert" aria-live="assertive">
      Your session will expire in 60 seconds.
    </div>
  );

  const document = documentFromNodes([div]);

  outcome(
    t,
    SIA_R20,
    { document },
    {
      passed: [div.attributes[1]]
    }
  );
});

test("SIA-R20 fails when aria attributes specified is not defined in ARIA 1.1", t => {
  const div = (
    <div
      contenteditable
      role="searchbox"
      aria-labelled="label"
      aria-placeholder="MM-DD-YYYY"
    >
      01-01-2019
    </div>
  );

  const document = documentFromNodes([div]);

  outcome(
    t,
    SIA_R20,
    { document },
    {
      passed: [div.attributes[3]],
      failed: [div.attributes[2]]
    }
  );
});

test("SIA-R19 is inapplicable when an element does not have any aria attributes", t => {
  const div = <div>Some Content</div>;
  const document = documentFromNodes([div]);

  outcome(t, SIA_R20, { document }, Outcome.Inapplicable);
});
