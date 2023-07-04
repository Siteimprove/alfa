import { test } from "@siteimprove/alfa-test";

import { Lexer, RGB } from "../../../src";

const parse = (str: string) => RGB.parse(Lexer.lex(str)).getUnsafe()[1];

test("parse() legacy syntax with numbers", (t) => {
  const expected: RGB.JSON = {
    type: "color",
    format: "rgb",
    red: {
      value: 255,
      type: "number",
    },
    green: {
      value: 255,
      type: "number",
    },
    blue: {
      value: 255,
      type: "number",
    },
    alpha: {
      value: 1,
      type: "number",
    },
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

test("parse() legacy syntax with numbers", (t) => {
  const expected: RGB.JSON = {
    type: "color",
    format: "rgb",
    red: {
      value: 1,
      type: "percentage",
    },
    green: {
      value: 1,
      type: "percentage",
    },
    blue: {
      value: 1,
      type: "percentage",
    },
    alpha: {
      value: 1,
      type: "number",
    },
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

test("parse() modern syntax with numbers", (t) => {
  const expected: RGB.JSON = {
    type: "color",
    format: "rgb",
    red: {
      value: 255,
      type: "number",
    },
    green: {
      value: 255,
      type: "number",
    },
    blue: {
      value: 255,
      type: "number",
    },
    alpha: {
      value: 1,
      type: "number",
    },
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

test("parse() modern syntax with numbers", (t) => {
  const expected: RGB.JSON = {
    type: "color",
    format: "rgb",
    red: {
      value: 1,
      type: "percentage",
    },
    green: {
      value: 1,
      type: "percentage",
    },
    blue: {
      value: 1,
      type: "percentage",
    },
    alpha: {
      value: 1,
      type: "number",
    },
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

test("parse() refuse mixing numbers and percentages", (t) => {
  for (const str of [
    "rgba(100 255 100%)",
    "rgba(100% 255 100%)",
    "rgba(100%, 255, 100)",
    "rgba(100, 255, 100%)",
  ]) {
    t.deepEqual(RGB.parse(Lexer.lex(str)).isErr(), true);
  }
});
