import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";
import { jsx } from "@siteimprove/alfa-dom/jsx";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../src/style";

const device = Device.standard();

test("#cascaded() parses `text-decoration: underline`", (t) => {
  const element = <div style={{ textDecoration: "underline" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("text-decoration-line").get().toJSON(), {
    value: {
      type: "list",
      values: [
        {
          type: "keyword",
          value: "underline",
        },
      ],
      separator: " ",
    },
    source: h.declaration("text-decoration", "underline").toJSON(),
  });

  t.deepEqual(style.cascaded("text-decoration-style").get().toJSON(), {
    value: {
      type: "keyword",
      value: "initial",
    },
    source: h.declaration("text-decoration", "underline").toJSON(),
  });

  t.deepEqual(style.cascaded("text-decoration-color").get().toJSON(), {
    value: {
      type: "keyword",
      value: "initial",
    },
    source: h.declaration("text-decoration", "underline").toJSON(),
  });
});

test("#cascaded() parses `text-decoration: underline overline`", (t) => {
  const element = <div style={{ textDecoration: "underline overline" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("text-decoration-line").get().toJSON(), {
    value: {
      type: "list",
      values: [
        {
          type: "keyword",
          value: "underline",
        },
        {
          type: "keyword",
          value: "overline",
        },
      ],
      separator: " ",
    },
    source: h.declaration("text-decoration", "underline overline").toJSON(),
  });
});

test("#cascaded() parses `text-decoration: underline solid`", (t) => {
  const element = <div style={{ textDecoration: "underline solid" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("text-decoration-line").get().toJSON(), {
    value: {
      type: "list",
      values: [
        {
          type: "keyword",
          value: "underline",
        },
      ],
      separator: " ",
    },
    source: h.declaration("text-decoration", "underline solid").toJSON(),
  });

  t.deepEqual(style.cascaded("text-decoration-style").get().toJSON(), {
    value: {
      type: "keyword",
      value: "solid",
    },
    source: h.declaration("text-decoration", "underline solid").toJSON(),
  });
});

test("#cascaded() parses `text-decoration: underline red`", (t) => {
  const element = <div style={{ textDecoration: "underline red" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("text-decoration-line").get().toJSON(), {
    value: {
      type: "list",
      values: [
        {
          type: "keyword",
          value: "underline",
        },
      ],
      separator: " ",
    },
    source: h.declaration("text-decoration", "underline red").toJSON(),
  });

  t.deepEqual(style.cascaded("text-decoration-color").get().toJSON(), {
    value: {
      type: "color",
      format: "named",
      color: "red",
    },
    source: h.declaration("text-decoration", "underline red").toJSON(),
  });
});

test("#cascaded() parses `text-decoration: underline solid red`", (t) => {
  const element = <div style={{ textDecoration: "underline solid red" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("text-decoration-line").get().toJSON(), {
    value: {
      type: "list",
      values: [
        {
          type: "keyword",
          value: "underline",
        },
      ],
      separator: " ",
    },
    source: h.declaration("text-decoration", "underline solid red").toJSON(),
  });

  t.deepEqual(style.cascaded("text-decoration-style").get().toJSON(), {
    value: {
      type: "keyword",
      value: "solid",
    },
    source: h.declaration("text-decoration", "underline solid red").toJSON(),
  });

  t.deepEqual(style.cascaded("text-decoration-color").get().toJSON(), {
    value: {
      type: "color",
      format: "named",
      color: "red",
    },
    source: h.declaration("text-decoration", "underline solid red").toJSON(),
  });
});

test("#cascaded() parses `text-indent`", (t) => {
  const element = <div style={{ textIndent: "5px" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("text-indent").get().toJSON(), {
    value: {
      type: "length",
      unit: "px",
      value: 5,
    },
    source: h.declaration("text-indent", "5px").toJSON(),
  });
});
