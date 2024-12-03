import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../dist/index.js";

const device = Device.standard();

test("initial value is auto", (t) => {
  const element = (
    <div
      style={{
        maskImage: "url(foo.svg), url(bar.svg)",
      }}
    ></div>
  );

  const style = Style.from(element, device);

  t.deepEqual(style.computed("mask-size").toJSON(), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "list",
          separator: " ",
          values: [
            {
              type: "keyword",
              value: "auto",
            },
          ],
        },
        {
          type: "list",
          separator: " ",
          values: [
            {
              type: "keyword",
              value: "auto",
            },
          ],
        },
      ],
    },
    source: null,
  });
});

test("#computed parses single keywords", (t) => {
  for (const kw of ["cover", "contain"] as const) {
    const element = <div style={{ maskSize: kw }}></div>;

    const style = Style.from(element, device);

    t.deepEqual(style.computed("mask-size").toJSON(), {
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
      source: h.declaration("mask-size", kw).toJSON(),
    });
  }
});

test("#computed parses percentage width", (t) => {
  const element = <div style={{ maskSize: "50%" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("mask-size").toJSON(), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "list",
          separator: " ",
          values: [
            {
              type: "percentage",
              value: 0.5,
            },
          ],
        },
      ],
    },
    source: h.declaration("mask-size", "50%").toJSON(),
  });
});

test("#computed resolves em width", (t) => {
  const element = <div style={{ maskSize: "3em" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("mask-size").toJSON(), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "list",
          separator: " ",
          values: [
            {
              type: "length",
              unit: "px",
              value: 48,
            },
          ],
        },
      ],
    },
    source: h.declaration("mask-size", "3em").toJSON(),
  });
});

test("#computed parses pixel width", (t) => {
  const element = <div style={{ maskSize: "12px" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("mask-size").toJSON(), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "list",
          separator: " ",
          values: [
            {
              type: "length",
              unit: "px",
              value: 12,
            },
          ],
        },
      ],
    },
    source: h.declaration("mask-size", "12px").toJSON(),
  });
});

test("#computed parses width and height", (t) => {
  const element = <div style={{ maskSize: "3em 25%" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("mask-size").toJSON(), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "list",
          separator: " ",
          values: [
            {
              type: "length",
              unit: "px",
              value: 48,
            },
            {
              type: "percentage",
              value: 0.25,
            },
          ],
        },
      ],
    },
    source: h.declaration("mask-size", "3em 25%").toJSON(),
  });
});

test("#computed parses multiple layers", (t) => {
  const element = (
    <div
      style={{
        maskImage: "url(foo.svg), url(bar.svg)",
        maskSize: "50%, 25%",
      }}
    ></div>
  );

  const style = Style.from(element, device);

  t.deepEqual(style.computed("mask-size").toJSON(), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "list",
          separator: " ",
          values: [
            {
              type: "percentage",
              value: 0.5,
            },
          ],
        },
        {
          type: "list",
          separator: " ",
          values: [
            {
              type: "percentage",
              value: 0.25,
            },
          ],
        },
      ],
    },
    source: h.declaration("mask-size", "50%, 25%").toJSON(),
  });
});
