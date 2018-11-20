import { Outcome } from "@siteimprove/alfa-act";
import { DeviceType, Orientation, Scan } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R16 } from "../../src/sia-r16/rule";

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

test("SIA-R16 passes when an element has all required ARIA states and properties", t => {
  const div = <div role="option" aria-selected />;
  const document = documentFromNodes([div]);

  outcome(t, SIA_R16, { document, device }, { passed: [div] });
});

test("SIA-R16 fails when an element is missing required ARIA states and properties", t => {
  const img = <img role="combobox" />;
  const document = documentFromNodes([img]);

  outcome(t, SIA_R16, { document, device }, { failed: [img] });
});

test("SIA-R16 is inapplicable for elements without different explicit and implicit roles", t => {
  const div = <div />;
  const document = documentFromNodes([div]);

  outcome(t, SIA_R16, { document, device }, Outcome.Inapplicable);
});
