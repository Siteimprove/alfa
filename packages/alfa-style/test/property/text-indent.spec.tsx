import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { cascaded } from "../common";

test("#cascaded() parses `text-indent: 5px`", (t) => {
  const element = <div style={{ textIndent: "5px" }} />;

  t.deepEqual(cascaded(element, "text-indent"), {
    value: {
      type: "length",
      unit: "px",
      value: 5,
    },
    source: h.declaration("text-indent", "5px").toJSON(),
  });
});
