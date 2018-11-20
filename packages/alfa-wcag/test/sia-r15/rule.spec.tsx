import { Outcome } from "@siteimprove/alfa-act";
import { DeviceType, Orientation, Scan } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R15 } from "../../src/sia-r15/rule";

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

test("SIA-R15 passes when an iframe has a unique accessible name", t => {
  const foo = <iframe src="https://foo.bar/baz.html" aria-label="foo" />;
  const bar = <iframe src="https://foo.bar/" aria-label="bar" />;
  const html = (
    <html>
      {foo}
      {bar}
    </html>
  );

  const document = documentFromNodes([html]);

  outcome(t, SIA_R15, { document, device }, { passed: [foo, bar] });
});

test("SIA-R15 fails when an iframe has no unique accessible name", t => {
  const foo = <iframe src="https://foo.bar/baz.html" aria-label="foo" />;
  const bar = <iframe src="https://foo.bar/" aria-label="foo" />;
  const html = (
    <html>
      {foo}
      {bar}
    </html>
  );

  const document = documentFromNodes([html]);

  outcome(t, SIA_R15, { document, device }, { failed: [foo, bar] });
});

test("SIA-R15 is inapplicable when element is not in the accessibility tree", t => {
  const foo = <iframe src="https://foo.bar/baz.html" />;
  const bar = <iframe src="https://foo.bar/" />;
  const html = (
    <html>
      {foo}
      {bar}
    </html>
  );

  const document = documentFromNodes([html]);

  outcome(t, SIA_R15, { document, device }, Outcome.Inapplicable);
});
