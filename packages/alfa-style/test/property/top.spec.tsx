import { Device } from "@siteimprove/alfa-device";
import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { Style } from "../../src";

const device = Device.standard();

test("#computed fully resolves length", (t) => {
  const element = <div style={{ top: "1em" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("top").toJSON(), {
    value: { type: "length", value: 16, unit: "px" },
    source: h.declaration("top", "1em").toJSON(),
  });
});

test("#computed leaves percentages untouched", (t) => {
  const element = <div style={{ top: "10%" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("top").toJSON(), {
    value: { type: "percentage", value: 0.1 },
    source: h.declaration("top", "10%").toJSON(),
  });
});

test("#computed fully resolves calculated length", (t) => {
  const element = <div style={{ top: "calc(1em - 2px)" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("top").toJSON(), {
    value: { type: "length", value: 14, unit: "px" },
    source: h.declaration("top", "calc(1em - 2px)").toJSON(),
  });
});

test("#computed fully reduces calculated percentages", (t) => {
  const element = <div style={{ top: "calc(10% * 2)" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("top").toJSON(), {
    value: { type: "percentage", value: 0.2 },
    source: h.declaration("top", "calc(10% * 2)").toJSON(),
  });
});

test("#computed fully leaves mixed calculations untouched", (t) => {
  const element = <div style={{ top: "calc(1em + 1%)" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("top").toJSON(), {
    value: {
      type: "length-percentage",
      math: {
        type: "math expression",
        expression: {
          type: "calculation",
          arguments: [
            {
              type: "sum",
              operands: [
                {
                  type: "value",
                  value: { type: "length", unit: "em", value: 1 },
                },
                {
                  type: "value",
                  value: { type: "percentage", value: 0.01 },
                },
              ],
            },
          ],
        },
      },
    },
    source: h.declaration("top", "calc(1em + 1%)").toJSON(),
  });
});
