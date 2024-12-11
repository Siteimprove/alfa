import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom";

import { computed } from "../common.js";

test("initial value is add", (t) => {
  t.deepEqual(computed(<div></div>, "mask-composite"), {
    value: {
      type: "list",
      separator: ", ",
      values: [{ type: "keyword", value: "add" }],
    },
    source: null,
  });
});

test("#computed parses single keywords", (t) => {
  for (const kw of ["add", "subtract", "intersect", "exclude"] as const) {
    t.deepEqual(
      computed(<div style={{ maskComposite: kw }}></div>, "mask-composite"),
      {
        value: {
          type: "list",
          separator: ", ",
          values: [{ type: "keyword", value: kw }],
        },
        source: h.declaration("mask-composite", kw).toJSON(),
      },
    );
  }
});
