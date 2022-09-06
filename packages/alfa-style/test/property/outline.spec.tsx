import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../src/style";

const device = Device.standard();

test("#computed() resolves `outline-offset: calc(1em + 2px)`", (t) => {
  const element = <div style={{ outlineOffset: "calc(1em + 2px)" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("outline-offset").toJSON(), {
    value: {
      type: "length",
      value: 18,
      unit: "px",
    },
    source: h.declaration("outline-offset", "calc(1em + 2px)").toJSON(),
  });
});

test("#computed() rejects `outline-offset: calc(1 + 2)`", (t) => {
  const element = <div style={{ outlineOffset: "calc(1 + 2)" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("outline-offset").toJSON(), {
    // initial value
    value: {
      type: "length",
      value: 0,
      unit: "px",
    },
    source: null,
  });
});
