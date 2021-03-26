import { Predicate } from "@siteimprove/alfa-predicate";
import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../src/style";

const device = Device.standard();

for (const box of ["block", "inline"] as const) {
  for (const side of ["start", "end"] as const) {
    const property = `border-${box}-${side}-color` as const;

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
}

for (const box of ["block", "inline"] as const) {
  const shorthand = `border-${box}-color` as const;

  test(`#cascaded parses \`${shorthand}: red\``, (t) => {
    const element = <div />;
    const declaration = h.declaration(shorthand, "red");

    h.document([element], [h.sheet([h.rule.style("div", [declaration])])]);

    const style = Style.from(element, device);

    for (const side of ["start", "end"] as const) {
      const property = `border-${box}-${side}-color` as const;

      t.deepEqual(style.cascaded(property).get().toJSON(), {
        value: {
          type: "color",
          format: "named",
          color: "red",
        },
        source: declaration.toJSON(),
      });
    }
  });

  test(`#cascaded parses \`${shorthand}: red blue\``, (t) => {
    const element = <div />;
    const declaration = h.declaration(shorthand, "red blue");

    h.document([element], [h.sheet([h.rule.style("div", [declaration])])]);

    const style = Style.from(element, device);

    for (const [side, color] of [
      ["start", "red"],
      ["end", "blue"],
    ] as const) {
      const property = `border-${box}-${side}-color` as const;

      t.deepEqual(style.cascaded(property).get().toJSON(), {
        value: {
          type: "color",
          format: "named",
          color: color,
        },
        source: declaration.toJSON(),
      });
    }
  });
}
