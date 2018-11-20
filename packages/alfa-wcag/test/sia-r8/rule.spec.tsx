import { Outcome } from "@siteimprove/alfa-act";
import { DeviceType, Orientation, Scan } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R8 } from "../../src/sia-r8/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

const device = {
  type: DeviceType.Screen,
  viewport: {
    width: 1920,
    height: 1080,
    orientation: Orientation.Landscape
  },
  display: {
    resolution: 1,
    scan: Scan.Progressive
  }
};

test("SIA-R8 passes when a input has an accessible name", t => {
  const input = <input type="radio" aria-label="foo" />;
  const document = documentFromNodes([input]);

  outcome(t, SIA_R8, { document, device }, { passed: [input] });
});

test("SIA-R8 fails when a input has no accessible name", t => {
  const input = <input type="radio" />;
  const document = documentFromNodes([input]);

  outcome(t, SIA_R8, { document, device }, { failed: [input] });
});

test("SIA-R8 is inapplicable when element does not have a specific role", t => {
  const div = <div />;
  const document = documentFromNodes([div]);

  outcome(t, SIA_R8, { document, device }, Outcome.Inapplicable);
});
