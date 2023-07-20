import { test } from "@siteimprove/alfa-test";

import { Skew } from "../../../src";

import { parser, serializer } from "../../common/parse";

const serialize = serializer(Skew.parse);
const parseErr = parser(Skew.parse);

test("parse() parses a skew function with two arguments", (t) => {
  const actual = serialize("skew(45deg, 1rad)");

  t.deepEqual(actual, {
    type: "transform",
    kind: "skew",
    x: { type: "angle", unit: "deg", value: 45 },
    y: { type: "angle", unit: "rad", value: 1 },
  });
});

test("parse() parses a skew function with one argument", (t) => {
  const actual = serialize("skew(45deg)");

  t.deepEqual(actual, {
    type: "transform",
    kind: "skew",
    x: { type: "angle", unit: "deg", value: 45 },
    y: { type: "angle", unit: "deg", value: 0 },
  });
});

test("parse expects 1 or 2 arguments for skew()", (t) => {
  for (const input of ["skew()", "skew(1deg, 1deg, 1deg)"]) {
    const actual = parseErr(input);

    t(actual.isErr());
  }
});

test("parse() parses a skewX function", (t) => {
  const actual = serialize("skewX(45deg)");

  t.deepEqual(actual, {
    type: "transform",
    kind: "skew",
    x: { type: "angle", unit: "deg", value: 45 },
    y: { type: "angle", unit: "deg", value: 0 },
  });
});

test("parse() parses a skewY function", (t) => {
  const actual = serialize("skewY(45deg)");

  t.deepEqual(actual, {
    type: "transform",
    kind: "skew",
    x: { type: "angle", unit: "deg", value: 0 },
    y: { type: "angle", unit: "deg", value: 45 },
  });
});
