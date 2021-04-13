import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../src/style";

const device = Device.standard();

for (const box of ["block", "inline"] as const) {
  for (const side of ["start", "end"] as const) {
    const property = `border-${box}-${side}-width` as const;

    test(`#cascaded() parses \`${property}: medium\``, (t) => {
      const element = <div />;

      h.document(
        [element],
        [h.sheet([h.rule.style("div", [h.declaration(property, "medium")])])]
      );

      const style = Style.from(element, device);

      t.deepEqual(style.cascaded(property).get().toJSON(), {
        value: {
          type: "keyword",
          value: "medium",
        },
        source: h.declaration(property, "medium").toJSON(),
      });
    });

    test(`#cascaded() parses \`${property}: 1.2em\``, (t) => {
      const element = <div />;

      h.document(
        [element],
        [h.sheet([h.rule.style("div", [h.declaration(property, "1.2em")])])]
      );

      const style = Style.from(element, device);

      t.deepEqual(style.cascaded(property).get().toJSON(), {
        value: {
          type: "length",
          unit: "em",
          value: 1.2,
        },
        source: h.declaration(property, "1.2em").toJSON(),
      });
    });

    test(`#computed() resolves \`${property}: 1.2em; border-${box}-${side}-style: none\``, (t) => {
      const element = <div />;

      h.document(
        [element],
        [
          h.sheet([
            h.rule.style("div", [
              h.declaration(property, "1.2em"),
              h.declaration(`border-${box}-${side}-style`, "none"),
            ]),
          ]),
        ]
      );

      const style = Style.from(element, device);

      t.deepEqual(style.computed(property).toJSON(), {
        value: {
          type: "length",
          unit: "px",
          value: 0,
        },
        source: h.declaration(property, "1.2em").toJSON(),
      });
    });
  }
}

for (const box of ["block", "inline"] as const) {
  const shorthand = `border-${box}-width` as const;

  test(`#cascaded parses \`${shorthand}: medium\``, (t) => {
    const element = <div />;
    const declaration = h.declaration(shorthand, "medium");

    h.document([element], [h.sheet([h.rule.style("div", [declaration])])]);

    const style = Style.from(element, device);

    for (const side of ["start", "end"] as const) {
      const property = `border-${box}-${side}-width` as const;

      t.deepEqual(style.cascaded(property).get().toJSON(), {
        value: {
          type: "keyword",
          value: "medium",
        },
        source: declaration.toJSON(),
      });
    }
  });

  test(`#cascaded parses \`${shorthand}: medium thin\``, (t) => {
    const element = <div />;
    const declaration = h.declaration(shorthand, "medium thin");

    h.document([element], [h.sheet([h.rule.style("div", [declaration])])]);

    const style = Style.from(element, device);

    for (const [side, width] of [
      ["start", "medium"],
      ["end", "thin"],
    ] as const) {
      const property = `border-${box}-${side}-width` as const;

      t.deepEqual(style.cascaded(property).get().toJSON(), {
        value: {
          type: "keyword",
          value: width,
        },
        source: declaration.toJSON(),
      });
    }
  });
}
