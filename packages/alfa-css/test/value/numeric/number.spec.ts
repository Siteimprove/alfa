import { test } from "@siteimprove/alfa-test";

import { Lexer, Number } from "../../../src";

function parse(input: string) {
  return Number.parse(Lexer.lex(input)).map(([, value]) => value);
}

test("parse() accepts numbers", (t) => {
  t.deepEqual(parse("3.14").getUnsafe().toJSON(), {
    type: "number",
    value: 3.14,
  });
});

test("parse() accepts math expressions reducing to numbers", (t) => {
  t.deepEqual(parse("calc((12 + 9) * 2)").getUnsafe().toJSON(), {
    type: "number",
    math: {
      type: "math expression",
      expression: {
        type: "value",
        value: {
          type: "number",
          value: 42,
        },
      },
    },
  });
});

test("parse() rejects math expressions with percentages", (t) => {
  t.deepEqual(parse("calc(10px + 5%)").isErr(), true);
});

test("parse() rejects math expressions with angles", (t) => {
  t.deepEqual(parse("calc(10deg + 1rad)").isErr(), true);
});

test("parse() rejects math expressions with length", (t) => {
  t.deepEqual(parse("calc(10em + 1px)").isErr(), true);
});

test("resolve() returns a bare value", (t) => {
  t.deepEqual(parse("calc((12 + 9) * 2)").getUnsafe().resolve().toJSON(), {
    type: "number",
    value: 42,
  });
});
