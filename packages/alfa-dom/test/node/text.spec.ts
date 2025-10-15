import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";
import { Option } from "@siteimprove/alfa-option";
import { Rectangle } from "@siteimprove/alfa-rectangle";
import { String } from "@siteimprove/alfa-string";
import { Predicate } from "@siteimprove/alfa-predicate";

import { Text } from "../../dist/index.js";

const { not } = Predicate;

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

test("Text.is detects non-whitespace using not(String.isWhitespace)", (t) => {
  const whitespace = Text.of(" \t\n\r");
  const isNotWhitespace = Text.is(not(String.isWhitespace));
  t.equal(isNotWhitespace(whitespace), false);
});
