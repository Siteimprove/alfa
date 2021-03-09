import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../src/style";

const device = Device.standard();

test("#cascaded() parses `background-position: left`", (t) => {
  const element = <div style={{ backgroundPosition: `left` }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("background-position-x").get().toJSON(), {
    value: {
      type: "list",
      values: [
        {
          type: "side",
          side: {
            type: "keyword",
            value: "left",
          },
          offset: null,
        },
      ],
      separator: ", ",
    },
    source: h.declaration("background-position", "left").toJSON(),
  });

  t.deepEqual(style.cascaded("background-position-y").get().toJSON(), {
    value: {
      type: "list",
      values: [
        {
          type: "keyword",
          value: "center",
        },
      ],
      separator: ", ",
    },
    source: h.declaration("background-position", "left").toJSON(),
  });
});

test("#cascaded() parses `background-position: top`", (t) => {
  const element = <div style={{ backgroundPosition: `top` }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("background-position-y").get().toJSON(), {
    value: {
      type: "list",
      values: [
        {
          type: "side",
          side: {
            type: "keyword",
            value: "top",
          },
          offset: null,
        },
      ],
      separator: ", ",
    },
    source: h.declaration("background-position", "top").toJSON(),
  });

  t.deepEqual(style.cascaded("background-position-x").get().toJSON(), {
    value: {
      type: "list",
      values: [
        {
          type: "keyword",
          value: "center",
        },
      ],
      separator: ", ",
    },
    source: h.declaration("background-position", "top").toJSON(),
  });
});
