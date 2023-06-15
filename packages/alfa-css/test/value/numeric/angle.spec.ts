import { test } from "@siteimprove/alfa-test";

import { Angle, Lexer } from "../../../src";

function parse(input: string) {
  return Angle.parse(Lexer.lex(input)).map(([, angle]) => angle);
}

test("parse() accepts angles", (t) => {
  t.deepEqual(parse("2deg").getUnsafe().toJSON(), {
    type: "angle",
    value: 2,
    unit: "deg",
  });
});

test("parse() accepts math expressions reducing to angles", (t) => {
  t.deepEqual(parse("calc(2deg + 1turn)").getUnsafe().toJSON(), {
    type: "angle",
    math: {
      type: "math expression",
      expression: {
        type: "value",
        value: {
          type: "angle",
          value: 362,
          unit: "deg",
        },
      },
    },
  });
});

test("parse() rejects math expressions with percentages", (t) => {
  t.deepEqual(parse("calc(10deg + 5%)").isErr(), true);
});

test("parse() rejects math expressions with lengths", (t) => {
  t.deepEqual(parse("calc(10px + 1em)").isErr(), true);
});

test("parse() rejects math expressions without angle", (t) => {
  t.deepEqual(parse("calc(10 + 1)").isErr(), true);
});

test("resolve() reduces angles", (t) => {
  t.deepEqual(parse("calc(1turn + 2deg)").getUnsafe().resolve().toJSON(), {
    type: "angle",
    value: 362,
    unit: "deg",
  });
});
