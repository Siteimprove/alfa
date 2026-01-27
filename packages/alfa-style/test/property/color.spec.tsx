import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../dist/style.js";
import { cascaded, color } from "../common.js";

const device = Device.standard();

const red = color(1, 0, 0);

test("#computed() resolves `color: red`", (t) => {
  const element = <div style={{ color: "red" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("color").toJSON(), {
    value: red,
    source: h.declaration("color", "red").toJSON(),
  });
});

test("#computed() doesn't touch `currentcolor`", (t) => {
  const element = <div style={{ color: "currentcolor" }} />;

  <div style={{ color: "red" }}>{element}</div>;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("color").toJSON(), {
    value: { type: "keyword", value: "currentcolor" },
    source: h.declaration("color", "currentcolor").toJSON(),
  });
});

test("#used() resolves `currentcolor`", (t) => {
  const element = <div style={{ color: "currentcolor" }} />;

  <div style={{ color: "red" }}>{element}</div>;

  const style = Style.from(element, device);

  t.deepEqual(style.used("color").toJSON(), {
    value: red,
    source: h.declaration("color", "currentcolor").toJSON(),
  });
});
