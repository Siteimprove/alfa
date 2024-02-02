import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";

import { DOM } from "../../../src/index";

test("hasHeadingLevel() returns true when the element has a heading level", (t) => {
  const device = Device.standard();
  const element = <h1 />;

  t.deepEqual(
    DOM.hasHeadingLevel(device, (value) => value === 1)(element),
    true,
  );
});

test("hasHeadingLevel() returns false when the element does not have a heading level", (t) => {
  const device = Device.standard();
  const element = <div />;

  t.deepEqual(
    DOM.hasHeadingLevel(device, (value) => value === 1)(element),
    false,
  );
});

