import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom";

import { computed } from "../common.js";

test("initial value is border-box", (t) => {
  const element = <div></div>;

  t.deepEqual(computed(element, "mask-origin"), {
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

    t.deepEqual(computed(element, "mask-origin"), {
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

  t.deepEqual(computed(element, "mask-origin"), {
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

  t.deepEqual(computed(element, "mask-origin"), {
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

  t.deepEqual(computed(element, "mask-origin"), {
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
