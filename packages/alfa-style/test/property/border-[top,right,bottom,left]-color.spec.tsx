import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../src/style";

const device = Device.standard();

for (const side of ["top", "right", "bottom", "left"] as const) {
  const property = `border-${side}-color` as const;

  test(`#cascaded() parses \`${property}: red\``, (t) => {
    const element = <div />;

    h.document(
      [element],
      [h.sheet([h.rule.style("div", [h.declaration(property, "red")])])]
    );

    const style = Style.from(element, device);

    t.deepEqual(style.cascaded(property).get().toJSON(), {
      value: {
        format: "named",
        type: "color",
        color: "red",
      },
      source: h.declaration(property, "red").toJSON(),
    });
  });

  test(`#computed() resolves \`${property}: red\``, (t) => {
    const element = <div />;

    h.document(
      [element],
      [h.sheet([h.rule.style("div", [h.declaration(property, "red")])])]
    );

    const style = Style.from(element, device);

    t.deepEqual(style.computed(property).toJSON(), {
      value: {
        type: "color",
        format: "rgb",
        red: {
          type: "percentage",
          value: 1,
        },
        green: {
          type: "percentage",
          value: 0,
        },
        blue: {
          type: "percentage",
          value: 0,
        },
        alpha: {
          type: "percentage",
          value: 1,
        },
      },
      source: h.declaration(property, "red").toJSON(),
    });
  });
}
