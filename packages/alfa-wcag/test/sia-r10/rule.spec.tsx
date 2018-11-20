import { Outcome } from "@siteimprove/alfa-act";
import { DeviceType, Orientation, Scan } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R10 } from "../../src/sia-r10/rule";

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

test("SIA-R10 passes when autocomplete is set to a known term", t => {
  const input = <input autocomplete="username" />;
  const document = documentFromNodes([input]);

  outcome(t, SIA_R10, { document, device }, { passed: [input.attributes[0]] });
});

test("SIA-R10 fails when autocomplete is not set to a known term", t => {
  const input = <input autocomplete="batman" />;
  const document = documentFromNodes([input]);

  outcome(t, SIA_R10, { document, device }, { failed: [input.attributes[0]] });
});

test("SIA-R10 is inapplicable when no autocomplete attribute is present", t => {
  const input = <input type="text" />;
  const document = documentFromNodes([input]);

  outcome(t, SIA_R10, { document, device }, Outcome.Inapplicable);
});

test("SIA-R10 is inapplicable when element is not a widget", t => {
  const input = <input autocomplete="username" tabindex="-1" role="none" />;
  const document = documentFromNodes([input]);

  outcome(t, SIA_R10, { document, device }, Outcome.Inapplicable);
});
