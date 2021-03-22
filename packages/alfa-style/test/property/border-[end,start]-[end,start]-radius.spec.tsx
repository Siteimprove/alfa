import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../src/style";

const device = Device.standard();

for (const vertical of ["end", "start"] as const) {
  for (const horizontal of ["end", "start"] as const) {
    const property = `border-${vertical}-${horizontal}-radius` as const;

    test(`#cascaded() parses \`${property}: 10%\``, (t) => {
      const element = <div />;

      h.document(
        [element],
        [h.sheet([h.rule.style("div", [h.declaration(property, "10%")])])]
      );

      const style = Style.from(element, device);

      t.deepEqual(style.cascaded(property).get().toJSON(), {
        value: {
          type: "tuple",
          values: [
            {
              type: "percentage",
              value: 0.1,
            },
            {
              type: "percentage",
              value: 0.1,
            },
          ],
        },
        source: h.declaration(property, "10%").toJSON(),
      });
    });

    test(`#cascaded() parses \`${property}: 10px 10%\``, (t) => {
      const element = <div />;

      h.document(
        [element],
        [h.sheet([h.rule.style("div", [h.declaration(property, "10px 10%")])])]
      );

      const style = Style.from(element, device);

      t.deepEqual(style.cascaded(property).get().toJSON(), {
        value: {
          type: "tuple",
          values: [
            {
              type: "length",
              unit: "px",
              value: 10,
            },
            {
              type: "percentage",
              value: 0.1,
            },
          ],
        },
        source: h.declaration(property, "10px 10%").toJSON(),
      });
    });
  }
}
