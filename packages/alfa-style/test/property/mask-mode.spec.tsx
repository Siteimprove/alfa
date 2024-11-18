import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../dist/index.js";

const device = Device.standard();

test("initial value is match-source", (t) => {
  const element = <div></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("mask-mode").toJSON(), {
    value: {
      type: "list",
      separator: " ",
      values: [
        {
          type: "keyword",
          value: "match-source",
        },
      ],
    },
    source: null,
  });
});

test("#computed parses single keywords", (t) => {
  for (const kw of ["alpha", "luminance", "match-source"] as const) {
    const element = <div style={{ maskMode: kw }}></div>;

    const style = Style.from(element, device);

    t.deepEqual(style.computed("mask-mode").toJSON(), {
      value: {
        type: "list",
        separator: ", ",
        values: [
          {
            type: "keyword",
            value: kw,
          },
        ],
      },
      source: h.declaration("mask-mode", kw).toJSON(),
    });
  }
});

test("#computed parses multiple keywords", (t) => {
  const element = <div style={{ maskMode: "alpha, match-source" }}></div>;
  const style = Style.from(element, device);
  t.deepEqual(style.computed("mask-mode").toJSON(), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "keyword",
          value: "alpha",
        },
        {
          type: "keyword",
          value: "match-source",
        },
      ],
    },
    source: h.declaration("mask-mode", "alpha, match-source").toJSON(),
  });
});
