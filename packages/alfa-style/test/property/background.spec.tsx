import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";
import { jsx } from "@siteimprove/alfa-dom/jsx";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../src/style";

test("#cascaded() parses `background-color: red`", (t) => {
  const element = <div style={{ backgroundColor: "red" }}></div>;

  const style = Style.from(element, Device.standard());

  t.deepEqual(style.cascaded("background-color").get().toJSON(), {
    value: {
      type: "color",
      format: "named",
      color: "red",
    },
    source: h.declaration("background-color", "red").toJSON(),
  });
});

test("#computed() resolves `background-color: red`", (t) => {
  const element = <div style={{ backgroundColor: "red" }}></div>;

  const style = Style.from(element, Device.standard());

  t.deepEqual(style.computed("background-color").toJSON(), {
    value: {
      type: "color",
      format: "rgb",
      red: {
        type: "percentage",
        value: 1,
      },
      green: {
        type: "percentage",
        value: 0,
      },
      blue: {
        type: "percentage",
        value: 0,
      },
      alpha: {
        type: "percentage",
        value: 1,
      },
    },
    source: h.declaration("background-color", "red").toJSON(),
  });
});

test(`#cascaded() parses \`background-image: url("foo.png")\``, (t) => {
  const element = <div style={{ backgroundImage: `url("foo.png")` }}></div>;

  const style = Style.from(element, Device.standard());

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
    source: h.declaration("background-image", `url("foo.png")`).toJSON(),
  });
});

test("#cascaded() parses `background-position: left`", (t) => {
  const element = <div style={{ backgroundPosition: `left` }}></div>;

  const style = Style.from(element, Device.standard());

  t.deepEqual(style.cascaded("background-position-x").get().toJSON(), {
    value: {
      type: "list",
      values: [
        {
          type: "side",
          side: {
            type: "keyword",
            value: "left",
          },
          offset: null,
        },
      ],
      separator: ", ",
    },
    source: h.declaration("background-position", "left").toJSON(),
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
    source: h.declaration("background-position", "left").toJSON(),
  });
});

test("#cascaded() parses `background-position: top`", (t) => {
  const element = <div style={{ backgroundPosition: `top` }}></div>;

  const style = Style.from(element, Device.standard());

  t.deepEqual(style.cascaded("background-position-y").get().toJSON(), {
    value: {
      type: "list",
      values: [
        {
          type: "side",
          side: {
            type: "keyword",
            value: "top",
          },
          offset: null,
        },
      ],
      separator: ", ",
    },
    source: h.declaration("background-position", "left").toJSON(),
  });

  t.deepEqual(style.cascaded("background-position-x").get().toJSON(), {
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
    source: h.declaration("background-position", "left").toJSON(),
  });
});
