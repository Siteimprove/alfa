import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../src/style";

const device = Device.standard();

test("#cascaded() parses `text-decoration: underline`", (t) => {
  const element = <div style={{ textDecoration: "underline" }} />;

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
  const element = <div style={{ textDecoration: "underline overline" }} />;

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
  const element = <div style={{ textDecoration: "underline solid" }} />;

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
  const element = <div style={{ textDecoration: "underline red" }} />;

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
  const element = <div style={{ textDecoration: "underline solid red" }} />;

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

test("#cascaded() parses `text-decoration: underline solid red 2px`", (t) => {
  const element = <div style={{ textDecoration: "underline solid red 2px" }} />;

  const declaration = h.declaration(
    "text-decoration",
    "underline solid red 2px"
  );

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
    source: declaration.toJSON(),
  });

  t.deepEqual(style.cascaded("text-decoration-style").get().toJSON(), {
    value: {
      type: "keyword",
      value: "solid",
    },
    source: declaration.toJSON(),
  });

  t.deepEqual(style.cascaded("text-decoration-color").get().toJSON(), {
    value: {
      type: "color",
      format: "named",
      color: "red",
    },
    source: declaration.toJSON(),
  });

  t.deepEqual(style.cascaded("text-decoration-thickness").get().toJSON(), {
    value: {
      type: "length",
      value: 2,
      unit: "px",
    },
    source: declaration.toJSON(),
  });
});
