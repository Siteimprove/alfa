import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../src/style";

const device = Device.standard();

test("#computed() resolves `rotate: 90deg`", (t) => {
  const element = <div style={{ rotate: "90deg" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("rotate").toJSON(), {
    value: {
      type: "transform",
      kind: "rotate",
      x: { type: "number", value: 0 },
      y: { type: "number", value: 0 },
      z: { type: "number", value: 1 },
      angle: { type: "angle", value: 90, unit: "deg" },
    },
    source: h.declaration("rotate", "90deg").toJSON(),
  });
});

test("#computed() resolves `rotate: y 180deg`", (t) => {
  const element = <div style={{ rotate: "y 180deg" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("rotate").toJSON(), {
    value: {
      type: "transform",
      kind: "rotate",
      x: { type: "number", value: 0 },
      y: { type: "number", value: 0 },
      z: { type: "number", value: 1 },
      angle: { type: "angle", value: 180, unit: "deg" },
    },
    source: h.declaration("rotate", "y 180deg").toJSON(),
  });
});
