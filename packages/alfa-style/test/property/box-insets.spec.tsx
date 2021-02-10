import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";
import { jsx } from "@siteimprove/alfa-dom/jsx";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../src/style";

const device = Device.standard();

test("#cascaded() parses `inset-block: 1px 2px", (t) => {
  const element = <div style={{ insetBlock: "1px 2px" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("inset-block-start").get().toJSON(), {
    value: {
      type: "length",
      unit: "px",
      value: 1,
    },
    source: h.declaration("inset-block", "1px 2px").toJSON(),
  });

  t.deepEqual(style.cascaded("inset-block-end").get().toJSON(), {
    value: {
      type: "length",
      unit: "px",
      value: 2,
    },
    source: h.declaration("inset-block", "1px 2px").toJSON(),
  });
});

test("#cascaded() parses `inset-block: 1px", (t) => {
  const element = <div style={{ insetBlock: "1px" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("inset-block-start").get().toJSON(), {
    value: {
      type: "length",
      unit: "px",
      value: 1,
    },
    source: h.declaration("inset-block", "1px").toJSON(),
  });

  t.deepEqual(style.cascaded("inset-block-end").get().toJSON(), {
    value: {
      type: "length",
      unit: "px",
      value: 1,
    },
    source: h.declaration("inset-block", "1px").toJSON(),
  });
});
