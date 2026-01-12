import type { Result } from "@siteimprove/alfa-result";
import { test } from "@siteimprove/alfa-test";

import { Length, Lexer, Shadow } from "../../dist/index.js";

import { color } from "../common/color.js";
import { parser, parserUnsafe, serializer } from "../common/parse.js";

function parse(input: string, options?: Shadow.Options): Shadow {
  return parserUnsafe(Shadow.parse(options))(input);
}

function serialize(input: string, options?: Shadow.Options): Shadow.JSON {
  return serializer(Shadow.parse(options))(input);
}

function parseErr(
  input: string,
  options?: Shadow.Options,
): Result<Shadow, string> {
  return parser(Shadow.parse(options))(input);
}

test("parse() accept horizontal and vertical components", (t) => {
  const actual = serialize("1px 2px");

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
  const actual = serialize("1px 2px 3px");

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
  const actual = serialize("1px 2px 3px 4px");

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
    t(parseErr(input, { withInset: true, withSpread: false }).isErr());
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
    const actual = serialize(input);

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
    t(parseErr(input, { withInset: false, withSpread: true }).isErr());
  }
});

const red = color(1, 0, 0);

test("parse() accepts color before or after lengths", (t) => {
  for (const input of [
    "1px 2px red",
    "red 1px 2px",
    "1px 2px 0px red",
    "red 1px 2px 0px",
    "1px 2px 0px 0px red",
    "red 1px 2px 0px 0px",
  ]) {
    const actual = serialize(input);

    t.deepEqual(actual, {
      type: "shadow",
      horizontal: { type: "length", unit: "px", value: 1 },
      vertical: { type: "length", unit: "px", value: 2 },
      blur: { type: "length", unit: "px", value: 0 },
      spread: { type: "length", unit: "px", value: 0 },
      color: red,
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
    const actual = serialize(input);

    t.deepEqual(actual, {
      type: "shadow",
      horizontal: { type: "length", unit: "px", value: 1 },
      vertical: { type: "length", unit: "px", value: 2 },
      blur: { type: "length", unit: "px", value: 0 },
      spread: { type: "length", unit: "px", value: 0 },
      color: red,
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
      Lexer.lex(input),
    );

    // It either fails to parse, or fails to consume all tokens
    t.deepEqual(!result.isOk() || !result.get()[0].isEmpty(), true);
  }
});

test(".resolve() returns a canonical shadow", (t) => {
  const actual = parse("1px 1em 2vh 4rem red inset").resolve({
    length: Length.resolver(
      Length.of(16, "px"),
      Length.of(10, "px"),
      Length.of(16, "px"),
      Length.of(20, "px"),
    ),
  });

  t.deepEqual(actual.toJSON(), {
    type: "shadow",
    horizontal: { type: "length", unit: "px", value: 1 },
    vertical: { type: "length", unit: "px", value: 16 },
    blur: { type: "length", unit: "px", value: 0.4 },
    spread: { type: "length", unit: "px", value: 40 },
    color: red,
    isInset: true,
  });
});

test("parse() accepts calculations", (t) => {
  const actual = Shadow.parse({ withInset: false, withSpread: true })(
    Lexer.lex("1em calc(1px + 1px) calc(1px + 2rem) calc(2*2px) red"),
  ).getUnsafe()[1];

  t.deepEqual(
    actual
      .resolve({
        length: Length.resolver(
          Length.of(16, "px"),
          Length.of(10, "px"),
          Length.of(16, "px"),
          Length.of(20, "px"),
        ),
      })
      .toJSON(),
    {
      type: "shadow",
      horizontal: { type: "length", unit: "px", value: 16 },
      vertical: { type: "length", unit: "px", value: 2 },
      blur: { type: "length", unit: "px", value: 21 },
      spread: { type: "length", unit: "px", value: 4 },
      color: red,
      isInset: false,
    },
  );
});
