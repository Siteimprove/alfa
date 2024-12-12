import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom";

import { computed } from "../common.js";

test("initial value is border-box", (t) => {
  t.deepEqual(computed(<div></div>, "mask-origin"), {
    value: {
      type: "list",
      separator: ", ",
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
  ] as const) {
    t.deepEqual(
      computed(<div style={{ maskOrigin: kw }}></div>, "mask-origin"),
      {
        value: {
          type: "list",
          separator: ", ",
          values: [{ type: "keyword", value: kw }],
        },
        source: h.declaration("mask-origin", kw).toJSON(),
      },
    );
  }
});
