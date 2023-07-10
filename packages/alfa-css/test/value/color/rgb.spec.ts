import { test } from "@siteimprove/alfa-test";

import { Lexer, RGB } from "../../../src";

const parse = (str: string) => RGB.parse(Lexer.lex(str)).getUnsafe()[1];

test("parse() accepts legacy syntax with numbers", (t) => {
  const expected: RGB.JSON = {
    type: "color",
    format: "rgb",
    red: { type: "number", value: 255 },
    green: { type: "number", value: 255 },
    blue: { type: "number", value: 255 },
    alpha: { type: "number", value: 1 },
  };

  for (const actual of [
    parse("rgb(255, 255, 255)"),
    parse("rgba(255, 255, 255)"),
    parse("rgb(255, 255, 255, 1)"),
    parse("rgba(255, 255, 255, 1)"),
    parse("rgba(  255,   255  , 255,     1)"),
  ]) {
    t.deepEqual(actual.toJSON(), expected);
  }
});

test("parse() accepts legacy syntax with percentages", (t) => {
  const expected: RGB.JSON = {
    type: "color",
    format: "rgb",
    red: { type: "percentage", value: 1 },
    green: { type: "percentage", value: 1 },
    blue: { type: "percentage", value: 1 },
    alpha: { type: "number", value: 1 },
  };

  for (const actual of [
    parse("rgb(100%, 100%, 100%)"),
    parse("rgba(100%, 100%, 100%)"),
    parse("rgb(100%, 100%, 100%, 1)"),
    parse("rgba(100%, 100%, 100%, 1)"),
  ]) {
    t.deepEqual(actual.toJSON(), expected);
  }
});

test("parse() accepts modern syntax with numbers", (t) => {
  const expected: RGB.JSON = {
    type: "color",
    format: "rgb",
    red: { type: "number", value: 255 },
    green: { type: "number", value: 255 },
    blue: { type: "number", value: 255 },
    alpha: { type: "number", value: 1 },
  };

  for (const actual of [
    parse("rgb(255 255 255)"),
    parse("rgba(255 255 255)"),
    parse("rgb(255 255 255 / 1)"),
    parse("rgba(255 255 255 / 1)"),
  ]) {
    t.deepEqual(actual.toJSON(), expected);
  }
});

test("parse() accepts modern syntax with percentage", (t) => {
  const expected: RGB.JSON = {
    type: "color",
    format: "rgb",
    red: { type: "percentage", value: 1 },
    green: { type: "percentage", value: 1 },
    blue: { type: "percentage", value: 1 },
    alpha: { type: "number", value: 1 },
  };

  for (const actual of [
    parse("rgb(100% 100% 100%)"),
    parse("rgba(100% 100% 100%)"),
    parse("rgb(100% 100% 100% / 1)"),
    parse("rgba(100% 100% 100%/  1)"),
  ]) {
    t.deepEqual(actual.toJSON(), expected);
  }
});

test("parse() refuses mixing numbers and percentages", (t) => {
  for (const str of [
    "rgba(100 255 100%)",
    "rgba(100% 255 100%)",
    "rgba(100%, 255, 100)",
    "rgba(100, 255, 100%)",
  ]) {
    t.deepEqual(RGB.parse(Lexer.lex(str)).isErr(), true);
  }
});

test("parse() accepts `none` in modern syntax", (t) => {
  const expected = (type: "number" | "percentage") => ({
    type: "color",
    format: "rgb",
    red: { type: type, value: 0 },
    green: { type: type, value: type === "number" ? 255 : 1 },
    blue: { type: type, value: 0 },
    alpha: { type: "percentage", value: 0 },
  });

  for (const [actual, type] of [
    [parse("rgb(0% 100% 0% / 0%)"), "percentage"],
    [parse("rgba(0 255 0 / none)"), "number"],
    [parse("rgb(none 100% 0% / 0%)"), "percentage"],
    [parse("rgba(0 255 none/ none)"), "number"],
  ] as const) {
    t.deepEqual(actual.toJSON(), expected(type));
  }
});

test("parse() rejects `none` in legacy syntax", (t) => {
  for (const str of [
    "rgba(none, 255, 100)",
    "rgba(100, 255, none)",
    "rgba(100, none, 0)",
    "rgba(100, 255, 255, none)",
  ]) {
    t.deepEqual(RGB.parse(Lexer.lex(str)).isErr(), true);
  }
});

test("#resolve() returns percentages", (t) => {
  const expected: RGB.JSON = {
    type: "color",
    format: "rgb",
    red: { type: "percentage", value: 1 },
    green: { type: "percentage", value: 1 },
    blue: { type: "percentage", value: 1 },
    alpha: { type: "percentage", value: 1 },
  };

  for (const actual of [
    parse("rgb(255, 255, 255)"),
    parse("rgba(255, 255, 255)"),
    parse("rgb(255, 255, 255, 1)"),
    parse("rgba(100%, 100%, 100%)"),
    parse("rgb(100%, 100%, 100%, 1)"),
    parse("rgba(255 255 255)"),
    parse("rgb(255 255 255 / 1)"),
    parse("rgba(100% 100% 100%)"),
    parse("rgb(100% 100% 100% / 1)"),
    parse("rgba(100% 100% 100%/  1)"),
  ]) {
    t.deepEqual(actual.resolve().toJSON(), expected);
  }
});

test("parse() accepts calculations", (t) => {
  const expected = (type: "number" | "percentage") =>
    ({
      type: "color",
      format: "rgb",
      red: { type: type, value: 0 },
      green: { type: type, value: type === "number" ? 255 : 1 },
      blue: { type: type, value: 0 },
      alpha: { type: "number", value: 0 },
    } as RGB.JSON);

  for (const [actual, type] of [
    [parse("rgb(0% 100% 0% / 0)"), "percentage"],
    [parse("rgba(0 255 0 / calc(10 - 5 + 2*3 - 11)"), "number"],
    [parse("rgb(calc(3% + 3% - 6%) 100% 0% / 0)"), "percentage"],
    [parse("rgba(0 255 calc(0*2) / calc(1 + 1 + 2 - 2*2))"), "number"],
  ] as const) {
    t.deepEqual(actual.toJSON(), expected(type));
  }
});
