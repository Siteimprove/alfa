import { Device } from "@siteimprove/alfa-device";
import { h } from "@siteimprove/alfa-dom";
import { Assertions, test } from "@siteimprove/alfa-test";

import { Style } from "../../src";

const device = Device.standard();

function parse(
  t: Assertions,
  value: string,
  side: "top" | "right" | "bottom" | "left",
  color: string,
  style: "none" | "dotted", // the only one used in the tests
  width: number
): void {
  const shorthand = `border-${side}` as const;

  const element = <div />;
  const declaration = h.declaration(shorthand, value);

  h.document([element], [h.sheet([h.rule.style("div", [declaration])])]);

  const elementStyle = Style.from(element, device);

  t.deepEqual(
    elementStyle
      .cascaded(`${shorthand}-color` as const)
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
      .cascaded(`${shorthand}-style` as const)
      .get()
      .toJSON(),
    {
      value: {
        type: "keyword",
        value: style,
      },
      source: declaration.toJSON(),
    }
  );

  t.deepEqual(
    elementStyle
      .cascaded(`${shorthand}-width` as const)
      .get()
      .toJSON(),
    {
      value: {
        type: "length",
        value: width,
        unit: "px",
      },
      source: declaration.toJSON(),
    }
  );
}

for (const side of ["top", "right", "bottom", "left"] as const) {
  const shorthand = `border-${side}` as const;

  test(`#cascaded() parses \`${shorthand}: red\``, (t) => {
    parse(t, "red", side, "red", "none", 3);
  });

  test(`#cascaded() parses \`${shorthand}: red dotted\``, (t) => {
    parse(t, "red dotted", side, "red", "dotted", 3);
  });

  test(`#cascaded() parses \`${shorthand}: 2px dotted red\``, (t) => {
    parse(t, "2px dotted red", side, "red", "dotted", 2);
  });
}
