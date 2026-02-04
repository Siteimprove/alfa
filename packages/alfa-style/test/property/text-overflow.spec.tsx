import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { used } from "../common.js";

test(".used() returns the computed value for a block element", (t) => {
  for (const value of ["clip", "ellipsis"] as const) {
    const target = <div style={{ textOverflow: value }}></div>;
    h.document([target]);

    t.deepEqual(used(target, "text-overflow"), {
      value: {
        type: "some",
        value: { type: "keyword", value },
      },
      source: { name: "text-overflow", value, important: false },
    });
  }
});

test(".used() returns None for a line element", (t) => {
  for (const value of ["clip", "ellipsis"] as const) {
    const target = <span style={{ textOverflow: value }}></span>;
    h.document([target]);

    t.deepEqual(used(target, "text-overflow"), {
      value: { type: "none" },
      source: { name: "text-overflow", value, important: false },
    });
  }
});
