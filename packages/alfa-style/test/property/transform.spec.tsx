import { Device } from "@siteimprove/alfa-device";
import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { Style } from "../../dist/index.js";

const device = Device.standard();

test("#computed parses transform: scale(2)", (t) => {
  const element = <div style={{ transform: "scale(2)" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("transform").toJSON(), {
    value: {
      type: "list",
      values: [
        {
          kind: "scale",
          type: "transform",
          x: {
            type: "number",
            value: 2,
          },
          y: {
            type: "number",
            value: 2,
          },
          z: null,
        },
      ],
      separator: " ",
    },
    source: h.declaration("transform", "scale(2)").toJSON(),
  });
});

test("#computed parses transform: scale3d(1, 2, 3)", (t) => {
  const element = <div style={{ transform: "scale3d(1, 2, 3)" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("transform").toJSON(), {
    value: {
      type: "list",
      values: [
        {
          kind: "scale",
          type: "transform",
          x: {
            type: "number",
            value: 1,
          },
          y: {
            type: "number",
            value: 2,
          },
          z: {
            type: "number",
            value: 3,
          },
        },
      ],
      separator: " ",
    },
    source: h.declaration("transform", "scale3d(1, 2, 3)").toJSON(),
  });
});

test("#computed parses transform: scaleZ(2)", (t) => {
  const element = <div style={{ transform: "scaleZ(2)" }} />;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("transform").toJSON(), {
    value: {
      type: "list",
      values: [
        {
          kind: "scale",
          type: "transform",
          x: {
            type: "number",
            value: 1,
          },
          y: {
            type: "number",
            value: 1,
          },
          z: {
            type: "number",
            value: 2,
          },
        },
      ],
      separator: " ",
    },
    source: h.declaration("transform", "scaleZ(2)").toJSON(),
  });
});
