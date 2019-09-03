import { Outcome } from "@siteimprove/alfa-act";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R17 } from "../../src/sia-r17/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("Passes when no descendants of a hidden element are focusable", t => {
  const button = <button disabled="true" />;
  const div = <div aria-hidden="true">{button}</div>;
  const document = documentFromNodes([div]);

  outcome(
    t,
    SIA_R17,
    { document, device: getDefaultDevice() },
    { passed: [div] }
  );
});

test("Fails when some descendants of a hidden element are focusable", t => {
  const button = <button />;
  const div = <div aria-hidden="true">{button}</div>;
  const document = documentFromNodes([div]);

  outcome(
    t,
    SIA_R17,
    { document, device: getDefaultDevice() },
    { failed: [div] }
  );
});

test("Is inapplicable if root element is not hidden in the accessibility tree", t => {
  const button = <button />;
  const div = <div>{button}</div>;
  const document = documentFromNodes([div]);

  outcome(
    t,
    SIA_R17,
    { document, device: getDefaultDevice() },
    Outcome.Inapplicable
  );
});
