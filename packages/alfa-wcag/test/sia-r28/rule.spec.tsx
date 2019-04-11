import { Outcome } from "@siteimprove/alfa-act";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R28 } from "../../src/sia-r28/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("Passes when image button element has an accessible name", t => {
  const button = (
    <input type="image" name="submit" src="foo.gif" alt="Submit" />
  );
  const document = documentFromNodes([button]);

  outcome(
    t,
    SIA_R28,
    { document, device: getDefaultDevice() },
    { passed: [button] }
  );
});

test("Fails when image button element has no accessible name", t => {
  const button = <input type="image" name="submit" src="foo.gif" />;
  const document = documentFromNodes([button]);

  outcome(
    t,
    SIA_R28,
    { document, device: getDefaultDevice() },
    { failed: [button] }
  );
});

test("Inapplicable when image button element is not of type input", t => {
  const img = <img src="foo.gif" />;
  const document = documentFromNodes([img]);

  outcome(
    t,
    SIA_R28,
    { document, device: getDefaultDevice() },
    Outcome.Inapplicable
  );
});
