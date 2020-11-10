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

test("#cascaded() parses `text-indent: <length>`", (t) => {
  const element = <div style={{ textIndent: "5px" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("text-indent").get().toJSON(), {
    value: [
      {
        type: "length",
        unit: "px",
        value: 5,
      },
      {
        type: "none",
      },
      {
        type: "none",
      },
    ],
    source: h.declaration("text-indent", "5px").toJSON(),
  });
});

test("#cascaded() parses `text-indent: <length> hanging`", (t) => {
  const element = <div style={{ textIndent: "5px hanging" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("text-indent").get().toJSON(), {
    value: [
      {
        type: "length",
        unit: "px",
        value: 5,
      },
      {
        type: "some",
        value: {
          type: "keyword",
          value: "hanging",
        },
      },
      {
        type: "none",
      },
    ],
    source: h.declaration("text-indent", "5px hanging").toJSON(),
  });
});

test("#cascaded() parses `text-indent: <length> hanging each-line`", (t) => {
  const element = <div style={{ textIndent: "5px hanging each-line" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("text-indent").get().toJSON(), {
    value: [
      {
        type: "length",
        unit: "px",
        value: 5,
      },
      {
        type: "some",
        value: {
          type: "keyword",
          value: "hanging",
        },
      },
      {
        type: "some",
        value: {
          type: "keyword",
          value: "each-line",
        },
      },
    ],
    source: h.declaration("text-indent", "5px hanging each-line").toJSON(),
  });
});

test("#cascaded() parses `text-indent: <length> each-line`", (t) => {
  const element = <div style={{ textIndent: "5px each-line" }}></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("text-indent").get().toJSON(), {
    value: [
      {
        type: "length",
        unit: "px",
        value: 5,
      },

      {
        type: "none",
      },
      {
        type: "some",
        value: {
          type: "keyword",
          value: "each-line",
        },
      },
    ],
    source: h.declaration("text-indent", "5px each-line").toJSON(),
  });
});
