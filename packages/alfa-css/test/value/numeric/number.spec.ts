import { test } from "@siteimprove/alfa-test";

import { Number } from "../../../src";

import { parser, serializer } from "../../common/parse";

const parse = parser(Number.parse);
const serialize = serializer(Number.parse);

test("parse() accepts numbers", (t) => {
  t.deepEqual(serialize("3.14"), { type: "number", value: 3.14 });
});

test("parse() accepts math expressions reducing to numbers", (t) => {
  t.deepEqual(serialize("calc((12 + 9) * 2)"), {
    type: "number",
    math: {
      type: "math expression",
      expression: { type: "value", value: { type: "number", value: 42 } },
    },
  });
});

test("parse() rejects math expressions with percentages", (t) => {
  t.deepEqual(parse("calc(10px + 5%)").isErr(), true);
});

test("parse() rejects math expressions with angles", (t) => {
  t.deepEqual(parse("calc(10deg + 1rad)").isErr(), true);
});

test("parse() rejects math expressions with length", (t) => {
  t.deepEqual(parse("calc(10em + 1px)").isErr(), true);
});

test("resolve() returns a bare value", (t) => {
  t.deepEqual(parse("calc((12 + 9) * 2)").getUnsafe().resolve().toJSON(), {
    type: "number",
    value: 42,
  });
});
