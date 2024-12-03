import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../dist/index.js";

const device = Device.standard();

test("initial value is none", (t) => {
  const element = <div></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("mask-image").toJSON(), {
    value: {
      type: "list",
      separator: " ",
      values: [
        {
          type: "keyword",
          value: "none",
        },
      ],
    },
    source: null,
  });
});

test("#computed parses url value", (t) => {
  const element = <div style={{ maskImage: "url(masks.svg#mask1)" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("mask-image").toJSON(), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "image",
          image: {
            type: "url",
            url: "masks.svg#mask1",
          },
        },
      ],
    },
    source: h.declaration("mask-image", "url(masks.svg#mask1)").toJSON(),
  });
});

test("#computed parses linear-gradient value", (t) => {
  const element = (
    <div style={{ maskImage: "linear-gradient(red, blue)" }}></div>
  );
  const style = Style.from(element, device);
  t.deepEqual(style.computed("mask-image").toJSON(), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "image",
          image: {
            type: "gradient",
            kind: "linear",
            direction: {
              type: "side",
              side: "bottom",
            },
            items: [
              {
                color: {
                  color: "red",
                  format: "named",
                  type: "color",
                },
                position: null,
                type: "stop",
              },
              {
                color: {
                  color: "blue",
                  format: "named",
                  type: "color",
                },
                position: null,
                type: "stop",
              },
            ],
            repeats: false,
          },
        },
      ],
    },
    source: h.declaration("mask-image", "linear-gradient(red, blue)").toJSON(),
  });
});
