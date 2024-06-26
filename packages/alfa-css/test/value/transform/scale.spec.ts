import { test } from "@siteimprove/alfa-test";

import { Scale } from "../../../dist/index.js";

import { parser, serializer } from "../../common/parse.js";

const serialize = serializer(Scale.parse);
const parseErr = parser(Scale.parse);

const _1 = { type: "number", value: 1 };
const _2 = { type: "number", value: 2 };

test("parse() parses scale function with two arguments", (t) => {
  const actual = serialize("scale(1, 2)");

  t.deepEqual(actual, { type: "transform", kind: "scale", x: _1, y: _2 });
});

test("parse() parses scale function with one argument", (t) => {
  const actual = serialize("scale(2)");

  t.deepEqual(actual, { type: "transform", kind: "scale", x: _2, y: _2 });
});

test("parses expect exactly one or two arguments for scale", (t) => {
  for (const input of ["scale()", "scale(1, 2, 3)"]) {
    const actual = parseErr(input);

    t(actual.isErr());
  }
});

test("parse() parses scaleX function", (t) => {
  const actual = serialize("scaleX(2)");

  t.deepEqual(actual, { type: "transform", kind: "scale", x: _2, y: _1 });
});

test("parses expect exactly one argument for scaleX", (t) => {
  for (const input of ["scaleX()", "scaleX(1, 2)"]) {
    const actual = parseErr(input);

    t(actual.isErr());
  }
});

test("parse() parses scaleY function", (t) => {
  const actual = serialize("scaleY(2)");

  t.deepEqual(actual, { type: "transform", kind: "scale", x: _1, y: _2 });
});

test("parses expect exactly one argument for scaleY", (t) => {
  for (const input of ["scaleY()", "scaleY(1, 2)"]) {
    const actual = parseErr(input);

    t(actual.isErr());
  }
});

test("parse() accepts calculations in a scale function", (t) => {
  const actual = serialize("scale(calc(10 - 9), calc(1 + 1))");

  t.deepEqual(actual, { type: "transform", kind: "scale", x: _1, y: _2 });
});

test("parse() parses scaleX function", (t) => {
  const actual = serialize("scaleX(calc(1 + 1))");

  t.deepEqual(actual, { type: "transform", kind: "scale", x: _2, y: _1 });
});

test("parse() parses scaleY function", (t) => {
  const actual = serialize("scaleY(calc(1 + 1))");

  t.deepEqual(actual, { type: "transform", kind: "scale", x: _1, y: _2 });
});
