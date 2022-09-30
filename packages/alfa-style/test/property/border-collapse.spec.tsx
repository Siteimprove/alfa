import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { cascaded } from "../common";

test("#cascaded() parses `border-collapse: separate`", (t) => {
  const element = (
    <table
      style={{
        borderCollapse: "separate",
      }}
    />
  );

  t.deepEqual(cascaded(element, "border-collapse"), {
    value: {
      type: "keyword",
      value: "separate",
    },
    source: h.declaration("border-collapse", "separate").toJSON(),
  });
});
