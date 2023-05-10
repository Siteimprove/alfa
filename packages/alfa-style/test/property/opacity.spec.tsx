import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../src";

const device = Device.standard();

test("#computed() resolves `opacity: 0.5`", (t) => {
  const element = <div style={{ opacity: "0.5" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("opacity").toJSON(), {
    value: { type: "number", value: 0.5 },
    source: h.declaration("opacity", "0.5").toJSON(),
  });
});

test("#computed() resolves `opacity: 25%`", (t) => {
  const element = <div style={{ opacity: "25%" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("opacity").toJSON(), {
    value: { type: "number", value: 0.25 },
    source: h.declaration("opacity", "25%").toJSON(),
  });
});

test("#computed() resolves `opacity: calc(0.5 + 0.25)`", (t) => {
  const element = <div style={{ opacity: "calc(0.5 + 0.25)" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("opacity").toJSON(), {
    value: { type: "number", value: 0.75 },
    source: h.declaration("opacity", "calc(0.5 + 0.25)").toJSON(),
  });
});
