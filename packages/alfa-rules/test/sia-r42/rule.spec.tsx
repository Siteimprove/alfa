import { Outcome } from "@siteimprove/alfa-act";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R42 } from "../../src/sia-r42/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("Passes when element with the role of tab has owner with tablist", t => {
  const div = <div role="tab" />;

  const document = documentFromNodes([<div role="tablist">{div}</div>]);

  outcome(
    t,
    SIA_R42,
    { document, device: getDefaultDevice() },
    { passed: [div] }
  );
});

test("Fails when element with the role of tab has no tablist owner", t => {
  const div = <div role="tab" />;

  const document = documentFromNodes([<div>{div}</div>]);

  outcome(
    t,
    SIA_R42,
    { document, device: getDefaultDevice() },
    { failed: [div] }
  );
});

test("Inapplicable when element does not have the semantic role of tab", t => {
  const div = <div role="navigation" />;

  const document = documentFromNodes([<div>{div}</div>]);

  outcome(
    t,
    SIA_R42,
    { document, device: getDefaultDevice() },
    Outcome.Inapplicable
  );
});
