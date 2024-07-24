import { Device } from "@siteimprove/alfa-device";
import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { Style } from "../../dist/index.js";

const device = Device.standard();

test("#computed parses positive integer", (t) => {
  const element = <div style={{ zIndex: "1" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("z-index").toJSON(), {
    value: { type: "integer", value: 1 },
    source: h.declaration("z-index", "1").toJSON(),
  });
});

test("#computed parses positive integer with sign", (t) => {
  const element = <div style={{ zIndex: "+1" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("z-index").toJSON(), {
    value: { type: "integer", value: 1 },
    source: h.declaration("z-index", "+1").toJSON(),
  });
});

test("#computed parses negative integer", (t) => {
  const element = <div style={{ zIndex: "-1" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("z-index").toJSON(), {
    value: { type: "integer", value: -1 },
    source: h.declaration("z-index", "-1").toJSON(),
  });
});

test("#computed resolves to initial value `auto`", (t) => {
  const element = <div />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("z-index").toJSON(), {
    value: { type: "keyword", value: "auto" },
    source: null,
  });
});
