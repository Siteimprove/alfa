import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../src/style";

const device = Device.standard();

test("#cascaded() parses `text-indent: 5px`", (t) => {
  const element = <div style={{ textIndent: "5px" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("text-indent").get().toJSON(), {
    value: {
      type: "length",
      unit: "px",
      value: 5,
    },
    source: h.declaration("text-indent", "5px").toJSON(),
  });
});
