import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../dist/index.js";

const device = Device.standard();

test("initial value is border-box", (t) => {
  const element = <div></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("mask-origin").toJSON(), {
    value: {
      type: "list",
      separator: ", ",
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
  ] as const) {
    const element = <div style={{ maskOrigin: kw }}></div>;

    const style = Style.from(element, device);

    t.deepEqual(style.computed("mask-origin").toJSON(), {
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
      source: h.declaration("mask-origin", kw).toJSON(),
    });
  }
});

test("#computed parses multiple layers", (t) => {
  const element = (
    <div
      style={{
        maskImage: "url(foo.svg), url(bar.svg)",
        maskOrigin: "content-box, padding-box",
      }}
    ></div>
  );

  const style = Style.from(element, device);

  t.deepEqual(style.computed("mask-origin").toJSON(), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "keyword",
          value: "content-box",
        },
        {
          type: "keyword",
          value: "padding-box",
        },
      ],
    },
    source: h.declaration("mask-origin", "content-box, padding-box").toJSON(),
  });
});

test("#computed discards excess values when there are more values than layers", (t) => {
  const element = (
    <div
      style={{
        maskImage: "url(foo.svg), url(bar.svg)",
        maskOrigin: "content-box, padding-box, border-box",
      }}
    ></div>
  );

  const style = Style.from(element, device);

  t.deepEqual(style.computed("mask-origin").toJSON(), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "keyword",
          value: "content-box",
        },
        {
          type: "keyword",
          value: "padding-box",
        },
      ],
    },
    source: h
      .declaration("mask-origin", "content-box, padding-box, border-box")
      .toJSON(),
  });
});

test("#computed repeats values when there are more layers than values", (t) => {
  const element = (
    <div
      style={{
        maskImage: "url(foo.svg), url(bar.svg), url(baz.svg)",
        maskOrigin: "content-box, padding-box",
      }}
    ></div>
  );

  const style = Style.from(element, device);

  t.deepEqual(style.computed("mask-origin").toJSON(), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "keyword",
          value: "content-box",
        },
        {
          type: "keyword",
          value: "padding-box",
        },
        {
          type: "keyword",
          value: "content-box",
        },
      ],
    },
    source: h.declaration("mask-origin", "content-box, padding-box").toJSON(),
  });
});
