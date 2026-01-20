import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../dist/style.js";
import { cascaded, color } from "../common.js";

const device = Device.standard();

const red = color(1, 0, 0);

test("#cascaded() parses `background-color: red`", (t) => {
  const element = <div style={{ backgroundColor: "red" }} />;

  t.deepEqual(cascaded(element, "background-color"), {
    value: red,
    source: h.declaration("background-color", "red").toJSON(),
  });
});

test("#computed() resolves `background-color: red`", (t) => {
  const element = <div style={{ backgroundColor: "red" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("background-color").toJSON(), {
    value: red,
    source: h.declaration("background-color", "red").toJSON(),
  });
});
