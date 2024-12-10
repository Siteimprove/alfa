import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom";

import { computed } from "../common.js";

test("initial value is none", (t) => {
  t.deepEqual(computed(<div></div>, "mask-border-source"), {
    value: {
      type: "keyword",
      value: "none",
    },
    source: null,
  });
});

test("#computed parses url value", (t) => {
  t.deepEqual(
    computed(
      <div style={{ maskBorderSource: "url(foo.svg)" }}></div>,
      "mask-border-source",
    ),
    {
      value: {
        type: "image",
        image: {
          type: "url",
          url: "foo.svg",
        },
      },
      source: h.declaration("mask-border-source", "url(foo.svg)").toJSON(),
    },
  );
});

test("#computed parses linear-gradient value", (t) => {
  t.deepEqual(
    computed(
      <div style={{ maskBorderSource: "linear-gradient(red, blue)" }}></div>,
      "mask-border-source",
    ),
    {
      value: {
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
                type: "color",
                format: "rgb",
                alpha: {
                  type: "percentage",
                  value: 1,
                },
                red: {
                  type: "percentage",
                  value: 1,
                },
                green: {
                  type: "percentage",
                  value: 0,
                },
                blue: {
                  type: "percentage",
                  value: 0,
                },
              },
              position: null,
              type: "stop",
            },
            {
              color: {
                type: "color",
                format: "rgb",
                alpha: {
                  type: "percentage",
                  value: 1,
                },
                red: {
                  type: "percentage",
                  value: 0,
                },
                green: {
                  type: "percentage",
                  value: 0,
                },
                blue: {
                  type: "percentage",
                  value: 1,
                },
              },
              position: null,
              type: "stop",
            },
          ],
          repeats: false,
        },
      },
      source: h
        .declaration("mask-border-source", "linear-gradient(red, blue)")
        .toJSON(),
    },
  );
});
