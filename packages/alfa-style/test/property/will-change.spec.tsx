import { Device } from "@siteimprove/alfa-device";
import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { Style } from "../../dist/index.js";

const device = Device.standard();

test("#computed parses keywords", (t) => {
  for (const kw of ["scroll-position", "contents"] as const) {
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
  for (const kw of ["scroll-position", "contents"] as const) {
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

test("#computed does not parse illegal custom identifiers including case permutations", (t) => {
  for (const kw of ["inherit", "default", "will-change"]) {
    const element = <div style={{ willChange: kw }} />;

    const style = Style.from(element, device);

    t.deepEqual(style.computed("will-change").toJSON(), {
      value: {
        type: "keyword",
        value: "auto",
      },
      source: null,
    });
  }
});

test("#computed does not parse a valid custom ident followed by an invalid custom ident", (t) => {
  // TODO: For some reason `source` is not `null` for these keywords.
  for (const kw of [
    "initial",
    "unset",
    "Unset",
    "INITIAL", // Testing one case permutation should be good enough
  ]) {
    const element = <div style={{ willChange: kw }} />;

    const style = Style.from(element, device);

    t.deepEqual(style.computed("will-change").toJSON(), {
      value: {
        type: "keyword",
        value: "auto",
      },
      source: h.declaration("will-change", kw).toJSON(),
    });
  }

  for (const kw of [
    "initial",
    "unset",
    "Unset",
    "inherit",
    "default",
    "INITIAL", // Testing one case permutation should be good enough
    "will-change",
  ]) {
    const element = <div style={{ willChange: `scroll-position, ${kw}` }} />;

    const style = Style.from(element, device);

    t.deepEqual(style.computed("will-change").toJSON(), {
      value: {
        type: "keyword",
        value: "auto",
      },
      source: null,
    });
  }
});
