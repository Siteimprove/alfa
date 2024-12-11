import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom";

import { computed } from "../common.js";

test("initial value is none", (t) => {
  t.deepEqual(computed(<div></div>, "mask-image"), {
    value: {
      type: "list",
      separator: ", ",
      values: [{ type: "keyword", value: "none" }],
    },
    source: null,
  });
});

test("#computed parses url value", (t) => {
  t.deepEqual(
    computed(
      <div style={{ maskImage: "url(masks.svg#mask1)" }}></div>,
      "mask-image",
    ),
    {
      value: {
        type: "list",
        separator: ", ",
        values: [
          { type: "image", image: { type: "url", url: "masks.svg#mask1" } },
        ],
      },
      source: h.declaration("mask-image", "url(masks.svg#mask1)").toJSON(),
    },
  );
});

test("#computed parses linear-gradient value", (t) => {
  t.deepEqual(
    computed(
      <div style={{ maskImage: "linear-gradient(red, blue)" }}></div>,
      "mask-image",
    ),
    {
      value: {
        type: "list",
        separator: ", ",
        values: [
          {
            type: "image",
            image: {
              type: "gradient",
              kind: "linear",
              direction: { type: "side", side: "bottom" },
              items: [
                {
                  color: {
                    type: "color",
                    format: "rgb",
                    alpha: { type: "percentage", value: 1 },
                    red: { type: "percentage", value: 1 },
                    green: { type: "percentage", value: 0 },
                    blue: { type: "percentage", value: 0 },
                  },
                  position: null,
                  type: "stop",
                },
                {
                  color: {
                    type: "color",
                    format: "rgb",
                    alpha: { type: "percentage", value: 1 },
                    red: { type: "percentage", value: 0 },
                    green: { type: "percentage", value: 0 },
                    blue: { type: "percentage", value: 1 },
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
      source: h
        .declaration("mask-image", "linear-gradient(red, blue)")
        .toJSON(),
    },
  );
});
