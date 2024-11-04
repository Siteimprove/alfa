import { Device } from "@siteimprove/alfa-device";
import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { Style } from "../../dist/index.js";

const device = Device.standard();

test("#computed parses keywords", (t) => {
  for (let kw of ["scroll-position", "contents"] as const) {
    const element = <div style={{ willChange: kw }} />;

    const style = Style.from(element, device);

    t.deepEqual(style.computed("will-change").toJSON(), {
      value: {
        type: "list",
        separator: ", ",
        values: [{ type: "keyword", value: kw }],
      },
      source: h.declaration("will-change", kw).toJSON(),
    });
  }
});

test("#computed parses custom identifiers", (t) => {
  const value = "transform, opacity";
  const element = <div style={{ willChange: value }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("will-change").toJSON(), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        { type: "custom-ident", value: "transform" },
        { type: "custom-ident", value: "opacity" },
      ],
    },
    source: h.declaration("will-change", value).toJSON(),
  });
});

test("#computed parses one keyword followed by custom identifiers", (t) => {
  for (let kw of ["scroll-position", "contents"] as const) {
    const value = `${kw}, transform, opacity`;
    const element = <div style={{ willChange: value }} />;

    const style = Style.from(element, device);

    t.deepEqual(style.computed("will-change").toJSON(), {
      value: {
        type: "list",
        separator: ", ",
        values: [
          { type: "keyword", value: kw },
          { type: "custom-ident", value: "transform" },
          { type: "custom-ident", value: "opacity" },
        ],
      },
      source: h.declaration("will-change", value).toJSON(),
    });
  }
});

test("#computed does not parse illegal custom identifiers", (t) => {
  const element = <div style={{ willChange: "will-change" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("will-change").toJSON(), {
    value: {
      type: "keyword",
      value: "auto",
    },
    source: null,
  });
});
