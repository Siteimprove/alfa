import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { cascaded } from "../common";

test("#cascaded() parses `margin: 1em 50% auto", (t) => {
  const element = <div style={{ margin: "1em 50% auto" }} />;

  t.deepEqual(cascaded(element, "margin-top"), {
    value: {
      type: "length",
      unit: "em",
      value: 1,
    },
    source: h.declaration("margin", "1em 50% auto").toJSON(),
  });

  t.deepEqual(cascaded(element, "margin-right"), {
    value: {
      type: "percentage",
      value: 0.5,
    },
    source: h.declaration("margin", "1em 50% auto").toJSON(),
  });

  t.deepEqual(cascaded(element, "margin-bottom"), {
    value: {
      type: "keyword",
      value: "auto",
    },
    source: h.declaration("margin", "1em 50% auto").toJSON(),
  });

  t.deepEqual(cascaded(element, "margin-left"), {
    value: {
      type: "percentage",
      value: 0.5,
    },
    source: h.declaration("margin", "1em 50% auto").toJSON(),
  });
});
