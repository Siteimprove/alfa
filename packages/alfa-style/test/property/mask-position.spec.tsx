import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../dist/index.js";

const device = Device.standard();

test("initial value is 0% 0%", (t) => {
  const element = <div></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("mask-position").toJSON(), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "position",
          horizontal: {
            type: "side",
            side: {
              type: "keyword",
              value: "left",
            },
            offset: {
              type: "percentage",
              value: 0,
            },
          },
          vertical: {
            type: "side",
            side: {
              type: "keyword",
              value: "top",
            },
            offset: {
              type: "percentage",
              value: 0,
            },
          },
        },
      ],
    },
    source: null,
  });
});

// TODO: The spec requires the computed value to be two lengths or percentages, not a keyword value.
// E.g. the keyword `left` should be computes to `0% 50%` in Chrome and Firefox.
test("#computed parses single keywords", (t) => {
  for (const kw of ["top", "bottom"] as const) {
    const element = <div style={{ maskPosition: kw }}></div>;

    const style = Style.from(element, device);

    t.deepEqual(style.computed("mask-position").toJSON(), {
      value: {
        type: "list",
        separator: ", ",
        values: [
          {
            type: "position",
            horizontal: {
              type: "keyword",
              value: "center",
            },
            vertical: {
              type: "side",
              offset: null,
              side: {
                type: "keyword",
                value: kw,
              },
            },
          },
        ],
      },
      source: h.declaration("mask-position", kw).toJSON(),
    });
  }

  for (const kw of ["left", "right"] as const) {
    const element = <div style={{ maskPosition: kw }}></div>;

    const style = Style.from(element, device);

    t.deepEqual(style.computed("mask-position").toJSON(), {
      value: {
        type: "list",
        separator: ", ",
        values: [
          {
            type: "position",
            vertical: {
              type: "keyword",
              value: "center",
            },
            horizontal: {
              type: "side",
              offset: null,
              side: {
                type: "keyword",
                value: kw,
              },
            },
          },
        ],
      },
      source: h.declaration("mask-position", kw).toJSON(),
    });
  }

  const element = <div style={{ maskPosition: "center" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("mask-position").toJSON(), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "position",
          vertical: {
            type: "keyword",
            value: "center",
          },
          horizontal: {
            type: "keyword",
            value: "center",
          },
        },
      ],
    },
    source: h.declaration("mask-position", "center").toJSON(),
  });
});

test("#computed parses lengths and percentages", (t) => {
  const element = <div style={{ maskPosition: "10% 3em" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("mask-position").toJSON(), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "position",
          horizontal: {
            type: "side",
            offset: {
              type: "percentage",
              value: 0.1,
            },
            side: {
              type: "keyword",
              value: "left",
            },
          },
          vertical: {
            type: "side",
            offset: {
              type: "length",
              unit: "px",
              value: 48,
            },
            side: {
              type: "keyword",
              value: "top",
            },
          },
        },
      ],
    },
    source: h.declaration("mask-position", "10% 3em").toJSON(),
  });
});

test("#computed parses multiple layers", (t) => {
  const element = (
    <div
      style={{
        maskImage: "url(foo.svg), url(bar.svg)",
        maskPosition: "1rem 1rem, center",
      }}
    ></div>
  );

  const style = Style.from(element, device);

  t.deepEqual(style.computed("mask-position").toJSON(), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "position",
          horizontal: {
            type: "side",
            offset: {
              type: "length",
              unit: "px",
              value: 16,
            },
            side: {
              type: "keyword",
              value: "left",
            },
          },
          vertical: {
            type: "side",
            offset: {
              type: "length",
              unit: "px",
              value: 16,
            },
            side: {
              type: "keyword",
              value: "top",
            },
          },
        },
        {
          type: "position",
          horizontal: {
            type: "keyword",
            value: "center",
          },
          vertical: {
            type: "keyword",
            value: "center",
          },
        },
      ],
    },
    source: h.declaration("mask-position", "1rem 1rem, center").toJSON(),
  });
});
