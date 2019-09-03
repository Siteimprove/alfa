import { Outcome } from "@siteimprove/alfa-act";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R12 } from "../../src/sia-r12/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("Passes when a button has an accessible name", t => {
  const input = <input type="button" aria-label="foo" />;
  const document = documentFromNodes([input]);

  outcome(
    t,
    SIA_R12,
    { document, device: getDefaultDevice() },
    { passed: [input] }
  );
});

test("Fails when a button has no accessible name", t => {
  const input = <input type="button" />;
  const document = documentFromNodes([input]);

  outcome(
    t,
    SIA_R12,
    { document, device: getDefaultDevice() },
    { failed: [input] }
  );
});

test("Is inapplicable when element is not in the accessibility tree", t => {
  const input = <input type="button" aria-hidden="true" />;
  const document = documentFromNodes([input]);

  outcome(
    t,
    SIA_R12,
    { document, device: getDefaultDevice() },
    Outcome.Inapplicable
  );
});
