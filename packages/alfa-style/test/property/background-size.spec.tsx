import { Device } from "@siteimprove/alfa-device";
import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";
import { Style } from "../../src";

const device = Device.standard();

test("#cascaded() parses `background-size: cover`", (t) => {
  const element = <div style={{ backgroundSize: `cover` }} />;

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
    source: h.declaration("background-size", "cover").toJSON(),
  });
});

test("#cascaded() parses `background-size: 10px`", (t) => {
  const element = <div style={{ backgroundSize: `10px` }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("background-size").get().toJSON(), {
    value: {
      type: "list",
      values: [
        [
          {
            type: "length",
            value: 10,
            unit: "px",
          },
          {
            type: "keyword",
            value: "auto",
          },
        ],
      ],
      separator: ", ",
    },
    source: h.declaration("background-size", "10px").toJSON(),
  });
});

test("#cascaded() parses `background-size: 10%`", (t) => {
  const element = <div style={{ backgroundSize: `10%` }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("background-size").get().toJSON(), {
    value: {
      type: "list",
      values: [
        [
          {
            type: "percentage",
            value: 0.1,
          },
          {
            type: "keyword",
            value: "auto",
          },
        ],
      ],
      separator: ", ",
    },
    source: h.declaration("background-size", "10%").toJSON(),
  });
});

test("#cascaded() parses `background-size: 10px 20px`", (t) => {
  const element = <div style={{ backgroundSize: `10px 20px` }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("background-size").get().toJSON(), {
    value: {
      type: "list",
      values: [
        [
          {
            type: "length",
            value: 10,
            unit: "px",
          },
          {
            type: "length",
            value: 20,
            unit: "px",
          },
        ],
      ],
      separator: ", ",
    },
    source: h.declaration("background-size", "10px 20px").toJSON(),
  });
});

test("#cascaded() parses `background-size: 10px, 20px`", (t) => {
  const element = <div style={{ backgroundSize: `10px, 20px` }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("background-size").get().toJSON(), {
    value: {
      type: "list",
      values: [
        [
          {
            type: "length",
            value: 10,
            unit: "px",
          },
          {
            type: "keyword",
            value: "auto",
          },
        ],
        [
          {
            type: "length",
            value: 20,
            unit: "px",
          },
          {
            type: "keyword",
            value: "auto",
          },
        ],
      ],
      separator: ", ",
    },
    source: h.declaration("background-size", "10px, 20px").toJSON(),
  });
});
