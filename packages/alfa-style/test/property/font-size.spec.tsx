import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../src/style";

const device = Device.standard();

test("#cascaded() parses `font-size: calc(1em + 2px)`", (t) => {
  const element = <div style={{ fontSize: "calc(1em + 2px)" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("font-size").get().toJSON(), {
    value: {
      type: "calculation",
      expression: {
        type: "sum",
        operands: [
          {
            type: "value",
            value: {
              type: "length",
              value: 1,
              unit: "em",
            },
          },
          {
            type: "value",
            value: {
              type: "length",
              value: 2,
              unit: "px",
            },
          },
        ],
      },
    },
    source: h.declaration("font-size", "calc(1em + 2px)").toJSON(),
  });
});

test("#computed() resolves `font-size: calc(1em + 2px)`", (t) => {
  const element = <div style={{ fontSize: "calc(1em + 2px)" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("font-size").toJSON(), {
    value: {
      type: "length",
      value: 18,
      unit: "px",
    },
    source: h.declaration("font-size", "calc(1em + 2px)").toJSON(),
  });
});

test("#cascaded() parses `font-size: calc(1em + 2%)`", (t) => {
  const element = <div style={{ fontSize: "calc(1em + 2%)" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.cascaded("font-size").get().toJSON(), {
    value: {
      type: "calculation",
      expression: {
        type: "sum",
        operands: [
          {
            type: "value",
            value: {
              type: "length",
              value: 1,
              unit: "em",
            },
          },
          {
            type: "value",
            value: {
              type: "percentage",
              value: 0.02,
            },
          },
        ],
      },
    },
    source: h.declaration("font-size", "calc(1em + 2%)").toJSON(),
  });
});

test("#computed() resolves `font-size: calc(1em + 2%)`", (t) => {
  const element = <div style={{ fontSize: "calc(1em + 2%)" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("font-size").toJSON(), {
    value: {
      type: "length",
      value: 16.32,
      unit: "px",
    },
    source: h.declaration("font-size", "calc(1em + 2%)").toJSON(),
  });
});

test("#cascaded() ignores `font-size: calc(20deg)`", (t) => {
  const element = <div style={{ fontSize: "calc(20deg)" }} />;

  const style = Style.from(element, device);

  t.equal(style.cascaded("font-size").isNone(), true);
});
