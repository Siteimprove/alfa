import { h } from "@siteimprove/alfa-dom/h";
import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../dist/style.js";

const device = Device.standard();

test("initial value is `normal`", (t) => {
  const element = <div>Hello</div>;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("mix-blend-mode").toJSON(), {
    value: { type: "keyword", value: "normal" },
    source: null,
  });
});

test("property is not inherited", (t) => {
  const element = <div>Hello</div>;

  h.document(
    [<div class="container">{element}</div>],
    [
      h.sheet([
        h.rule.style(".container", [
          h.declaration("mix-blend-mode", "multiply"),
        ]),
      ]),
    ],
  );
  const style = Style.from(element, device);

  t.deepEqual(style.computed("mix-blend-mode").toJSON(), {
    value: { type: "keyword", value: "normal" },
    source: null,
  });
});

test("#computed() parses the keywords", (t) => {
  for (const kw of [
    "normal",
    "multiply",
    "screen",
    "overlay",
    "darken",
    "lighten",
    "color-dodge",
    "color-burn",
    "hard-light",
    "soft-light",
    "difference",
    "exclusion",
    "hue",
    "saturation",
    "color",
    "luminosity",
    "plus-darker",
    "plus-lighter",
  ] as const) {
    const element = <div class="container">Hello</div>;

    h.document(
      [element],
      [
        h.sheet([
          h.rule.style(".container", [h.declaration("mix-blend-mode", kw)]),
        ]),
      ],
    );
    const style = Style.from(element, device);

    t.deepEqual(style.computed("mix-blend-mode").toJSON(), {
      value: { type: "keyword", value: kw },
      source: h.declaration("mix-blend-mode", kw).toJSON(),
    });
  }
});
