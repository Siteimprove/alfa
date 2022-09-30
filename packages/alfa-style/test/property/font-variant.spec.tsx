import { test } from "@siteimprove/alfa-test";

import { cascaded } from "../common";

test(`#cascaded() parses \`font-variant: oldstyle-nums ruby
     historical-ligatures diagonal-fractions ordinal contextual slashed-zero\``, (t) => {
  const element = (
    <div
      style={{
        "font-variant":
          "oldstyle-nums ruby historical-ligatures diagonal-fractions ordinal contextual slashed-zero",
      }}
    />
  );

  t.deepEqual(cascaded(element, "font-variant-caps").value, {
    type: "keyword",
    value: "initial",
  });

  t.deepEqual(cascaded(element, "font-variant-east-asian").value, {
    type: "list",
    values: [{ type: "keyword", value: "ruby" }],
    separator: " ",
  });

  t.deepEqual(cascaded(element, "font-variant-ligatures").value, {
    type: "list",
    values: [
      { type: "keyword", value: "historical-ligatures" },
      { type: "keyword", value: "contextual" },
    ],
    separator: " ",
  });

  t.deepEqual(cascaded(element, "font-variant-numeric").value, {
    type: "list",
    values: [
      { type: "keyword", value: "oldstyle-nums" },
      { type: "keyword", value: "diagonal-fractions" },
      { type: "keyword", value: "ordinal" },
      { type: "keyword", value: "slashed-zero" },
    ],
    separator: " ",
  });
});
