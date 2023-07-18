import { test } from "@siteimprove/alfa-test";

import { Lexer, Shadow } from "../../src";

function parse(input: string, options?: Shadow.Options) {
  return Shadow.parse(options)(Lexer.lex(input))
    .map(([, shadow]) => shadow)
    .getUnsafe()
    .toJSON();
}

test("parse() accept horizontal and vertical components", (t) => {
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

test("parse() accepts blur", (t) => {
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

test("parse() accepts spread", (t) => {
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

test("parse() optionally refuses spread", (t) => {
  for (const input of [
    "1px 2px 3px 4px",
    "inset 1px 2px 3px 4px",
    "1px 2px 3px 4px inset",
    "red 1px 2px 3px 4px",
    "1px 2px 3px 4px red",
    "red inset 1px 2px 3px 4px",
    "inset red 1px 2px 3px 4px",
    "1px 2px 3px 4px red inset",
    "1px 2px 3px 4px inset red",
    "red 1px 2px 3px 4px inset",
    "inset 1px 2px 3px 4px red",
  ]) {
    t.deepEqual(
      Shadow.parse({ withInset: true, withSpread: false })(
        Lexer.lex(input)
      ).isErr(),
      true
    );
  }
});

test("parse() accepts inset before or after lengths", (t) => {
  for (const input of [
    "1px 2px inset",
    "inset 1px 2px",
    "1px 2px 0px inset",
    "inset 1px 2px 0px",
    "1px 2px 0px 0px inset",
    "inset 1px 2px 0px 0px",
  ]) {
    const actual = parse(input);

    t.deepEqual(actual, {
      type: "shadow",
      horizontal: { type: "length", unit: "px", value: 1 },
      vertical: { type: "length", unit: "px", value: 2 },
      blur: { type: "length", unit: "px", value: 0 },
      spread: { type: "length", unit: "px", value: 0 },
      color: { type: "keyword", value: "currentcolor" },
      isInset: true,
    });
  }
});

test("parse() optionally refuses inset", (t) => {
  for (const input of [
    "inset 1px 2px",
    "1px 2px inset",
    "inset 1px 2px 3px",
    "1px 2px 3px inset",
    "inset 1px 2px 3px 4px",
    "1px 2px 3px 4px inset",
    "inset red 1px 2px 3px 4px",
    "1px 2px 3px red inset",
    "1px 2px 3px 4px inset red",
    "red 1px 2px inset",
    "inset 1px 2px 3px 4px red",
  ]) {
    t.deepEqual(
      Shadow.parse({ withInset: false, withSpread: true })(
        Lexer.lex(input)
      ).isErr(),
      true
    );
  }
});

test("parse() accepts color before or after lengths", (t) => {
  for (const input of [
    "1px 2px red",
    "red 1px 2px",
    "1px 2px 0px red",
    "red 1px 2px 0px",
    "1px 2px 0px 0px red",
    "red 1px 2px 0px 0px",
  ]) {
    const actual = parse(input);

    t.deepEqual(actual, {
      type: "shadow",
      horizontal: { type: "length", unit: "px", value: 1 },
      vertical: { type: "length", unit: "px", value: 2 },
      blur: { type: "length", unit: "px", value: 0 },
      spread: { type: "length", unit: "px", value: 0 },
      color: { type: "color", format: "named", color: "red" },
      isInset: false,
    });
  }
});

test("parse() accepts inset and color before or after lengths", (t) => {
  for (const input of [
    "1px 2px red inset",
    "red 1px 2px inset",
    "red inset 1px 2px",
    "inset red 1px 2px",
    "1px 2px 0px inset red",
    "red inset 1px 2px 0px",
    "red 1px 2px 0px 0px inset",
    "inset 1px 2px 0px 0px red",
    "inset red 1px 2px 0px 0px",
    "1px 2px 0px 0px inset red",
    "1px 2px 0px 0px red inset",
  ]) {
    const actual = parse(input);

    t.deepEqual(actual, {
      type: "shadow",
      horizontal: { type: "length", unit: "px", value: 1 },
      vertical: { type: "length", unit: "px", value: 2 },
      blur: { type: "length", unit: "px", value: 0 },
      spread: { type: "length", unit: "px", value: 0 },
      color: { type: "color", format: "named", color: "red" },
      isInset: true,
    });
  }
});

test("parse() refuses inset or color between lengths", (t) => {
  for (const input of [
    "1px red 2px",
    "1px inset 2px",
    "1px red 2px inset",
    "1px red 2px 3px",
    "1px 2px red 3px",
    "1px inset 2px 3px",
    "1px red 2px inset 3px",
    "red 1px 2px inset 3px",
    "1px red 2px 3px 4px",
    "1px 2px red 3px 4px",
    "1px 2px 3px inset 4px",
    "red 1px inset 2px 3px 4px",
  ]) {
    const result = Shadow.parse({ withInset: false, withSpread: true })(
      Lexer.lex(input)
    );

    // It either fails to parse, or fails to consume all tokens
    t.deepEqual(!result.isOk() || !result.get()[0].isEmpty(), true);
  }
});
