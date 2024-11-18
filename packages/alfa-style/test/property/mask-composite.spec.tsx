import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../dist/index.js";

const device = Device.standard();

test("initial value is add", (t) => {
  const element = <div></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("mask-composite").toJSON(), {
    value: {
      type: "list",
      separator: " ",
      values: [
        {
          type: "keyword",
          value: "add",
        },
      ],
    },
    source: null,
  });
});

test("#computed parses single keywords", (t) => {
  for (const kw of ["add", "subtract", "intersect", "exclude"] as const) {
    const element = <div style={{ maskComposite: kw }}></div>;

    const style = Style.from(element, device);

    t.deepEqual(style.computed("mask-composite").toJSON(), {
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
      source: h.declaration("mask-composite", kw).toJSON(),
    });
  }
});

test("#computed parses multiple keywords", (t) => {
  const element = <div style={{ maskComposite: "add, exclude" }}></div>;
  const style = Style.from(element, device);
  t.deepEqual(style.computed("mask-composite").toJSON(), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "keyword",
          value: "add",
        },
        {
          type: "keyword",
          value: "exclude",
        },
      ],
    },
    source: h.declaration("mask-composite", "add, exclude").toJSON(),
  });
});
