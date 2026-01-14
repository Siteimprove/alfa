import { h } from "@siteimprove/alfa-dom";
import { type Assertions, test } from "@siteimprove/alfa-test";

import { cascaded, color } from "../common.js";

const colors = { red: color(1, 0, 0) };

function parse(
  t: Assertions,
  value: string,
  color: "red", // the only one used in the tests :-/
  style?: "dotted", // the only one used in the tests :-/
  width?: number,
): void {
  const element = <div />;
  const declaration = h.declaration("border", value);

  h.document([element], [h.sheet([h.rule.style("div", [declaration])])]);

  for (const side of ["top", "right", "bottom", "left"] as const) {
    t.deepEqual(cascaded(element, `border-${side}-color` as const), {
      value: colors[color],
      source: declaration.toJSON(),
    });

    t.deepEqual(cascaded(element, `border-${side}-style` as const), {
      value: {
        type: "keyword",
        value: style ?? "initial",
      },
      source: declaration.toJSON(),
    });

    t.deepEqual(cascaded(element, `border-${side}-width` as const), {
      value: width
        ? {
            type: "length",
            value: width,
            unit: "px",
          }
        : {
            type: "keyword",
            value: "initial",
          },
      source: declaration.toJSON(),
    });
  }
}

test(`#cascaded() parses \`border: red\``, (t) => {
  parse(t, "red", "red");
});

test(`#cascaded() parses \`border: red dotted\``, (t) => {
  parse(t, "red dotted", "red", "dotted");
});

test(`#cascaded() parses \`border: 2px dotted red\``, (t) => {
  parse(t, "2px dotted red", "red", "dotted", 2);
});
