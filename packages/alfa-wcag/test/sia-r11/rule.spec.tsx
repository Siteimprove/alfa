import { Outcome } from "@siteimprove/alfa-act";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R11 } from "../../src/sia-r11/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("SIA-R11 passes when element has a textual accessible name", t => {
  const link = <a href="foo" aria-label="bar" />;
  const document = documentFromNodes([link]);

  outcome(
    t,
    SIA_R11,
    { document, device: getDefaultDevice() },
    { passed: [link] }
  );
});

test("SIA-R11 fails when link has no accessible name", t => {
  const link = <a href="foo" />;
  const document = documentFromNodes([link]);

  outcome(
    t,
    SIA_R11,
    { document, device: getDefaultDevice() },
    { failed: [link] }
  );
});

test("SIA-R11 is inapplicable when element is not in the accessibility tree", t => {
  const link = <a href="foo" aria-hidden="true" />;
  const document = documentFromNodes([link]);

  outcome(
    t,
    SIA_R11,
    { document, device: getDefaultDevice() },
    Outcome.Inapplicable
  );
});
