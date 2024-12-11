import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom";

import { computed } from "../common.js";

test("initial value is 0% 0%", (t) => {
  t.deepEqual(computed(<div></div>, "mask-position"), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "position",
          horizontal: {
            type: "side",
            side: { type: "keyword", value: "left" },
            offset: { type: "percentage", value: 0 },
          },
          vertical: {
            type: "side",
            side: { type: "keyword", value: "top" },
            offset: { type: "percentage", value: 0 },
          },
        },
      ],
    },
    source: null,
  });
});

// TODO: The spec requires the computed value to be two lengths or percentages, not a keyword value.
// E.g. the keyword `left` should be computes to `0% 50%` in Chrome and Firefox.
test("#computed parses single keywords", (t) => {
  for (const kw of ["top", "bottom"] as const) {
    t.deepEqual(
      computed(<div style={{ maskPosition: kw }}></div>, "mask-position"),
      {
        value: {
          type: "list",
          separator: ", ",
          values: [
            {
              type: "position",
              horizontal: { type: "keyword", value: "center" },
              vertical: {
                type: "side",
                offset: null,
                side: { type: "keyword", value: kw },
              },
            },
          ],
        },
        source: h.declaration("mask-position", kw).toJSON(),
      },
    );
  }

  for (const kw of ["left", "right"] as const) {
    t.deepEqual(
      computed(<div style={{ maskPosition: kw }}></div>, "mask-position"),
      {
        value: {
          type: "list",
          separator: ", ",
          values: [
            {
              type: "position",
              vertical: { type: "keyword", value: "center" },
              horizontal: {
                type: "side",
                offset: null,
                side: { type: "keyword", value: kw },
              },
            },
          ],
        },
        source: h.declaration("mask-position", kw).toJSON(),
      },
    );
  }

  t.deepEqual(
    computed(<div style={{ maskPosition: "center" }}></div>, "mask-position"),
    {
      value: {
        type: "list",
        separator: ", ",
        values: [
          {
            type: "position",
            vertical: { type: "keyword", value: "center" },
            horizontal: { type: "keyword", value: "center" },
          },
        ],
      },
      source: h.declaration("mask-position", "center").toJSON(),
    },
  );
});

test("#computed parses lengths and percentages", (t) => {
  t.deepEqual(
    computed(<div style={{ maskPosition: "10% 3em" }}></div>, "mask-position"),
    {
      value: {
        type: "list",
        separator: ", ",
        values: [
          {
            type: "position",
            horizontal: {
              type: "side",
              offset: { type: "percentage", value: 0.1 },
              side: { type: "keyword", value: "left" },
            },
            vertical: {
              type: "side",
              offset: { type: "length", unit: "px", value: 48 },
              side: { type: "keyword", value: "top" },
            },
          },
        ],
      },
      source: h.declaration("mask-position", "10% 3em").toJSON(),
    },
  );
});
