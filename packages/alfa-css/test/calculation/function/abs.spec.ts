import { test } from "@siteimprove/alfa-test";

import { Math } from "../../../src/index.ts";
import { parser, parserUnsafe, serializer } from "../../common/parse.ts";

import { resolver } from "../common.ts";

const parseErr = parser(Math.parse);
const parse = parserUnsafe(Math.parse);
const serialize = serializer(Math.parse);

test(".parse() parses an abs of a number or calculation", (t) => {
  for (const [arg, value] of [
    ["1", 1],
    ["-1", 1],
    ["5 - 10", 5],
    ["-2 * 3", 6],
    ["abs(-4)", 4],
  ] as const) {
    const calculation = parse(`abs(${arg})`);

    t(calculation.isNumber());

    t.deepEqual(calculation.toJSON(), {
      type: "math expression",
      expression: {
        type: "value",
        value: { type: "number", value: value },
      },
    });
  }

  for (const arg of ["", "1, 2"]) {
    const error = parseErr(`abs(${arg})`);

    t.deepEqual(error.isErr(), true);
  }
});

test(".parse() keeps the type of its argument for absolute dimensions", (t) => {
  for (const [arg, value, type] of [
    ["-1px", 1, "length"],
    ["-1cm", 37.7952756, "length"],
    ["-90deg", 90, "angle"],
    ["0deg - 1rad", 57.2957795, "angle"],
  ] as const) {
    const actual = serialize(`abs(${arg})`);

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
  const calculation = parse("abs(1em)");

  t.deepEqual(calculation.toJSON(), {
    type: "math expression",
    expression: {
      type: "abs",
      arguments: [
        { type: "value", value: { value: 1, type: "length", unit: "em" } },
      ],
    },
  });

  const reduced = calculation.reduce(resolver);

  t.deepEqual(reduced.toJSON(), {
    type: "math expression",
    expression: {
      type: "value",
      value: { value: 16, type: "length", unit: "px" },
    },
  });
});

test(".parse() does not resolve percentages", (t) => {
  const actual = serialize("abs(-10%)");

  t.deepEqual(actual, {
    type: "math expression",
    expression: {
      type: "abs",
      arguments: [{ type: "value", value: { value: -0.1, type: "percentage" } }],
    },
  });
});

test(".reduce() resolves a percentage against a resolver", (t) => {
  const calculation = parse("abs(-10%)").reduce(resolver);

  t.deepEqual(calculation.toJSON(), {
    type: "math expression",
    expression: {
      type: "value",
      value: { value: 1.6, type: "length", unit: "px" },
    },
  });
});
