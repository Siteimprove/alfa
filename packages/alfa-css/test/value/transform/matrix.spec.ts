import { test } from "@siteimprove/alfa-test";

import { Matrix } from "../../../src";

import { parser, serializer } from "../../common/parse";

const serialize = serializer(Matrix.parse);
const parseErr = parser(Matrix.parse);

const _0 = { type: "number", value: 0 };
const _1 = { type: "number", value: 1 };
const _2 = { type: "number", value: 2 };
const _a = { type: "number", value: 1 };
const _b = { type: "number", value: 2 };
const _c = { type: "number", value: 3 };
const _d = { type: "number", value: 4 };
const _e = { type: "number", value: 5 };
const _f = { type: "number", value: 6 };
const _g = { type: "number", value: 7 };
const _h = { type: "number", value: 8 };
const _i = { type: "number", value: 9 };
const _j = { type: "number", value: 10 };
const _k = { type: "number", value: 11 };
const _l = { type: "number", value: 12 };
const _m = { type: "number", value: 13 };
const _n = { type: "number", value: 14 };
const _o = { type: "number", value: 15 };
const _p = { type: "number", value: 16 };

test("parse() parses a 2D matrix", (t) => {
  const actual = serialize("matrix(1, 2, 3, 4, 5, 6)");

  t.deepEqual(actual, {
    type: "transform",
    kind: "matrix",
    values: [
      [_a, _c, _0, _e],
      [_b, _d, _0, _f],
      [_0, _0, _1, _0],
      [_0, _0, _0, _1],
    ],
  });
});

test("parse() parses a 3D matrix", (t) => {
  const actual = serialize(
    "matrix3d(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16)"
  );

  t.deepEqual(actual, {
    type: "transform",
    kind: "matrix",
    values: [
      [_a, _e, _i, _m],
      [_b, _f, _j, _n],
      [_c, _g, _k, _o],
      [_d, _h, _l, _p],
    ],
  });
});

test("parse() requires 6 values for a 2D matrix", (t) => {
  for (const input of [
    "matrix(1, 2, 3, 4, 5)",
    "matrix(1, 2, 3, 4, 5, 6, 7)",
  ]) {
    const actual = parseErr(input);

    t(actual.isErr());
  }
});

test("parse() requires 16 values for a 3D matrix", (t) => {
  for (const input of [
    "matrix3d(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15)",
    "matrix3d(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17)",
  ]) {
    const actual = parseErr(input);

    t(actual.isErr());
  }
});

const x = "calc(1 + 1)";
const values = (n: number) => [...Array(n)].map(() => x).join(", ");

test("parse() accepts calculations and resolve them for a 2D matrix", (t) => {
  const actual = serialize(`matrix(${values(6)})`);

  t.deepEqual(actual, {
    type: "transform",
    kind: "matrix",
    values: [
      [_2, _2, _0, _2],
      [_2, _2, _0, _2],
      [_0, _0, _1, _0],
      [_0, _0, _0, _1],
    ],
  });
});

test("parse() accepts calculations and resolve them for a 3D matrix", (t) => {
  const actual = serialize(`matrix3d(${values(16)})`);

  t.deepEqual(actual, {
    type: "transform",
    kind: "matrix",
    values: [
      [_2, _2, _2, _2],
      [_2, _2, _2, _2],
      [_2, _2, _2, _2],
      [_2, _2, _2, _2],
    ],
  });
});
