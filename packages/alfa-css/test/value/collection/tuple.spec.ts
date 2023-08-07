import { test } from "@siteimprove/alfa-test";

import { Length, LengthPercentage, Tuple } from "../../../src";

import { parserUnsafe } from "../../common/parse";

const parse = parserUnsafe(LengthPercentage.parse);

const absolute = parse("1px");
const relative = parse("2em");
const percent = parse("20%");
const calculated = parse("calc(1px + 2em)");

test(".of() considers the tuple as not calculated when no value is", (t) => {
  const actual = Tuple.of(absolute, relative);

  t.deepEqual(actual.hasCalculation(), false);
});

test(".of() considers the list as calculated when one value is", (t) => {
  const actual = Tuple.of(absolute, calculated, percent);

  t.deepEqual(actual.hasCalculation(), true);
});

test("resolve() resolves all values in a list", (t) => {
  const actual = Tuple.of(relative, calculated, percent);
  const resolver = {
    length: Length.resolver(
      Length.of(16, "px"),
      Length.of(16, "px"),
      Length.of(16, "px"),
      Length.of(16, "px")
    ),
    percentageBase: Length.of(20, "px"),
  };

  const resolved = actual.resolve(resolver);

  t.deepEqual(resolved.hasCalculation(), false);

  t.deepEqual(resolved.toJSON(), {
    type: "tuple",
    values: [
      { type: "length", value: 32, unit: "px" },
      { type: "length", value: 33, unit: "px" },
      { type: "length", value: 4, unit: "px" },
    ],
  });
});
