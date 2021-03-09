import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../src/style";

const device = Device.standard();

test("#cascaded() parses `background-color: red`", (t) => {
  const element = <div style={{ backgroundColor: "red" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("background-color").get().toJSON(), {
    value: {
      type: "color",
      format: "named",
      color: "red",
    },
    source: h.declaration("background-color", "red").toJSON(),
  });
});

test("#computed() resolves `background-color: red`", (t) => {
  const element = <div style={{ backgroundColor: "red" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("background-color").toJSON(), {
    value: {
      type: "color",
      format: "rgb",
      red: {
        type: "percentage",
        value: 1,
      },
      green: {
        type: "percentage",
        value: 0,
      },
      blue: {
        type: "percentage",
        value: 0,
      },
      alpha: {
        type: "percentage",
        value: 1,
      },
    },
    source: h.declaration("background-color", "red").toJSON(),
  });
});
