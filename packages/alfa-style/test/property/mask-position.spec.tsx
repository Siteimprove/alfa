import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../../dist/index.js";

const device = Device.standard();

test("initial value is 0% 0%", (t) => {
  const element = <div></div>;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("mask-position").toJSON(), {
    value: {
      type: "list",
      separator: ", ",
      values: [
        {
          type: "position",
          horizontal: {
            type: "side",
            side: {
              type: "keyword",
              value: "left",
            },
            offset: {
              type: "percentage",
              value: 0,
            },
          },
          vertical: {
            type: "side",
            side: {
              type: "keyword",
              value: "top",
            },
            offset: {
              type: "percentage",
              value: 0,
            },
          },
        },
      ],
    },
    source: null,
  });
});
