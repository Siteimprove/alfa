import { h } from "@siteimprove/alfa-dom";
import { type Assertions, test } from "@siteimprove/alfa-test";

import { cascaded, color } from "../common.js";

const colors = { red: color(1, 0, 0) };

function parse(
  t: Assertions,
  value: string,
  box: "block" | "inline",
  color: "red", // the only one used in the tests :-/
  style?: "dotted", // the only one used in the tests :-/
  width?: number,
): void {
  const shorthand = `border-${box}` as const;

  const element = <div />;
  const declaration = h.declaration(shorthand, value);

  h.document([element], [h.sheet([h.rule.style("div", [declaration])])]);

  for (const side of ["start", "end"] as const) {
    t.deepEqual(cascaded(element, `${shorthand}-${side}-color` as const), {
      value: colors[color],
      source: declaration.toJSON(),
    });

    t.deepEqual(cascaded(element, `${shorthand}-${side}-style` as const), {
      value: { type: "keyword", value: style ?? "initial" },
      source: declaration.toJSON(),
    });

    t.deepEqual(cascaded(element, `${shorthand}-${side}-width` as const), {
      value: width
        ? { type: "length", value: width, unit: "px" }
        : { type: "keyword", value: "initial" },
      source: declaration.toJSON(),
    });
  }
}

for (const box of ["block", "inline"] as const) {
  const shorthand = `border-${box}` as const;

  test(`#cascaded() parses \`${shorthand}: red\``, (t) => {
    parse(t, "red", box, "red");
  });

  test(`#cascaded() parses \`${shorthand}: red dotted\``, (t) => {
    parse(t, "red dotted", box, "red", "dotted");
  });

  test(`#cascaded() parses \`${shorthand}: 2px dotted red\``, (t) => {
    parse(t, "2px dotted red", box, "red", "dotted", 2);
  });
}
