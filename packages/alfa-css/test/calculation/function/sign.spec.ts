import { test } from "@siteimprove/alfa-test";

import { Math } from "../../../src/index.ts";
import { parser, parserUnsafe, serializer } from "../../common/parse.ts";

import { resolver } from "../common.ts";

const parseErr = parser(Math.parse);
const parse = parserUnsafe(Math.parse);
const serialize = serializer(Math.parse);

test(".parse() parses a sign of a number or calculation", (t) => {
  for (const [arg, value] of [
    ["5", 1],
    ["-5", -1],
    ["0", 0],
    ["5 - 10", -1],
    ["sign(-4) + 3", 1],
  ] as const) {
    const calculation = parse(`sign(${arg})`);

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
    const error = parseErr(`sign(${arg})`);

    t.deepEqual(error.isErr(), true);
  }
});

test(".parse() resolves to a number for absolute dimensions", (t) => {
  for (const [arg, value] of [
    ["-1px", -1],
    ["2px", 1],
    ["-90deg", -1],
    ["0deg", 0],
  ] as const) {
    const actual = serialize(`sign(${arg})`);

    t.deepEqual(actual, {
      type: "math expression",
      expression: {
        type: "value",
        value: { type: "number", value: value },
      },
    });
  }
});

test(".parse() does not reduce relative dimensions", (t) => {
  const calculation = parse("sign(-1em)");

  t.deepEqual(calculation.toJSON(), {
    type: "math expression",
    expression: {
      type: "sign",
      arguments: [
        { type: "value", value: { value: -1, type: "length", unit: "em" } },
      ],
    },
  });

  const reduced = calculation.reduce(resolver);

  t.deepEqual(reduced.toJSON(), {
    type: "math expression",
    expression: {
      type: "value",
      value: { value: -1, type: "number" },
    },
  });
});

test(".parse() does not resolve percentages", (t) => {
  const actual = serialize("sign(-10%)");

  t.deepEqual(actual, {
    type: "math expression",
    expression: {
      type: "sign",
      arguments: [{ type: "value", value: { value: -0.1, type: "percentage" } }],
    },
  });
});
