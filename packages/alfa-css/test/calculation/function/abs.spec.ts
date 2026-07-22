import { test } from "@siteimprove/alfa-test";

import { Length } from "../../../src/calculation/numeric/index.ts";
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
        value: { type: "number", value },
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
          type,
          value,
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

test(".reduce() keeps the wrapper around an unreducible calculation", (t) => {
  // The argument mixes a relative and an absolute length, so it reduces to a
  // sum rather than a single value; `abs()` cannot be applied yet, and the
  // wrapper is kept around the whole (still unreduced) calculation.
  const calculation = parse("abs(1em - 30px)");

  t.deepEqual(calculation.toJSON(), {
    type: "math expression",
    expression: {
      type: "abs",
      arguments: [
        {
          type: "sum",
          operands: [
            { type: "value", value: { value: 1, type: "length", unit: "em" } },
            {
              type: "value",
              value: { value: -30, type: "length", unit: "px" },
            },
          ],
        },
      ],
    },
  });

  // Once the relative length is resolved the calculation folds and `abs()`
  // applies: 1em -> 16px, 16px - 30px = -14px, abs(-14px) = 14px.
  const reduced = calculation.reduce(resolver);

  t.deepEqual(reduced.toJSON(), {
    type: "math expression",
    expression: {
      type: "value",
      value: { value: 14, type: "length", unit: "px" },
    },
  });
});

test(".reduce() re-derives the kept wrapper's kind from the reduced argument", (t) => {
  // A resolver may substitute a percentage with a value of a different type —
  // here a *relative* length, which cannot be eagerly reduced, so the `abs()`
  // wrapper is kept. Rebuilding through `Abs.of` re-derives the kind from the
  // substituted argument (length) instead of freezing the original one
  // (percentage), so the containing calculation reports the correct type.
  const calculation = parse("abs(-10%)").reduce({
    ...resolver,
    percentage: (percentage) => Length.of(percentage.value * 16, "em"),
  });

  t.deepEqual(calculation.toJSON(), {
    type: "math expression",
    expression: {
      type: "abs",
      arguments: [
        { type: "value", value: { value: -1.6, type: "length", unit: "em" } },
      ],
    },
  });

  t(calculation.isDimension("length"));
  t(!calculation.isPercentage());
});
