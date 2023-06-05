import { test } from "@siteimprove/alfa-test";

import { Length as BaseLength } from "../../../src/calculation/numeric/length";

import { Length, Lexer } from "../../../src";
import { Result } from "@siteimprove/alfa-result";

function parse(input: string, calc?: true): Result<Length.Calculated, string>;
function parse(input: string, calc: false): Result<Length.Fixed, string>;
function parse(
  input: string,
  calc: boolean = true
): Result<Length.Mixed, string> {
  return Length.parse(Lexer.lex(input)).map(([, length]) => {
    if (
      (length.hasCalculation() && calc) ||
      (!length.hasCalculation() && !calc)
    ) {
      return length;
    }
    throw new Error("Incorrect calculation hint");
  });
}

test("parse() accepts length", (t) => {
  t.deepEqual(parse("2em", false).getUnsafe().toJSON(), {
    type: "length",
    value: 2,
    unit: "em",
  });
});

test("parse() accepts math expression reducing to lengths", (t) => {
  t.deepEqual(parse("calc(2px + 1vh)").getUnsafe().toJSON(), {
    type: "length",
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
    }
  );
});
