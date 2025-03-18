import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";
import { Option } from "@siteimprove/alfa-option";
import { Rectangle } from "@siteimprove/alfa-rectangle";

import { Text } from "../../dist/index.js";

const device = Device.standard();

test("#of() accepts optional box and device", (t) => {
  t.deepEqual(
    Text.of(
      "foo",
      Option.of(Rectangle.of(8, 8, 50, 50)),
      Option.of(device),
    ).toJSON({ device }),
    {
      type: "text",
      data: "foo",
      box: { type: "rectangle", x: 8, y: 8, width: 50, height: 50 },
    },
  );
});

test("#of() handles missing optional parameters", (t) => {
  t.deepEqual(Text.of("foo").toJSON({ device }), {
    type: "text",
    data: "foo",
    box: null,
  });
});
