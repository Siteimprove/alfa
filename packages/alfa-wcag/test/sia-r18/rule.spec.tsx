import { Outcome } from "@siteimprove/alfa-act";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R18 } from "../../src/sia-r18/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("SIA-R18 passes when only element has only allowed ARIA-properties", t => {
  const div = <div role="button" aria-pressed="false" />;
  const document = documentFromNodes([div]);

  outcome(
    t,
    SIA_R18,
    { document, device: getDefaultDevice() },
    { passed: [div.attributes[1]] }
  );
});

test("SIA-R18 fails when element has only illegal ARIA-properties", t => {
  const button = <button aria-sort="" />;
  const document = documentFromNodes([button]);

  outcome(
    t,
    SIA_R18,
    { document, device: getDefaultDevice() },
    { failed: [button.attributes[0]] }
  );
});

test("SIA-R18 is inapplicable when element has no ARIA-properties", t => {
  const div = <div role="region" />;
  const document = documentFromNodes([div]);

  outcome(
    t,
    SIA_R18,
    { document, device: getDefaultDevice() },
    Outcome.Inapplicable
  );
});
