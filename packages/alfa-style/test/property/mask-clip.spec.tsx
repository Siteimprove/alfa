import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../dist/index.js";

const device = Device.standard();

test("initial value is border-box", (t) => {
  const element = <div></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("mask-clip").toJSON(), {
    value: {
      type: "list",
      separator: " ",
      values: [
        {
          type: "keyword",
          value: "border-box",
        },
      ],
    },
    source: null,
  });
});

test("#computed parses single keywords", (t) => {
  for (const kw of [
    "content-box",
    "padding-box",
    "border-box",
    "fill-box",
    "stroke-box",
    "view-box",
    "no-clip",
  ] as const) {
    const element = <div style={{ maskClip: kw }}></div>;

    const style = Style.from(element, device);

    t.deepEqual(style.computed("mask-clip").toJSON(), {
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
      source: h.declaration("mask-clip", kw).toJSON(),
    });
  }
});

test("#computed parses multiple keywords", (t) => {
  const element1 = <div style={{ maskClip: "padding-box, no-clip" }}></div>;
  const style1 = Style.from(element1, device);
  t.deepEqual(style1.computed("mask-clip").toJSON(), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "keyword",
          value: "padding-box",
        },
        {
          type: "keyword",
          value: "no-clip",
        },
      ],
    },
    source: h.declaration("mask-clip", "padding-box, no-clip").toJSON(),
  });

  const element2 = (
    <div style={{ maskClip: "view-box, fill-box, border-box" }}></div>
  );
  const style2 = Style.from(element2, device);
  t.deepEqual(style2.computed("mask-clip").toJSON(), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "keyword",
          value: "view-box",
        },
        {
          type: "keyword",
          value: "fill-box",
        },
        {
          type: "keyword",
          value: "border-box",
        },
      ],
    },
    source: h
      .declaration("mask-clip", "view-box, fill-box, border-box")
      .toJSON(),
  });
});
