import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom";

import { computed } from "../common.js";

test("initial value is none", (t) => {
  t.deepEqual(computed(<div></div>, "mask-border-slice"), {
    value: {
      type: "tuple",
      values: [
        { type: "number", value: 0 },
        { type: "number", value: 0 },
        { type: "number", value: 0 },
        { type: "number", value: 0 },
      ],
    },
    source: null,
  });
});

test("#computed parses one value", (t) => {
  t.deepEqual(
    computed(
      <div style={{ maskBorderSlice: "30%" }}></div>,
      "mask-border-slice",
    ),
    {
      value: {
        type: "tuple",
        values: [
          { type: "percentage", value: 0.3 },
          { type: "percentage", value: 0.3 },
          { type: "percentage", value: 0.3 },
          { type: "percentage", value: 0.3 },
        ],
      },
      source: h.declaration("mask-border-slice", "30%").toJSON(),
    },
  );
});

test("#computed parses two values", (t) => {
  t.deepEqual(
    computed(
      <div style={{ maskBorderSlice: "10% 30%" }}></div>,
      "mask-border-slice",
    ),
    {
      value: {
        type: "tuple",
        values: [
          { type: "percentage", value: 0.1 },
          { type: "percentage", value: 0.3 },
          { type: "percentage", value: 0.1 },
          { type: "percentage", value: 0.3 },
        ],
      },
      source: h.declaration("mask-border-slice", "10% 30%").toJSON(),
    },
  );
});

test("#computed parses three values", (t) => {
  t.deepEqual(
    computed(
      <div style={{ maskBorderSlice: "30 30% 45" }}></div>,
      "mask-border-slice",
    ),
    {
      value: {
        type: "tuple",
        values: [
          { type: "number", value: 30 },
          { type: "percentage", value: 0.3 },
          { type: "number", value: 45 },
          { type: "percentage", value: 0.3 },
        ],
      },
      source: h.declaration("mask-border-slice", "30 30% 45").toJSON(),
    },
  );
});

test("#computed parses four values", (t) => {
  t.deepEqual(
    computed(
      <div style={{ maskBorderSlice: "7 12 14 5" }}></div>,
      "mask-border-slice",
    ),
    {
      value: {
        type: "tuple",
        values: [
          { type: "number", value: 7 },
          { type: "number", value: 12 },
          { type: "number", value: 14 },
          { type: "number", value: 5 },
        ],
      },
      source: h.declaration("mask-border-slice", "7 12 14 5").toJSON(),
    },
  );
});

test("#computed parses the `fill` keyword", (t) => {
  t.deepEqual(
    computed(
      <div style={{ maskBorderSlice: "10 fill 7 12" }}></div>,
      "mask-border-slice",
    ),
    {
      value: {
        type: "tuple",
        values: [
          { type: "number", value: 10 },
          { type: "number", value: 7 },
          { type: "number", value: 12 },
          { type: "number", value: 7 },
          { type: "keyword", value: "fill" },
        ],
      },
      source: h.declaration("mask-border-slice", "10 fill 7 12").toJSON(),
    },
  );
});
