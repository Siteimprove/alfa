import { h } from "@siteimprove/alfa-dom/h";
import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";

// Due to hasRole depending on Role, we need to make sure everything
// is imported in the correct order. This is enforced by importing DOM from
// the package's top-level, rather than hasRole from its own file.
import { DOM } from "../../../src/index";

const device = Device.standard();

test(`hasRole() respects presentational children`, (t) => {
  const target = <a href="#">Foo</a>;
  const tab = <div role="tab">{target}</div>;

  h.document([tab]);

  t.deepEqual(DOM.hasRole(device, "link")(target), false);
});
