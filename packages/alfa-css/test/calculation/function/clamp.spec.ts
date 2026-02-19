import { test } from "@siteimprove/alfa-test";

import { Math } from "../../../dist/index.js";
import { parser, parserUnsafe, serializer } from "../../common/parse.js";

import { resolver } from "../common.js";

const parseErr = parser(Math.parse);
const parse = parserUnsafe(Math.parse);
const serialize = serializer(Math.parse);

test(".parse() parses a clamp with exactly three numbers or calculations", (t) => {
  for (const [list, value] of [
    ["1, 5, 19", 5],
    ["1,2, 1.5", 1.5],
    ["3, 2,8", 3],
    ["2, min(1, 4), 10", 2],
  ]) {
    const calculation = parse(`clamp(${list})`);

    t(calculation.isNumber());

    t.deepEqual(calculation.toJSON(), {
      type: "math expression",
      expression: {
        type: "value",
        value: { type: "number", value: value },
      },
    });
  }

  for (const list of ["", "1, 2", "1, 2, 3, 4", "min(1, 2), 3"]) {
    const error = parseErr(`clamp(${list})`);

    t.deepEqual(error.isErr(), true);
  }
});

test(".parse() parses a clamp of absolute dimensions", (t) => {
  for (const [list, value, type] of [
    ["1px, 2px, 3px", 2, "length"],
    ["0px, 2px, 1cm", 2, "length"],
    ["1rad, 90deg, 0.5turn", 90, "angle"],
  ] as const) {
    const actual = serialize(`clamp(${list})`);

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
  const calculation = parse("clamp(1em, 20px, 1vh + 20%)");

  t.deepEqual(calculation.toJSON(), {
    type: "math expression",
    expression: {
      type: "clamp",
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
      value: { value: 20, type: "length", unit: "px" },
    },
  });
});

test(".parse() does not resolve percentages", (t) => {
  const actual = serialize("clamp(5%, 10%, 20%)");

  t.deepEqual(actual, {
    type: "math expression",
    expression: {
      type: "clamp",
      arguments: [
        { type: "value", value: { value: 0.05, type: "percentage" } },
        { type: "value", value: { value: 0.1, type: "percentage" } },
        { type: "value", value: { value: 0.2, type: "percentage" } },
      ],
    },
  });
});

test("parse() accept mixed clamp if they can combine", (t) => {
  for (const list of ["1px, 10%, 1em", "1px, 10%, 30%"]) {
    const calculation = parse(`clamp(${list})`).reduce(resolver);

    t.deepEqual(calculation.toJSON(), {
      type: "math expression",
      expression: {
        type: "value",
        value: { value: 1.6, type: "length", unit: "px" },
      },
    });
  }
});
