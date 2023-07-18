import { test } from "@siteimprove/alfa-test";

import { Lexer, Shadow } from "../../src";

function parse(input: string, options?: Shadow.Options) {
  return Shadow.parse(options)(Lexer.lex(input))
    .map(([, shadow]) => shadow)
    .getUnsafe()
    .toJSON();
}

test("parse() parses `1px 2px`", (t) => {
  const actual = parse("1px 2px");

  t.deepEqual(actual, {
    type: "shadow",
    horizontal: { type: "length", unit: "px", value: 1 },
    vertical: { type: "length", unit: "px", value: 2 },
    blur: { type: "length", unit: "px", value: 0 },
    spread: { type: "length", unit: "px", value: 0 },
    color: { type: "keyword", value: "currentcolor" },
    isInset: false,
  });
});

test("parse() parses `1px 2px 3px`", (t) => {
  const actual = parse("1px 2px 3px");

  t.deepEqual(actual, {
    type: "shadow",
    horizontal: { type: "length", unit: "px", value: 1 },
    vertical: { type: "length", unit: "px", value: 2 },
    blur: { type: "length", unit: "px", value: 3 },
    spread: { type: "length", unit: "px", value: 0 },
    color: { type: "keyword", value: "currentcolor" },
    isInset: false,
  });
});

test("parse() parses `1px 2px 3px 4px`", (t) => {
  const actual = parse("1px 2px 3px 4px");

  t.deepEqual(actual, {
    type: "shadow",
    horizontal: { type: "length", unit: "px", value: 1 },
    vertical: { type: "length", unit: "px", value: 2 },
    blur: { type: "length", unit: "px", value: 3 },
    spread: { type: "length", unit: "px", value: 4 },
    color: { type: "keyword", value: "currentcolor" },
    isInset: false,
  });
});

test("parse() parses `1px 2px inset`", (t) => {
  const actual = parse("1px 2px inset");

  t.deepEqual(actual, {
    type: "shadow",
    horizontal: { type: "length", unit: "px", value: 1 },
    vertical: { type: "length", unit: "px", value: 2 },
    blur: { type: "length", unit: "px", value: 0 },
    spread: { type: "length", unit: "px", value: 0 },
    color: { type: "keyword", value: "currentcolor" },
    isInset: true,
  });
});

test("parse() parses `inset 1px 2px`", (t) => {
  const actual = parse("inset 1px 2px");

  t.deepEqual(actual, {
    type: "shadow",
    horizontal: { type: "length", unit: "px", value: 1 },
    vertical: { type: "length", unit: "px", value: 2 },
    blur: { type: "length", unit: "px", value: 0 },
    spread: { type: "length", unit: "px", value: 0 },
    color: { type: "keyword", value: "currentcolor" },
    isInset: true,
  });
});

test("parse() parses `1px 2px red`", (t) => {
  const actual = parse("1px 2px red");

  t.deepEqual(actual, {
    type: "shadow",
    horizontal: { type: "length", unit: "px", value: 1 },
    vertical: { type: "length", unit: "px", value: 2 },
    blur: { type: "length", unit: "px", value: 0 },
    spread: { type: "length", unit: "px", value: 0 },
    color: { type: "color", format: "named", color: "red" },
    isInset: false,
  });
});

test("parse() parses `red 1px 2px`", (t) => {
  const actual = parse("red 1px 2px");

  t.deepEqual(actual, {
    type: "shadow",
    horizontal: { type: "length", unit: "px", value: 1 },
    vertical: { type: "length", unit: "px", value: 2 },
    blur: { type: "length", unit: "px", value: 0 },
    spread: { type: "length", unit: "px", value: 0 },
    color: { type: "color", format: "named", color: "red" },
    isInset: false,
  });
});

test("parse() parses `red 1px 2px inset`", (t) => {
  const actual = parse("red 1px 2px inset");

  t.deepEqual(actual, {
    type: "shadow",
    horizontal: { type: "length", unit: "px", value: 1 },
    vertical: { type: "length", unit: "px", value: 2 },
    blur: { type: "length", unit: "px", value: 0 },
    spread: { type: "length", unit: "px", value: 0 },
    color: { type: "color", format: "named", color: "red" },
    isInset: true,
  });
});
