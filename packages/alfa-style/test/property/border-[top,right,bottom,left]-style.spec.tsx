import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/dist/h";

import { cascaded } from "../common";

for (const side of ["top", "right", "bottom", "left"] as const) {
  const property = `border-${side}-style` as const;

  test(`#cascaded() parses \`${property}: dotted\``, (t) => {
    const element = <div />;

    h.document(
      [element],
      [h.sheet([h.rule.style("div", [h.declaration(property, "dotted")])])],
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

test(`#cascaded() parses \`border-style: dotted\``, (t) => {
  const element = <div />;
  const declaration = h.declaration("border-style", "dotted");

  h.document([element], [h.sheet([h.rule.style("div", [declaration])])]);

  for (const side of ["top", "right", "bottom", "left"] as const) {
    const property = `border-${side}-style` as const;
    t.deepEqual(cascaded(element, property), {
      value: {
        type: "keyword",
        value: "dotted",
      },
      source: declaration.toJSON(),
    });
  }
});

test(`#cascaded() parses \`border-style: dotted dashed solid groove\``, (t) => {
  const element = <div />;
  const declaration = h.declaration(
    "border-style",
    "dotted dashed solid groove",
  );

  h.document([element], [h.sheet([h.rule.style("div", [declaration])])]);

  for (const [side, borderStyle] of [
    ["top", "dotted"],
    ["right", "dashed"],
    ["bottom", "solid"],
    ["left", "groove"],
  ] as const) {
    const property = `border-${side}-style` as const;
    t.deepEqual(cascaded(element, property), {
      value: {
        type: "keyword",
        value: borderStyle,
      },
      source: declaration.toJSON(),
    });
  }
});
