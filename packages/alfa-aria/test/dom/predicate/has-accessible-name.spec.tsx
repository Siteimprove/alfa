import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device/src/device";

// Due to hasAccessibleName depending on Name, we need to make sure everything
// is imported in the correct order. This is enforced by importing DOM from
// the package's top-level, rather than hasAccessibleName from its own file.
import { DOM } from "../../../src/index";

const device = Device.standard();

test("hasAccessibleName() checks presence of an accessible name", (t) => {
  const target = <button>Hello</button>;

  t.deepEqual(
    DOM.hasAccessibleName(device, (name) => name.value === "Hello")(target),
    true
  );
});
