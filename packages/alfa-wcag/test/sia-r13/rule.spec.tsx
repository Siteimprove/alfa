import { Outcome } from "@siteimprove/alfa-act";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R13 } from "../../src/sia-r13/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("Passes when an iframe has an accessible name", t => {
  const iframe = <iframe aria-label="foo" />;
  const document = documentFromNodes([iframe]);

  outcome(
    t,
    SIA_R13,
    { document, device: getDefaultDevice() },
    { passed: [iframe] }
  );
});

test("Fails when an iframe has no accessible name", t => {
  const iframe = <iframe />;
  const document = documentFromNodes([iframe]);

  outcome(
    t,
    SIA_R13,
    { document, device: getDefaultDevice() },
    { failed: [iframe] }
  );
});

test("Is inapplicable when an iframe has aria-hidden=true", t => {
  const iframe = <iframe aria-hidden="true" />;
  const document = documentFromNodes([iframe]);

  outcome(
    t,
    SIA_R13,
    { document, device: getDefaultDevice() },
    Outcome.Inapplicable
  );
});

test("Is inapplicable when an iframe has role=presentation", t => {
  const iframe = <iframe role="presentation" />;
  const document = documentFromNodes([iframe]);

  outcome(
    t,
    SIA_R13,
    { document, device: getDefaultDevice() },
    Outcome.Inapplicable
  );
});

test("Is inapplicable when an iframe has role=none", t => {
  const iframe = <iframe role="none" />;
  const document = documentFromNodes([iframe]);

  outcome(
    t,
    SIA_R13,
    { document, device: getDefaultDevice() },
    Outcome.Inapplicable
  );
});
