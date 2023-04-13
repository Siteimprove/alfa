import { test } from "@siteimprove/alfa-test";

import { Lexer } from "../../src/syntax/lexer";
import { Math } from "../../src/value/math-expression";
import { Length } from "../../src/value/numeric/length";

function parse(input: string) {
  return Math.parse(Lexer.lex(input)).map(([, expr]) => expr);
}

test(".parse() parses a max of one or more numbers or calculation", (t) => {
  for (const [list, value] of [
    ["1", 1],
    ["1,2", 2],
    ["3, 7,8  , 10  ,5, 1", 10],
    ["1 + 2, 5, 2 * 3", 6],
    ["2, max(1, 4)", 4],
  ]) {
    const calculation = parse(`max(${list})`).getUnsafe();

    t(calculation.isNumber());

    t.deepEqual(calculation.toJSON(), {
      type: "math expression",
      expression: {
        type: "value",
        value: { type: "number", value: value },
      },
    });
  }

  const error = parse("max()");

  t.deepEqual(error.isErr(), true);
});

test(".parse() parses a max of absolute dimensions", (t) => {
  for (const [list, value, type] of [
    ["1px", 1, "length"],
    ["2px, 1cm", 37.7952756, "length"],
    ["1rad, 90deg", 90, "angle"],
  ] as const) {
    const calculation = parse(`max(${list})`).getUnsafe();

    t.deepEqual(calculation.toJSON(), {
      type: "math expression",
      expression: {
        type: "value",
        value: {
          type: type,
          value: value,
          unit: type === "length" ? "px" : "deg",
        },
      },
    });
  }
});

test(".parse() does not reduce relative dimensions", (t) => {
  const calculation = parse("max(1em, 20px, 2*4px, 1vh + 20%)").getUnsafe();

  t.deepEqual(calculation.toJSON(), {
    type: "math expression",
    expression: {
      type: "max",
      arguments: [
        {
          type: "value",
          value: { value: 1, type: "length", unit: "em" },
        },
        {
          type: "value",
          value: { value: 20, type: "length", unit: "px" },
        },
        {
          type: "value",
          value: { value: 8, type: "length", unit: "px" },
        },
        {
          type: "sum",
          operands: [
            {
              type: "value",
              value: { value: 1, type: "length", unit: "vh" },
            },
            { type: "value", value: { value: 0.2, type: "percentage" } },
          ],
        },
      ],
    },
  });

  const reduced = calculation.reduce({
    length: (length) => {
      switch (length.unit) {
        case "em":
          return Length.of(length.value * 16, "px");
        case "vh":
          return Length.of(length.value * 1024, "px");
        default:
          return Length.of(0, "px");
      }
    },
    percentage: (percent) => Length.of(percent.value * 16, "px"),
  });

  t.deepEqual(reduced.toJSON(), {
    type: "math expression",
    expression: {
      type: "value",
      value: { value: 1027.2, type: "length", unit: "px" },
    },
  });
});

test(".parse() does not resolve percentages", (t) => {
  const calculation = parse("max(5%, 10%)").getUnsafe();

  t.deepEqual(calculation.toJSON(), {
    type: "math expression",
    expression: {
      type: "max",
      arguments: [
        { type: "value", value: { value: 0.05, type: "percentage" } },
        { type: "value", value: { value: 0.1, type: "percentage" } },
      ],
    },
  });
});

test("parse() accept mixed max if they can combine", (t) => {
  for (const list of ["1px, 10%", "10%, 1px"]) {
    const calculation = parse(`max(${list})`)
      .getUnsafe()
      .reduce({
        length: () => Length.of(0, "px"),
        percentage: (percent) => Length.of(percent.value * 16, "px"),
      });

    t.deepEqual(calculation.toJSON(), {
      type: "math expression",
      expression: {
        type: "value",
        value: { value: 1.6, type: "length", unit: "px" },
      },
    });
  }
});
