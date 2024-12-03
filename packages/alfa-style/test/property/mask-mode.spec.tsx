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
      separator: ", ",
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

test("#computed parses multiple layers", (t) => {
  const element = (
    <div
      style={{
        maskImage: "url(foo.svg), url(bar.svg)",
        maskMode: "alpha, match-source",
      }}
    ></div>
  );
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

test("#computed discards excess values when there are more values than layers", (t) => {
  const element = (
    <div
      style={{
        maskImage: "url(foo.svg), url(bar.svg)",
        maskMode: "alpha, match-source, luminance",
      }}
    ></div>
  );

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
    source: h
      .declaration("mask-mode", "alpha, match-source, luminance")
      .toJSON(),
  });
});

test("#computed repeats values when there are more layers than values", (t) => {
  const element = (
    <div
      style={{
        maskImage: "url(foo.svg), url(bar.svg), url(baz.svg)",
        maskMode: "alpha, match-source",
      }}
    ></div>
  );

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
        {
          type: "keyword",
          value: "alpha",
        },
      ],
    },
    source: h.declaration("mask-mode", "alpha, match-source").toJSON(),
  });
});
