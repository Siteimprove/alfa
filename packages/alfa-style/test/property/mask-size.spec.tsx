import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom";

import { computed } from "../common.js";

test("initial value is auto", (t) => {
  t.deepEqual(
    computed(
      <div style={{ maskImage: "url(foo.svg), url(bar.svg)" }}></div>,
      "mask-size",
    ),
    {
      value: {
        type: "list",
        separator: ", ",
        values: [
          {
            type: "tuple",
            values: [
              { type: "keyword", value: "auto" },
              { type: "keyword", value: "auto" },
            ],
          },
          {
            type: "tuple",
            values: [
              { type: "keyword", value: "auto" },
              { type: "keyword", value: "auto" },
            ],
          },
        ],
      },
      source: null,
    },
  );
});

test("#computed parses single keywords", (t) => {
  for (const kw of ["cover", "contain"] as const) {
    t.deepEqual(computed(<div style={{ maskSize: kw }}></div>, "mask-size"), {
      value: {
        type: "list",
        separator: ", ",
        values: [{ type: "keyword", value: kw }],
      },
      source: h.declaration("mask-size", kw).toJSON(),
    });
  }
});

test("#computed parses percentage width", (t) => {
  t.deepEqual(computed(<div style={{ maskSize: "50%" }}></div>, "mask-size"), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "tuple",
          values: [
            { type: "percentage", value: 0.5 },
            { type: "percentage", value: 0.5 },
          ],
        },
      ],
    },
    source: h.declaration("mask-size", "50%").toJSON(),
  });
});

test("#computed resolves em width", (t) => {
  t.deepEqual(computed(<div style={{ maskSize: "3em" }}></div>, "mask-size"), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "tuple",
          values: [
            { type: "length", unit: "px", value: 48 },
            { type: "length", unit: "px", value: 48 },
          ],
        },
      ],
    },
    source: h.declaration("mask-size", "3em").toJSON(),
  });
});

test("#computed parses pixel width", (t) => {
  t.deepEqual(computed(<div style={{ maskSize: "12px" }}></div>, "mask-size"), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "tuple",
          values: [
            { type: "length", unit: "px", value: 12 },
            { type: "length", unit: "px", value: 12 },
          ],
        },
      ],
    },
    source: h.declaration("mask-size", "12px").toJSON(),
  });
});

test("#computed parses width and height", (t) => {
  t.deepEqual(
    computed(<div style={{ maskSize: "3em 25%" }}></div>, "mask-size"),
    {
      value: {
        type: "list",
        separator: ", ",
        values: [
          {
            type: "tuple",
            values: [
              { type: "length", unit: "px", value: 48 },
              { type: "percentage", value: 0.25 },
            ],
          },
        ],
      },
      source: h.declaration("mask-size", "3em 25%").toJSON(),
    },
  );
});
