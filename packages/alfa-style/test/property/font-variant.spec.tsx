import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../src/style";

const device = Device.standard();

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

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("font-variant-caps").get().value.toJSON(), {
    type: "keyword",
    value: "initial",
  });

  t.deepEqual(style.cascaded("font-variant-east-asian").get().value.toJSON(), {
    type: "list",
    values: [{ type: "keyword", value: "ruby" }],
    separator: " ",
  });

  t.deepEqual(style.cascaded("font-variant-ligatures").get().value.toJSON(), {
    type: "list",
    values: [
      { type: "keyword", value: "historical-ligatures" },
      { type: "keyword", value: "contextual" },
    ],
    separator: " ",
  });

  t.deepEqual(style.cascaded("font-variant-numeric").get().value.toJSON(), {
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
