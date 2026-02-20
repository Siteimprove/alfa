import { test } from "@siteimprove/alfa-test";

import { Math } from "../../../dist/index.js";
import { parser, parserUnsafe, serializer } from "../../common/parse.js";

import { resolver } from "../common.js";

const parseErr = parser(Math.parse);
const parse = parserUnsafe(Math.parse);
const serialize = serializer(Math.parse);

test(".parse() parses a min of one or more numbers or calculations", (t) => {
  for (const [list, value] of [
    ["1", 1],
    ["1,2", 1],
    ["3, 7,8  , 10  ,5, 1", 1],
    ["1 + 2, 5, 2 * 3", 3],
    ["2, min(1, 4)", 1],
  ]) {
    const calculation = parse(`min(${list})`);

    t(calculation.isNumber());

    t.deepEqual(calculation.toJSON(), {
      type: "math expression",
      expression: {
        type: "value",
        value: { type: "number", value: value },
      },
    });
  }

  const error = parseErr("min()");

  t.deepEqual(error.isErr(), true);
});

test(".parse() parses a min of absolute dimensions", (t) => {
  for (const [list, value, type] of [
    ["1px", 1, "length"],
    ["2px, 1cm", 2, "length"],
    ["2rad, 90deg", 90, "angle"],
  ] as const) {
    const actual = serialize(`min(${list})`);

    t.deepEqual(actual, {
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
  const calculation = parse("min(1em, 20px, 2*4px, 1vh + 20%)");

  t.deepEqual(calculation.toJSON(), {
    type: "math expression",
    expression: {
      type: "min",
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

  const reduced = calculation.reduce(resolver);

  t.deepEqual(reduced.toJSON(), {
    type: "math expression",
    expression: {
      type: "value",
      value: { value: 8, type: "length", unit: "px" },
    },
  });
});

test(".parse() does not resolve percentages", (t) => {
  const actual = serialize("min(5%, 10%)");

  t.deepEqual(actual, {
    type: "math expression",
    expression: {
      type: "min",
      arguments: [
        { type: "value", value: { value: 0.05, type: "percentage" } },
        { type: "value", value: { value: 0.1, type: "percentage" } },
      ],
    },
  });
});

test("parse() accept mixed min if they can combine", (t) => {
  for (const list of ["2px, 10%", "10%, 2px"]) {
    const calculation = parse(`min(${list})`).reduce(resolver);

    t.deepEqual(calculation.toJSON(), {
      type: "math expression",
      expression: {
        type: "value",
        value: { value: 1.6, type: "length", unit: "px" },
      },
    });
  }
});
