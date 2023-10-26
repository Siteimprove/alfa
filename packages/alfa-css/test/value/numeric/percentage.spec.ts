import { test } from "@siteimprove/alfa-test";

import { Percentage } from "../../../src";

import { parser, parserUnsafe, serializer } from "../../common/parse";

const parse = parser(Percentage.parse);
const parseUnsafe = parserUnsafe(Percentage.parse);
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
  t.deepEqual(parse("calc(10px + 5%)").isErr(), true);
});

test("parse() rejects math expressions with angles", (t) => {
  t.deepEqual(parse("calc(10deg + 1rad)").isErr(), true);
});

test("parse() rejects math expressions with only numbers", (t) => {
  t.deepEqual(parse("calc(10 + 1)").isErr(), true);
});

test("partiallyResolve() returns a bare percentage", (t) => {
  t.deepEqual(
    Percentage.partiallyResolve(parseUnsafe("calc((12% + 9%) * 2)")).toJSON(),
    {
      type: "percentage",
      value: 0.42,
    },
  );
});
