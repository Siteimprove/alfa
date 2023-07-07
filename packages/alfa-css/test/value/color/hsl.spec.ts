import { test } from "@siteimprove/alfa-test";

import { HSL, Lexer } from "../../../src";

const parse = (str: string) => HSL.parse(Lexer.lex(str)).getUnsafe()[1];

test("parse() accepts legacy syntax with percentages", (t) => {
  const expected = (type: "angle" | "number"): HSL.JSON => ({
    type: "color",
    format: "hsl",
    hue:
      type === "angle"
        ? { type: "angle", value: 0, unit: "deg" }
        : { type: "number", value: 0 },
    saturation: { type: "percentage", value: 1 },
    lightness: { type: "percentage", value: 1 },
    alpha: { type: "number", value: 1 },
  });

  for (const [actual, type] of [
    [parse("hsl(0, 100%, 100%)"), "number"],
    [parse("hsla(0deg, 100%, 100%)"), "angle"],
    [parse("hsl(0deg, 100%, 100%, 1)"), "angle"],
    [parse("hsla(0, 100%, 100%, 1)"), "number"],
  ] as const) {
    t.deepEqual(actual.toJSON(), expected(type));
  }
});

test("parse() accepts modern syntax with percentage", (t) => {
  const expected = (type: "angle" | "number"): HSL.JSON => ({
    type: "color",
    format: "hsl",
    hue:
      type === "angle"
        ? { type: "angle", value: 0, unit: "deg" }
        : { type: "number", value: 0 },
    saturation: { type: "percentage", value: 1 },
    lightness: { type: "percentage", value: 1 },
    alpha: { type: "number", value: 1 },
  });

  for (const [actual, type] of [
    [parse("hsl(0 100% 100%)"), "number"],
    [parse("hsla(0deg 100% 100%)"), "angle"],
    [parse("hsl(0deg 100% 100% / 1)"), "angle"],
    [parse("hsla(0 100% 100%/  1)"), "number"],
  ] as const) {
    t.deepEqual(actual.toJSON(), expected(type));
  }
});

test("parse() rejects numbers for saturation and lightness", (t) => {
  for (const color of [
    "hsl(0 100% 1)",
    "hsl(0 100% 0 / 1)",
    "hsl(0 0 100%)",
    "hsl(0, 1, 100%)",
    "hsl(0, 0, 100%)",
    "hsl(0, 100%, 1, 1)",
  ]) {
    t.deepEqual(HSL.parse(Lexer.lex(color)).isErr(), true);
  }
});

test("parse() accepts `none` in modern syntax", (t) => {
  const expected = {
    type: "color",
    format: "hsl",
    hue: { type: "number", value: 0 },
    saturation: { type: "percentage", value: 1 },
    lightness: { type: "percentage", value: 0 },
    alpha: { type: "percentage", value: 0 },
  };

  for (const actual of [
    parse("hsl(0 100% 0% / 0%)"),
    parse("hsla(0 100% 0% / none)"),
    parse("hsl(none 100% 0% / 0%)"),
    parse("hsla(0 100% none / none)"),
  ] as const) {
    t.deepEqual(actual.toJSON(), expected);
  }
});

test("parse() rejects `none` in legacy syntax", (t) => {
  for (const str of [
    "hsl(none, 255, 100)",
    "hsla(100, 255, none)",
    "hsla(100, none, 0)",
    "hsl(100, 255, 255, none)",
  ]) {
    t.deepEqual(HSL.parse(Lexer.lex(str)).isErr(), true);
  }
});

test("parse() accepts calculations", (t) => {
  const expected = (type: "number" | "angle") =>
    ({
      type: "color",
      format: "hsl",
      hue:
        type === "angle"
          ? { type: "angle", value: 0, unit: "deg" }
          : { type: "number", value: 0 },
      saturation: { type: "percentage", value: 1 },
      lightness: { type: "percentage", value: 0 },
      alpha: { type: "number", value: 0 },
    } as HSL.JSON);

  for (const [actual, type] of [
    [parse("hsl(0 100% 0% / 0)"), "number"],
    [parse("hsla(0 100% 0% / calc(10 - 5 + 2*3 - 11)"), "number"],
    [parse("hsl(calc(3deg + 3deg - 6deg) 100% 0% / 0)"), "angle"],
    [parse("hsla(0, 100%, calc(0*2%), calc(1 + 1 + 2 - 2*2))"), "number"],
  ] as const) {
    t.deepEqual(actual.toJSON(), expected(type));
  }
});
