import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../src/style";
import { cascaded } from "../common";

const device = Device.standard();

for (const side of ["top", "right", "bottom", "left"] as const) {
  const property = `border-${side}-width` as const;

  test(`#cascaded() parses \`${property}: medium\``, (t) => {
    const element = <div />;

    h.document(
      [element],
      [h.sheet([h.rule.style("div", [h.declaration(property, "medium")])])],
    );

    t.deepEqual(cascaded(element, property), {
      value: {
        type: "keyword",
        value: "medium",
      },
      source: h.declaration(property, "medium").toJSON(),
    });
  });

  test(`#cascaded() parses \`${property}: 1.2em\``, (t) => {
    const element = <div />;

    h.document(
      [element],
      [h.sheet([h.rule.style("div", [h.declaration(property, "1.2em")])])],
    );

    t.deepEqual(cascaded(element, property), {
      value: {
        type: "length",
        unit: "em",
        value: 1.2,
      },
      source: h.declaration(property, "1.2em").toJSON(),
    });
  });

  test(`#computed() resolves \`${property}: 1.2em; border-${side}-style: none\``, (t) => {
    const element = <div />;

    h.document(
      [element],
      [
        h.sheet([
          h.rule.style("div", [
            h.declaration(property, "1.2em"),
            h.declaration(`border-${side}-style`, "none"),
          ]),
        ]),
      ],
    );

    const style = Style.from(element, device);

    t.deepEqual(style.computed(property).toJSON(), {
      value: {
        type: "length",
        unit: "px",
        value: 0,
      },
      source: h.declaration(property, "1.2em").toJSON(),
    });
  });
}

test(`#cascaded() parses \`border-width: 1em\``, (t) => {
  const element = <div />;
  const declaration = h.declaration("border-width", "1em");

  h.document([element], [h.sheet([h.rule.style("div", [declaration])])]);

  for (const side of ["top", "right", "bottom", "left"] as const) {
    const property = `border-${side}-width` as const;
    t.deepEqual(cascaded(element, property), {
      value: {
        type: "length",
        unit: "em",
        value: 1,
      },
      source: declaration.toJSON(),
    });
  }
});

test(`#cascaded() parses \`border-width: red green blue black\``, (t) => {
  const element = <div />;
  const declaration = h.declaration("border-width", "1em 1.2em 0.5em 2em");

  h.document([element], [h.sheet([h.rule.style("div", [declaration])])]);

  for (const [side, width] of [
    ["top", 1],
    ["right", 1.2],
    ["bottom", 0.5],
    ["left", 2],
  ] as const) {
    const property = `border-${side}-width` as const;
    t.deepEqual(cascaded(element, property), {
      value: {
        type: "length",
        unit: "em",
        value: width,
      },
      source: declaration.toJSON(),
    });
  }
});
