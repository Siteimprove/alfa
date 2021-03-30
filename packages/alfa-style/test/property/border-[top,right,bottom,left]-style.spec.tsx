import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../src/style";

const device = Device.standard();

for (const side of ["top", "right", "bottom", "left"] as const) {
  const property = `border-${side}-style` as const;

  test(`#cascaded() parses \`${property}: dotted\``, (t) => {
    const element = <div />;

    h.document(
      [element],
      [h.sheet([h.rule.style("div", [h.declaration(property, "dotted")])])]
    );

    const style = Style.from(element, device);

    t.deepEqual(style.cascaded(property).get().toJSON(), {
      value: {
        type: "keyword",
        value: "dotted",
      },
      source: h.declaration(property, "dotted").toJSON(),
    });
  });
}
