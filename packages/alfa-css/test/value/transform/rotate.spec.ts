import { test } from "@siteimprove/alfa-test";

import { Rotate } from "../../../dist/index.js";

import { parser, serializer } from "../../common/parse.js";

const serialize = serializer(Rotate.parse);
const parseErr = parser(Rotate.parse);

const _0 = { type: "number", value: 0 };
const _1 = { type: "number", value: 1 };
const _42 = { type: "angle", unit: "deg", value: 2406.4227395 };
const _363 = { type: "angle", unit: "deg", value: 363 };

test("parse() parses a rotate function", (t) => {
  const actual = serialize("rotate(42rad)");

  t.deepEqual(actual, {
    type: "transform",
    kind: "rotate",
    x: _0,
    y: _0,
    z: _1,
    angle: _42,
  });
});

test("parse() parses a rotateX function", (t) => {
  const actual = serialize("rotateX(42rad)");

  t.deepEqual(actual, {
    type: "transform",
    kind: "rotate",
    x: _1,
    y: _0,
    z: _0,
    angle: _42,
  });
});

test("parse() parses a rotateY function", (t) => {
  const actual = serialize("rotateY(42rad)");

  t.deepEqual(actual, {
    type: "transform",
    kind: "rotate",
    x: _0,
    y: _1,
    z: _0,
    angle: _42,
  });
});

test("parse() parses a rotateZ function", (t) => {
  const actual = serialize("rotateZ(42rad)");

  t.deepEqual(actual, {
    type: "transform",
    kind: "rotate",
    x: _0,
    y: _0,
    z: _1,
    angle: _42,
  });
});

test("parse() parses a rotate3d function", (t) => {
  const actual = serialize("rotate3d(1, 1, 1, 42rad)");

  t.deepEqual(actual, {
    type: "transform",
    kind: "rotate",
    x: _1,
    y: _1,
    z: _1,
    angle: _42,
  });
});

test("parse() requires three axis for a rotate3d function", (t) => {
  for (const input of [
    "rotate3d(1, 1, 42rad)",
    "rotate3d(1, 1, 1, 1, 42rad)",
  ]) {
    const actual = parseErr(input);

    t(actual.isErr());
  }
});

test("parse() accepts calculation in a rotate function and resolves it", (t) => {
  const actual = serialize("rotate(calc(3deg + 1turn))");

  t.deepEqual(actual, {
    type: "transform",
    kind: "rotate",
    x: _0,
    y: _0,
    z: _1,
    angle: _363,
  });
});

test("parse() accepts calculation in a rotateX function and resolves it", (t) => {
  const actual = serialize("rotateX(calc(3deg + 1turn))");

  t.deepEqual(actual, {
    type: "transform",
    kind: "rotate",
    x: _1,
    y: _0,
    z: _0,
    angle: _363,
  });
});

test("parse() accepts calculation in a rotateY function and resolves it", (t) => {
  const actual = serialize("rotateY(calc(3deg + 1turn))");

  t.deepEqual(actual, {
    type: "transform",
    kind: "rotate",
    x: _0,
    y: _1,
    z: _0,
    angle: _363,
  });
});

test("parse() accepts calculation in a rotateZ function and resolves it", (t) => {
  const actual = serialize("rotateZ(calc(3deg + 1turn))");

  t.deepEqual(actual, {
    type: "transform",
    kind: "rotate",
    x: _0,
    y: _0,
    z: _1,
    angle: _363,
  });
});

test("parse() accepts calculations in a rotate3d function and resolves them", (t) => {
  const actual = serialize(
    "rotate3d(calc(2 - 1), calc(2 - 1), calc(2 - 1), calc(3deg + 1turn))",
  );

  t.deepEqual(actual, {
    type: "transform",
    kind: "rotate",
    x: _1,
    y: _1,
    z: _1,
    angle: _363,
  });
});
