import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";
import { jsx } from "@siteimprove/alfa-dom/jsx";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../src/style";

const device = Device.standard();

test("#cascaded() parses `background: red`", (t) => {
  const element = <div style={{ background: `red` }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("background-color").get().toJSON(), {
    value: {
      type: "color",
      format: "named",
      color: "red",
    },
    source: h.declaration("background", "red").toJSON(),
  });
});

test(`#cascaded() parses \`background: url("foo.png")\``, (t) => {
  const element = <div style={{ background: `url("foo.png")` }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("background-image").get().toJSON(), {
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
  const element = <div style={{ background: `12px` }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("background-position-x").get().toJSON(), {
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

  t.deepEqual(style.cascaded("background-position-y").get().toJSON(), {
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
  const element = <div style={{ background: `12px 0` }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("background-position-x").get().toJSON(), {
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

  t.deepEqual(style.cascaded("background-position-y").get().toJSON(), {
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
  const element = <div style={{ background: `0 / cover` }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("background-size").get().toJSON(), {
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
