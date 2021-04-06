import { Device } from "@siteimprove/alfa-device";
import { Declaration, h } from "@siteimprove/alfa-dom";
import { Assertions, test } from "@siteimprove/alfa-test";

import { Style } from "../../src";

const device = Device.standard();

function testStyle(
  t: Assertions,
  style: Style,
  declaration: Declaration,
  side: "top" | "right" | "bottom" | "left",
  color: string,
  styleValue: "none" | "dotted", // the only one used in the tests
  width: number
): void {
  t.deepEqual(
    style
      .cascaded(`border-${side}-color` as const)
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
    style
      .cascaded(`border-${side}-style` as const)
      .get()
      .toJSON(),
    {
      value: {
        type: "keyword",
        value: styleValue,
      },
      source: declaration.toJSON(),
    }
  );

  t.deepEqual(
    style
      .cascaded(`border-${side}-width` as const)
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

for (const side of ["top"] as const) {
  const shorthand = `border-${side}` as const;

  test(`#cascaded() parses \`${shorthand}: red\``, (t) => {
    const element = <div />;
    const declaration = h.declaration(shorthand, "red");

    h.document([element], [h.sheet([h.rule.style("div", [declaration])])]);

    const style = Style.from(element, device);

    testStyle(t, style, declaration, side, "red", "none", 3);
  });

  test(`#cascaded() parses \`${shorthand}: red dotted\``, (t) => {
    const element = <div />;
    const declaration = h.declaration(shorthand, "red dotted");

    h.document([element], [h.sheet([h.rule.style("div", [declaration])])]);

    const style = Style.from(element, device);

    testStyle(t, style, declaration, side, "red", "dotted", 3);
  });

  test(`#cascaded() parses \`${shorthand}: 2px dotted red\``, (t) => {
    const element = <div />;
    const declaration = h.declaration(shorthand, "2px dotted red");

    h.document([element], [h.sheet([h.rule.style("div", [declaration])])]);

    const style = Style.from(element, device);

    testStyle(t, style, declaration, side, "red", "dotted", 2);
  });
}
