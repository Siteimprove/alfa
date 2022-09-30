import { h } from "@siteimprove/alfa-dom";
import { Assertions, test } from "@siteimprove/alfa-test";

import { cascaded } from "../common";

function parse(
  t: Assertions,
  value: string,
  side: "top" | "right" | "bottom" | "left",
  color: string,
  style?: "dotted", // the only one used in the tests :-/
  width?: number
): void {
  const shorthand = `border-${side}` as const;

  const element = <div />;
  const declaration = h.declaration(shorthand, value);

  h.document([element], [h.sheet([h.rule.style("div", [declaration])])]);

  t.deepEqual(cascaded(element, `${shorthand}-color` as const), {
    value: {
      format: "named",
      type: "color",
      color: color,
    },
    source: declaration.toJSON(),
  });

  t.deepEqual(cascaded(element, `${shorthand}-style` as const), {
    value: {
      type: "keyword",
      value: style ?? "initial",
    },
    source: declaration.toJSON(),
  });

  t.deepEqual(cascaded(element, `${shorthand}-width` as const), {
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

for (const side of ["top", "right", "bottom", "left"] as const) {
  const shorthand = `border-${side}` as const;

  test(`#cascaded() parses \`${shorthand}: red\``, (t) => {
    parse(t, "red", side, "red");
  });

  test(`#cascaded() parses \`${shorthand}: red dotted\``, (t) => {
    parse(t, "red dotted", side, "red", "dotted");
  });

  test(`#cascaded() parses \`${shorthand}: 2px dotted red\``, (t) => {
    parse(t, "2px dotted red", side, "red", "dotted", 2);
  });
}
