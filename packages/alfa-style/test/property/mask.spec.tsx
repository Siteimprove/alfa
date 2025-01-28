import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom";

import { computed } from "../common.js";

test("longhands resolve correctly from shorthand", (t) => {
  const mask =
    "url(foo.svg) 50% 0% / 12px repeat-x view-box padding-box subtract luminance";
  const decl = h.declaration("mask", mask);
  const element = <div style={{ mask }}></div>;

  t.deepEqual(computed(element, "mask-image"), {
    value: {
      type: "list",
      separator: ", ",
      values: [{ type: "image", image: { type: "url", url: "foo.svg" } }],
    },
    source: decl.toJSON(),
  });

  t.deepEqual(computed(element, "mask-position"), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "position",
          horizontal: {
            type: "side",
            offset: { type: "percentage", value: 0.5 },
            side: { type: "keyword", value: "left" },
          },
          vertical: {
            type: "side",
            offset: { type: "percentage", value: 0 },
            side: { type: "keyword", value: "top" },
          },
        },
      ],
    },
    source: decl.toJSON(),
  });

  t.deepEqual(computed(element, "mask-size"), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "tuple",
          values: [
            { type: "length", unit: "px", value: 12 },
            { type: "length", unit: "px", value: 12 },
          ],
        },
      ],
    },
    source: decl.toJSON(),
  });

  t.deepEqual(computed(element, "mask-repeat"), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "tuple",
          values: [
            { type: "keyword", value: "repeat" },
            { type: "keyword", value: "no-repeat" },
          ],
        },
      ],
    },
    source: decl.toJSON(),
  });

  t.deepEqual(computed(element, "mask-origin"), {
    value: {
      type: "list",
      separator: ", ",
      values: [{ type: "keyword", value: "view-box" }],
    },
    source: decl.toJSON(),
  });

  t.deepEqual(computed(element, "mask-clip"), {
    value: {
      type: "list",
      separator: ", ",
      values: [{ type: "keyword", value: "padding-box" }],
    },
    source: decl.toJSON(),
  });

  t.deepEqual(computed(element, "mask-composite"), {
    value: {
      type: "list",
      separator: ", ",
      values: [{ type: "keyword", value: "subtract" }],
    },
    source: decl.toJSON(),
  });

  t.deepEqual(computed(element, "mask-mode"), {
    value: {
      type: "list",
      separator: ", ",
      values: [{ type: "keyword", value: "luminance" }],
    },
    source: decl.toJSON(),
  });
});

test("if one `<coord-box>` value and the `no-clip` keyword are present then `<coord-box>` sets `mask-origin` and `no-clip` sets `mask-clip`", (t) => {
  const mask = "url(foo.svg) view-box no-clip";
  const decl = h.declaration("mask", mask);
  const element = <div style={{ mask }}></div>;

  t.deepEqual(computed(element, "mask-origin"), {
    value: {
      type: "list",
      separator: ", ",
      values: [{ type: "keyword", value: "view-box" }],
    },
    source: decl.toJSON(),
  });

  t.deepEqual(computed(element, "mask-clip"), {
    value: {
      type: "list",
      separator: ", ",
      values: [{ type: "keyword", value: "no-clip" }],
    },
    source: decl.toJSON(),
  });
});

test("if one `<coord-box>` value and no `no-clip` keyword are present then `<coord-box>` sets both `mask-origin` and `mask-clip`", (t) => {
  const mask = "url(foo.svg) view-box";
  const decl = h.declaration("mask", mask);
  const element = <div style={{ mask }}></div>;

  t.deepEqual(computed(element, "mask-origin"), {
    value: {
      type: "list",
      separator: ", ",
      values: [{ type: "keyword", value: "view-box" }],
    },
    source: decl.toJSON(),
  });

  t.deepEqual(computed(element, "mask-clip"), {
    value: {
      type: "list",
      separator: ", ",
      values: [{ type: "keyword", value: "view-box" }],
    },
    source: decl.toJSON(),
  });
});

test("longhands resolves correctly from shorthand with layers", (t) => {
  const mask = "url(foo.svg) 50% 0% / 12px, url(bar.svg) 0% 50%";
  const decl = h.declaration("mask", mask);
  const element = <div style={{ mask }}></div>;

  t.deepEqual(computed(element, "mask-image"), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        { type: "image", image: { type: "url", url: "foo.svg" } },
        { type: "image", image: { type: "url", url: "bar.svg" } },
      ],
    },
    source: decl.toJSON(),
  });

  t.deepEqual(computed(element, "mask-position"), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "position",
          horizontal: {
            type: "side",
            offset: { type: "percentage", value: 0.5 },
            side: { type: "keyword", value: "left" },
          },
          vertical: {
            type: "side",
            offset: { type: "percentage", value: 0 },
            side: { type: "keyword", value: "top" },
          },
        },
        {
          type: "position",
          horizontal: {
            type: "side",
            offset: { type: "percentage", value: 0 },
            side: { type: "keyword", value: "left" },
          },
          vertical: {
            type: "side",
            offset: { type: "percentage", value: 0.5 },
            side: { type: "keyword", value: "top" },
          },
        },
      ],
    },
    source: decl.toJSON(),
  });

  t.deepEqual(computed(element, "mask-size"), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "tuple",
          values: [
            { type: "length", unit: "px", value: 12 },
            { type: "length", unit: "px", value: 12 },
          ],
        },
        {
          type: "tuple",
          values: [
            { type: "keyword", value: "auto" },
            { type: "keyword", value: "auto" },
          ],
        },
      ],
    },
    source: decl.toJSON(),
  });
});
