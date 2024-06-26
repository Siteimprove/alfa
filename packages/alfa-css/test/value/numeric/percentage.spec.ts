import { test } from "@siteimprove/alfa-test";

import { Length, Number, Percentage } from "../../../dist/index.js";

import { parser, parserUnsafe, serializer } from "../../common/parse.js";

const parseErr = parser(Percentage.parse);
const parse = parserUnsafe(Percentage.parse);
const serialize = serializer(Percentage.parse);

test("parse() accepts percentages", (t) => {
  t.deepEqual(serialize("42%"), { type: "percentage", value: 0.42 });
});

test("parse() accepts math expressions reducing to percentages", (t) => {
  t.deepEqual(serialize("calc((12% + 9%) * 2)"), {
    type: "percentage",
    math: {
      type: "math expression",
      expression: { type: "value", value: { type: "percentage", value: 0.42 } },
    },
  });
});

test("parse() rejects math expressions with length", (t) => {
  t.deepEqual(parseErr("calc(10px + 5%)").isErr(), true);
});

test("parse() rejects math expressions with angles", (t) => {
  t.deepEqual(parseErr("calc(10deg + 1rad)").isErr(), true);
});

test("parse() rejects math expressions with only numbers", (t) => {
  t.deepEqual(parseErr("calc(10 + 1)").isErr(), true);
});

test("partiallyResolve() returns a bare percentage", (t) => {
  t.deepEqual(parse("calc((12% + 9%) * 2)").partiallyResolve().toJSON(), {
    type: "percentage",
    value: 0.42,
  });
});

test("resolve() resolves dimension divisions", (t) => {
  t.deepEqual(
    parse("calc(100% * (180deg / 1turn) * (8px / 1em)")
      .resolve({
        percentageBase: Number.of(100),
        length: (value) => {
          switch (value.unit) {
            case "em":
              return Length.of(16, "px");
            default:
              return Length.of(1, "px");
          }
        },
      })
      .toJSON(),
    // Due to rounding Numeric to 7 decimals, we have floating point problems.
    { type: "number", value: 25.0002 },
  );

  t.deepEqual(
    parse("calc(100% * (180deg / 1turn) * (8px / 1em)")
      .resolve({
        length: (value) => {
          switch (value.unit) {
            case "em":
              return Length.of(16, "px");
            default:
              return Length.of(1, "px");
          }
        },
      })
      .toJSON(),
    // Due to rounding Numeric to 7 decimals, we have floating point problems.
    { type: "percentage", value: 0.250002 },
  );
});

test("partiallyResolve() resolves dimension divisions", (t) => {
  t.deepEqual(
    parse("calc(100% * (180deg / 1turn) * (8px / 1em)")
      .partiallyResolve({
        length: (value) => {
          switch (value.unit) {
            case "em":
              return Length.of(16, "px");
            default:
              return Length.of(1, "px");
          }
        },
      })
      .toJSON(),
    // Due to rounding Numeric to 7 decimals, we have floating point problems.
    { type: "percentage", value: 0.250002 },
  );
});
