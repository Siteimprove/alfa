import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { cascaded } from "../common";

test("#cascaded() parses `background: red`", (t) => {
  const element = <div style={{ background: `red` }} />;

  t.deepEqual(cascaded(element, "background-color"), {
    value: {
      type: "color",
      format: "named",
      color: "red",
    },
    source: h.declaration("background", "red").toJSON(),
  });
});

test(`#cascaded() parses \`background: url("foo.png")\``, (t) => {
  const element = <div style={{ background: `url("foo.png")` }} />;

  t.deepEqual(cascaded(element, "background-image"), {
    value: {
      type: "list",
      values: [
        {
          type: "image",
          image: {
            type: "url",
            url: "foo.png",
          },
        },
      ],
      separator: ", ",
    },
    source: h.declaration("background", `url("foo.png")`).toJSON(),
  });
});

test(`#cascaded() parses \`background: 12px\``, (t) => {
  const element = <div style={{ background: `12px` }} />;

  t.deepEqual(cascaded(element, "background-position-x"), {
    value: {
      type: "list",
      values: [
        {
          type: "length",
          value: 12,
          unit: "px",
        },
      ],
      separator: ", ",
    },
    source: h.declaration("background", `12px`).toJSON(),
  });

  t.deepEqual(cascaded(element, "background-position-y"), {
    value: {
      type: "list",
      values: [
        {
          type: "keyword",
          value: "center",
        },
      ],
      separator: ", ",
    },
    source: h.declaration("background", `12px`).toJSON(),
  });
});

test(`#cascaded() parses \`background: 12px 0\``, (t) => {
  const element = <div style={{ background: `12px 0` }} />;

  t.deepEqual(cascaded(element, "background-position-x"), {
    value: {
      type: "list",
      values: [
        {
          type: "length",
          value: 12,
          unit: "px",
        },
      ],
      separator: ", ",
    },
    source: h.declaration("background", `12px 0`).toJSON(),
  });

  t.deepEqual(cascaded(element, "background-position-y"), {
    value: {
      type: "list",
      values: [
        {
          type: "length",
          value: 0,
          unit: "px",
        },
      ],
      separator: ", ",
    },
    source: h.declaration("background", `12px 0`).toJSON(),
  });
});

test(`#cascaded() parses \`background: 0 / cover\``, (t) => {
  const element = <div style={{ background: `0 / cover` }} />;

  t.deepEqual(cascaded(element, "background-size"), {
    value: {
      type: "list",
      values: [
        {
          type: "keyword",
          value: "cover",
        },
      ],
      separator: ", ",
    },
    source: h.declaration("background", `0 / cover`).toJSON(),
  });
});
