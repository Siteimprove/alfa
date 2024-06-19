import { test } from "@siteimprove/alfa-test";

import { Angle, Length } from "../../../src";

import { parser, serializer } from "../../common/parse";

const parse = parser(Angle.parse);
const serialize = serializer(Angle.parse);

test("parse() accepts angles", (t) => {
  t.deepEqual(serialize("2deg"), {
    type: "angle",
    value: 2,
    unit: "deg",
  });
});

test("parse() accepts math expressions reducing to angles", (t) => {
  t.deepEqual(serialize("calc(2deg + 1turn)"), {
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

test("resolve() resolves dimension divisions", (t) => {
  t.deepEqual(
    parse("calc(100deg / 1em * 180deg / 1turn * 8px)")
      .getUnsafe()
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
    { type: "angle", value: 25.0002, unit: "deg" },
  );
});
