import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom";

import { computed } from "../common.js";

test("initial value is match-source", (t) => {
  t.deepEqual(computed(<div></div>, "mask-mode"), {
    value: {
      type: "list",
      separator: ", ",
      values: [{ type: "keyword", value: "match-source" }],
    },
    source: null,
  });
});

test("#computed parses single keywords", (t) => {
  for (const kw of ["alpha", "luminance", "match-source"] as const) {
    t.deepEqual(computed(<div style={{ maskMode: kw }}></div>, "mask-mode"), {
      value: {
        type: "list",
        separator: ", ",
        values: [{ type: "keyword", value: kw }],
      },
      source: h.declaration("mask-mode", kw).toJSON(),
    });
  }
});
