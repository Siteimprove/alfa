import { Outcome } from "@siteimprove/alfa-act";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R8 } from "../../src/sia-r8/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("Passes when a input has an accessible name", t => {
  const input = <input type="radio" aria-label="foo" />;
  const div = <div role="Radio" aria-label="bar" />;
  const document = documentFromNodes([input, div]);

  outcome(
    t,
    SIA_R8,
    { document, device: getDefaultDevice() },
    // div is only here for non-firefoy browsers, input is here for both.
    // outcome needs to be updated for browser specific values.
    { passed: [input, input, div] }
  );
});

test("Fails when a input has no accessible name", t => {
  const input = <input type="radio" />;
  const document = documentFromNodes([input]);

  outcome(
    t,
    SIA_R8,
    { document, device: getDefaultDevice() },
    { failed: [input] }
  );
});

test("Is inapplicable when element does not have a specific role", t => {
  const div = <div />;
  const document = documentFromNodes([div]);

  outcome(
    t,
    SIA_R8,
    { document, device: getDefaultDevice() },
    Outcome.Inapplicable
  );
});
