import { test } from "@siteimprove/alfa-test";

import { Length as BaseLength, Lexer } from "../../../src";
import { Length } from "../../../src/value/numeric";

function parse(input: string) {
  return Length.parse(Lexer.lex(input)).map(([, length]) => length);
}

test("parse() accepts length", (t) => {
  t.deepEqual(parse("2em").getUnsafe().toJSON(), {
    type: "length",
    value: 2,
    unit: "em",
    math: null,
  });
});

test("parse() accepts math expression reducing to lengths", (t) => {
  t.deepEqual(parse("calc(2px + 1vh)").getUnsafe().toJSON(), {
    type: "length",
    value: null,
    unit: null,
    math: {
      type: "math expression",
      expression: {
        type: "calculation",
        arguments: [
          {
            type: "sum",
            operands: [
              {
                type: "value",
                value: { type: "length", value: 2, unit: "px" },
              },
              {
                type: "value",
                value: { type: "length", value: 1, unit: "vh" },
              },
            ],
          },
        ],
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

test("parse() rejects math expressions without length", (t) => {
  t.deepEqual(parse("calc(10 + 1)").isErr(), true);
});

test("resolve() absolutize lengths", (t) => {
  t.deepEqual(
    parse("calc(1em + 2px)")
      .getUnsafe()
      .resolve(() => BaseLength.of(16, "px"))
      .toJSON(),
    {
      type: "length",
      value: 18,
      unit: "px",
      math: null,
    }
  );
});
