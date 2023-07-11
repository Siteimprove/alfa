import { test } from "@siteimprove/alfa-test";

import { Lexer, Named, type RGB } from "../../../src";

const parse = (str: string) => Named.parse(Lexer.lex(str)).getUnsafe()[1];

test("parse() accepts named colors", (t) => {
  const expected = (name: Named.Color): Named.JSON => ({
    type: "color",
    format: "named",
    color: name,
  });

  for (const name of ["cyan", "red", "brown", "chocolate", "salmon"] as const) {
    t.deepEqual(parse(name).toJSON(), expected(name));
  }
});

test("parse() rejects invalid names", (t) => {
  for (const name of ["foo", "hello", "world"]) {
    t.deepEqual(Named.parse(Lexer.lex(name)).isErr(), true);
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
    ["cyan", 0, 1, 1],
    ["magenta", 1, 0, 1],
  ] as const) {
    t.deepEqual(parse(name).resolve().toJSON(), expected(red, green, blue));
  }
});
