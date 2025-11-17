import { test } from "@siteimprove/alfa-test";

import { HWB } from "../../../dist/index.js";

import { parser, parserUnsafe } from "../../common/parse.js";

const parse = parserUnsafe(HWB.parse);
const parseErr = parser(HWB.parse);

test("parse() parses an HWB color", (t) => {
  const expected = (type: "angle" | "number"): HWB.JSON => ({
    type: "color",
    format: "hwb",
    hue:
      type === "angle"
        ? { type: "angle", value: 0, unit: "deg" }
        : { type: "number", value: 0 },
    whiteness: { type: "percentage", value: 1 },
    blackness: { type: "percentage", value: 1 },
    alpha: { type: "number", value: 1 },
  });

  for (const [actual, type] of [
    [parse("hwb(0 100% 100%)"), "number"],
    [parse("hwb(0deg 100% 100%)"), "angle"],
    [parse("hwb(0deg 100% 100% / 1)"), "angle"],
    [parse("hwb(0 100% 100%/  1)"), "number"],
  ] as const) {
    t.deepEqual(actual.toJSON(), expected(type));
  }
});

test("parse() rejects numbers for whiteness and blackness", (t) => {
  for (const color of [
    "hwb(0 100% 1)",
    "hwb(0 100% 0 / 1)",
    "hwb(0 0 100%)",
    "hwb(0, 1, 100%)",
    "hwb(0, 0, 100%)",
    "hwb(0, 100%, 1, 1)",
  ]) {
    t.deepEqual(parseErr(color).isErr(), true);
  }
});

test("parse() accepts `none`", (t) => {
  const expected = (type: "number" | "percentage") => ({
    type: "color",
    format: "hwb",
    hue: { type: "number", value: 0 },
    whiteness: { type: "percentage", value: 1 },
    blackness: { type: "percentage", value: 0 },
    alpha: { type, value: 0 },
  });

  for (const [actual, type] of [
    [parse("hwb(0 100% 0% / 0%)"), "percentage"],
    [parse("hwb(0 100% 0% / none)"), "number"],
    [parse("hwb(none 100% 0% / 0%)"), "percentage"],
    [parse("hwb(0 100% none / none)"), "number"],
  ] as const) {
    t.deepEqual(actual.toJSON(), expected(type));
  }
});

test("parse() accepts calculations", (t) => {
  const expected = (type: "number" | "angle"): HWB.JSON => ({
    type: "color",
    format: "hwb",
    hue:
      type === "angle"
        ? { type: "angle", value: 0, unit: "deg" }
        : { type: "number", value: 0 },
    whiteness: { type: "percentage", value: 1 },
    blackness: { type: "percentage", value: 0 },
    alpha: { type: "number", value: 0 },
  });

  for (const [actual, type] of [
    [parse("hwb(0 100% 0% / 0)"), "number"],
    [parse("hwb(0 100% 0% / calc(10 - 5 + 2*3 - 11)"), "number"],
    [parse("hwb(calc(3deg + 3deg - 6deg) 100% 0% / 0)"), "angle"],
    [parse("hwb(0 100% calc(0*2%) / calc(1 + 1 + 2 - 2*2))"), "number"],
  ] as const) {
    t.deepEqual(actual.toJSON(), expected(type));
  }
});

test("#resolve() returns RBG color in percentages", (t) => {
  t.deepEqual(parse("hwb(0 100% 100%)").resolve().toJSON(), {
    type: "color",
    format: "rgb",
    red: { type: "percentage", value: 0.5 },
    green: { type: "percentage", value: 0.5 },
    blue: { type: "percentage", value: 0.5 },
    alpha: { type: "percentage", value: 1 },
  });
});
