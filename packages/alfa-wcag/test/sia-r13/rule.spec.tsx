import { Outcome } from "@siteimprove/alfa-act";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R13 } from "../../src/sia-r13/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("SIA-R13 passes when an iframe has an accessible name", t => {
  const iframe = <iframe aria-label="foo" />;
  const document = documentFromNodes([iframe]);

  outcome(t, SIA_R13, { document }, { passed: [iframe] });
});

test("SIA-R13 fails when an iframe has no accessible name", t => {
  const iframe = <iframe />;
  const document = documentFromNodes([iframe]);

  outcome(t, SIA_R13, { document }, { failed: [iframe] });
});

test("SIA-R13 is inapplicable when element is not in the accessibility tree", t => {
  const iframe = <iframe aria-hidden="true" />;
  const document = documentFromNodes([iframe]);

  outcome(t, SIA_R13, { document }, Outcome.Inapplicable);
});
