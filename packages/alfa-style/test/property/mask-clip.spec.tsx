import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom";

import { computed } from "../common.js";

test("initial value is border-box", (t) => {
  t.deepEqual(computed(<div></div>, "mask-clip"), {
    value: {
      type: "list",
      separator: " ",
      values: [{ type: "keyword", value: "border-box" }],
    },
    source: null,
  });
});

test("#computed parses single keywords", (t) => {
  for (const kw of [
    "content-box",
    "padding-box",
    "border-box",
    "fill-box",
    "stroke-box",
    "view-box",
    "no-clip",
  ] as const) {
    t.deepEqual(computed(<div style={{ maskClip: kw }}></div>, "mask-clip"), {
      value: {
        type: "list",
        separator: ", ",
        values: [{ type: "keyword", value: kw }],
      },
      source: h.declaration("mask-clip", kw).toJSON(),
    });
  }
});

test("#computed parses multiple layers", (t) => {
  t.deepEqual(
    computed(
      <div
        style={{
          maskImage: "url(foo.svg), url(bar.svg)",
          maskClip: "padding-box, no-clip",
        }}
      ></div>,
      "mask-clip",
    ),
    {
      value: {
        type: "list",
        separator: ", ",
        values: [
          { type: "keyword", value: "padding-box" },
          { type: "keyword", value: "no-clip" },
        ],
      },
      source: h.declaration("mask-clip", "padding-box, no-clip").toJSON(),
    },
  );
});

test("#computed discards excess values when there are more values than layers", (t) => {
  t.deepEqual(
    computed(
      <div
        style={{
          maskImage: "url(foo.svg), url(bar.svg)",
          maskClip: "view-box, fill-box, border-box",
        }}
      ></div>,
      "mask-clip",
    ),
    {
      value: {
        type: "list",
        separator: ", ",
        values: [
          { type: "keyword", value: "view-box" },
          { type: "keyword", value: "fill-box" },
        ],
      },
      source: h
        .declaration("mask-clip", "view-box, fill-box, border-box")
        .toJSON(),
    },
  );
});

test("#computed repeats values when there are more layers than values", (t) => {
  t.deepEqual(
    computed(
      <div
        style={{
          maskImage: "url(foo.svg), url(bar.svg), url(baz.svg)",
          maskClip: "view-box, fill-box",
        }}
      ></div>,
      "mask-clip",
    ),
    {
      value: {
        type: "list",
        separator: ", ",
        values: [
          { type: "keyword", value: "view-box" },
          { type: "keyword", value: "fill-box" },
          { type: "keyword", value: "view-box" },
        ],
      },
      source: h.declaration("mask-clip", "view-box, fill-box").toJSON(),
    },
  );
});
