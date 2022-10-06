import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { cascaded } from "../common";

for (const box of ["block", "inline"] as const) {
  for (const side of ["start", "end"] as const) {
    const property = `border-${box}-${side}-style` as const;

    test(`#cascaded() parses \`${property}: dotted\``, (t) => {
      const element = <div />;

      h.document(
        [element],
        [h.sheet([h.rule.style("div", [h.declaration(property, "dotted")])])]
      );

      t.deepEqual(cascaded(element, property), {
        value: {
          type: "keyword",
          value: "dotted",
        },
        source: h.declaration(property, "dotted").toJSON(),
      });
    });
  }
}

for (const box of ["block", "inline"] as const) {
  const shorthand = `border-${box}-style` as const;

  test(`#cascaded parses \`${shorthand}: dotted\``, (t) => {
    const element = <div />;
    const declaration = h.declaration(shorthand, "dotted");

    h.document([element], [h.sheet([h.rule.style("div", [declaration])])]);

    for (const side of ["start", "end"] as const) {
      const property = `border-${box}-${side}-style` as const;

      t.deepEqual(cascaded(element, property), {
        value: {
          type: "keyword",
          value: "dotted",
        },
        source: declaration.toJSON(),
      });
    }
  });

  test(`#cascaded parses \`${shorthand}: dotted solid\``, (t) => {
    const element = <div />;
    const declaration = h.declaration(shorthand, "dotted solid");

    h.document([element], [h.sheet([h.rule.style("div", [declaration])])]);

    for (const [side, borderStyle] of [
      ["start", "dotted"],
      ["end", "solid"],
    ] as const) {
      const property = `border-${box}-${side}-style` as const;

      t.deepEqual(cascaded(element, property), {
        value: {
          type: "keyword",
          value: borderStyle,
        },
        source: declaration.toJSON(),
      });
    }
  });
}
