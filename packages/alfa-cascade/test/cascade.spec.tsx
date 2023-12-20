import { Device } from "@siteimprove/alfa-device";
import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { Cascade } from "../src";

test(".from() builds a cascade with the User Agent style sheet", (t) => {
  const document = h.document([<div>Hello</div>]);

  const device = Device.standard();
  const cascade = Cascade.from(document, device);

  t.deepEqual(cascade.toJSON().rules.length, 58);
});
