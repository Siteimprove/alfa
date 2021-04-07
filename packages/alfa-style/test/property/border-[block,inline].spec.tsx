import { Device } from "@siteimprove/alfa-device";
import { h } from "@siteimprove/alfa-dom";
import { Assertions, test } from "@siteimprove/alfa-test";

import { Style } from "../../src";

const device = Device.standard();

function parse(
  t: Assertions,
  value: string,
  box: "block" | "inline",
  color: string,
  style?: "dotted", // the only one used in the tests :-/
  width?: number
): void {
  const shorthand = `border-${box}` as const;

  const element = <div />;
  const declaration = h.declaration(shorthand, value);

  h.document([element], [h.sheet([h.rule.style("div", [declaration])])]);

  const elementStyle = Style.from(element, device);

  for (const side of ["start", "end"] as const) {
    t.deepEqual(
      elementStyle
        .cascaded(`${shorthand}-${side}-color` as const)
        .get()
        .toJSON(),
      {
        value: {
          format: "named",
          type: "color",
          color: color,
        },
        source: declaration.toJSON(),
      }
    );

    t.deepEqual(
      elementStyle
        .cascaded(`${shorthand}-${side}-style` as const)
        .get()
        .toJSON(),
      {
        value: {
          type: "keyword",
          value: style ?? "initial",
        },
        source: declaration.toJSON(),
      }
    );

    t.deepEqual(
      elementStyle
        .cascaded(`${shorthand}-${side}-width` as const)
        .get()
        .toJSON(),
      {
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
      }
    );
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
