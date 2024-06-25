import { test } from "@siteimprove/alfa-test";

import { Length } from "../../../dist";

import { parser, serializer } from "../../common/parse";

const parse = parser(Length.parse);
const serialize = serializer(Length.parse);

test("parse() accepts lengths", (t) => {
  t.deepEqual(serialize("2em"), {
    type: "length",
    value: 2,
    unit: "em",
  });
});

test("parse() accepts math expressions reducing to lengths", (t) => {
  t.deepEqual(serialize("calc(2px + 1vh)"), {
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
      .resolve({ length: () => Length.of(16, "px") })
      .toJSON(),
    {
      type: "length",
      value: 18,
      unit: "px",
    },
  );
});

test("resolve() resolves dimension divisions", (t) => {
  t.deepEqual(
    parse("calc(100px * 180deg * 8px / 1em / 1turn)")
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
    { type: "length", value: 25.0002, unit: "px" },
  );
});
