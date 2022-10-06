import { h } from "@siteimprove/alfa-dom";
import { Assertions, test } from "@siteimprove/alfa-test";

import { cascaded } from "../common";

function parse(
  t: Assertions,
  value: string,
  box: "block" | "inline",
  side: "start" | "end",
  color: string,
  style?: "dotted", // the only one used in the tests :-/
  width?: number
): void {
  const shorthand = `border-${box}-${side}` as const;

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

for (const box of ["block", "inline"] as const)
  for (const side of ["start", "end"] as const) {
    const shorthand = `border-${box}-${side}` as const;

    test(`#cascaded() parses \`${shorthand}: red\``, (t) => {
      parse(t, "red", box, side, "red");
    });

    test(`#cascaded() parses \`${shorthand}: red dotted\``, (t) => {
      parse(t, "red dotted", box, side, "red", "dotted");
    });

    test(`#cascaded() parses \`${shorthand}: 2px dotted red\``, (t) => {
      parse(t, "2px dotted red", box, side, "red", "dotted", 2);
    });
  }
