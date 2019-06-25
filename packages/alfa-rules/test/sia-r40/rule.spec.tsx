import { Outcome } from "@siteimprove/alfa-act";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R40 } from "../../src/sia-r40/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("Passes when element with the role of region has an accessible name", t => {
  const div = <div role="region" aria-label="Recommendations" />;

  const document = documentFromNodes([<div>{div}</div>]);

  outcome(
    t,
    SIA_R40,
    { document, device: getDefaultDevice() },
    { passed: [div] }
  );
});

test("Fails when element with the role of region has no accessible name", t => {
  const div = <div role="region" />;

  const document = documentFromNodes([<div>{div}</div>]);

  outcome(
    t,
    SIA_R40,
    { document, device: getDefaultDevice() },
    { failed: [div] }
  );
});

test("Inapplicable when element does not have the semantic role of region", t => {
  const div = <div role="navigation" />;

  const document = documentFromNodes([<div>{div}</div>]);

  outcome(
    t,
    SIA_R40,
    { document, device: getDefaultDevice() },
    Outcome.Inapplicable
  );
});
