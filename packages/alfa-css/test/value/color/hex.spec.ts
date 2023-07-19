import { test } from "@siteimprove/alfa-test";

import { Hex, type RGB } from "../../../src";

import { parserUnsafe } from "../../common/parse";

const parse = parserUnsafe(Hex.parse);

test("parse() accepts hex format with various numbers of digits", (t) => {
  const expected = (value: number): Hex.JSON => ({
    type: "color",
    format: "hex",
    value: value,
  });

  for (const [name, value] of [
    ["#00F", 65535],
    ["#00f8", 65416],
    ["#0000ff", 65535],
    ["#0000ff88", 65416],
  ] as const) {
    t.deepEqual(parse(name).toJSON(), expected(value));
  }
});

test("#resolve() returns RGB in percentages", (t) => {
  const expected = (red: number, green: number, blue: number): RGB.JSON => ({
    type: "color",
    format: "rgb",
    red: { type: "percentage", value: red },
    green: { type: "percentage", value: green },
    blue: { type: "percentage", value: blue },
    alpha: { type: "percentage", value: 1 },
  });

  for (const [name, red, green, blue] of [
    ["#00ffff", 0, 1, 1],
    ["#ff00ff", 1, 0, 1],
  ] as const) {
    t.deepEqual(parse(name).resolve().toJSON(), expected(red, green, blue));
  }
});
