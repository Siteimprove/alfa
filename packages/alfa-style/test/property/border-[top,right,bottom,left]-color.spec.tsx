import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../dist/style.js";
import { cascaded, color } from "../common.js";

const device = Device.standard();

const colors = {
  red: color(1, 0, 0),
  lime: color(0, 1, 0),
  blue: color(0, 0, 1),
  black: color(0, 0, 0),
};

for (const side of ["top", "right", "bottom", "left"] as const) {
  const property = `border-${side}-color` as const;

  test(`#cascaded() parses \`${property}: red\``, (t) => {
    const element = <div />;

    h.document(
      [element],
      [h.sheet([h.rule.style("div", [h.declaration(property, "red")])])],
    );

    t.deepEqual(cascaded(element, property), {
      value: colors.red,
      source: h.declaration(property, "red").toJSON(),
    });
  });

  test(`#computed() resolves \`${property}: red\``, (t) => {
    const element = <div />;

    h.document(
      [element],
      [h.sheet([h.rule.style("div", [h.declaration(property, "red")])])],
    );

    const style = Style.from(element, device);

    t.deepEqual(style.computed(property).toJSON(), {
      value: colors.red,
      source: h.declaration(property, "red").toJSON(),
    });
  });
}

test(`#cascaded() parses \`border-color: red\``, (t) => {
  const element = <div />;
  const declaration = h.declaration("border-color", "red");

  h.document([element], [h.sheet([h.rule.style("div", [declaration])])]);

  for (const side of ["top", "right", "bottom", "left"] as const) {
    const property = `border-${side}-color` as const;
    t.deepEqual(cascaded(element, property), {
      value: colors.red,
      source: declaration.toJSON(),
    });
  }
});

test(`#cascaded() parses \`border-color: red lime blue black\``, (t) => {
  const element = <div />;
  const declaration = h.declaration("border-color", "red lime blue black");

  h.document([element], [h.sheet([h.rule.style("div", [declaration])])]);

  for (const [side, color] of [
    ["top", "red"],
    ["right", "lime"],
    ["bottom", "blue"],
    ["left", "black"],
  ] as const) {
    const property = `border-${side}-color` as const;
    t.deepEqual(cascaded(element, property), {
      value: colors[color],
      source: declaration.toJSON(),
    });
  }
});
