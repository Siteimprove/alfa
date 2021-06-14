import { h } from "@siteimprove/alfa-dom/h";
import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";
import { hasRole } from "../../../src/common/predicate/has-role";

const device = Device.standard();

test(`hasRole() respects presentational children`, (t) => {
  const target = <a href="#">Foo</a>;
  const tab = <div role="tab">{target}</div>;

  h.document([tab]);

  t.deepEqual(hasRole(device, "link")(target), false);
});
