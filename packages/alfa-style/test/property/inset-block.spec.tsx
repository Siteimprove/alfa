import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { cascaded } from "../common";

test("#cascaded() parses `inset-block: 1px 2px", (t) => {
  const element = <div style={{ insetBlock: "1px 2px" }} />;

  t.deepEqual(cascaded(element, "inset-block-start"), {
    value: {
      type: "length",
      unit: "px",
      value: 1,
    },
    source: h.declaration("inset-block", "1px 2px").toJSON(),
  });

  t.deepEqual(cascaded(element, "inset-block-end"), {
    value: {
      type: "length",
      unit: "px",
      value: 2,
    },
    source: h.declaration("inset-block", "1px 2px").toJSON(),
  });
});

test("#cascaded() parses `inset-block: 1px", (t) => {
  const element = <div style={{ insetBlock: "1px" }} />;

  t.deepEqual(cascaded(element, "inset-block-start"), {
    value: {
      type: "length",
      unit: "px",
      value: 1,
    },
    source: h.declaration("inset-block", "1px").toJSON(),
  });

  t.deepEqual(cascaded(element, "inset-block-end"), {
    value: {
      type: "length",
      unit: "px",
      value: 1,
    },
    source: h.declaration("inset-block", "1px").toJSON(),
  });
});
