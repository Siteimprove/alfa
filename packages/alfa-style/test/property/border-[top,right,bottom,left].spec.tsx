import { Device } from "@siteimprove/alfa-device";
import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { Style } from "../../src";

const device = Device.standard();

for (const side of ["top"] as const) {
  const shorthand = `border-${side}` as const;

  test(`#cascaded() parses \`${shorthand}: red\``, (t) => {
    const element = <div />;
    const declaration = h.declaration(shorthand, "red");

    h.document([element], [h.sheet([h.rule.style("div", [declaration])])]);

    const style = Style.from(element, device);

    t.deepEqual(
      style
        .cascaded(`${shorthand}-color` as const)
        .get()
        .toJSON(),
      {
        value: {
          format: "named",
          type: "color",
          color: "red",
        },
        source: declaration.toJSON(),
      }
    );

    t.deepEqual(
      style
        .cascaded(`${shorthand}-style` as const)
        .get()
        .toJSON(),
      {
        value: {
          type: "keyword",
          value: "none",
        },
        source: declaration.toJSON(),
      }
    );

    t.deepEqual(
      style
        .cascaded(`${shorthand}-width` as const)
        .get()
        .toJSON(),
      {
        value: {
          type: "length",
          value: 3,
          unit: "px",
        },
        source: declaration.toJSON(),
      }
    );
  });
}
