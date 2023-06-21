import { test } from "@siteimprove/alfa-test";

import { Lexer, Percentage } from "../../../src";

function parse(input: string) {
  return Percentage.parse(Lexer.lex(input)).map(([, value]) => value);
}

test("parse() accepts percentages", (t) => {
  t.deepEqual(parse("42%").getUnsafe().toJSON(), {
    type: "percentage",
    value: 0.42,
  });
});

test("parse() accepts math expressions reducing to percentages", (t) => {
  t.deepEqual(parse("calc((12% + 9%) * 2)").getUnsafe().toJSON(), {
    type: "percentage",
    math: {
      type: "math expression",
      expression: {
        type: "value",
        value: {
          type: "percentage",
          value: 0.42,
        },
      },
    },
  });
});

test("parse() rejects math expressions with length", (t) => {
  t.deepEqual(parse("calc(10px + 5%)").isErr(), true);
});

test("parse() rejects math expressions with angles", (t) => {
  t.deepEqual(parse("calc(10deg + 1rad)").isErr(), true);
});

test("parse() rejects math expressions with only numbers", (t) => {
  t.deepEqual(parse("calc(10 + 1)").isErr(), true);
});

test("resolve() returns a bare value", (t) => {
  t.deepEqual(parse("calc((12% + 9%) * 2)").getUnsafe().resolve().toJSON(), {
    type: "percentage",
    value: 0.42,
  });
});
