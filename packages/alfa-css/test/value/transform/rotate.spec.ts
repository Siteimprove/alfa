import { test } from "@siteimprove/alfa-test";

import { Rotate } from "../../../src";

import { parser, serializer } from "../../common/parse";

const serialize = serializer(Rotate.parse);
const parseErr = parser(Rotate.parse);

const _0 = { type: "number", value: 0 };
const _1 = { type: "number", value: 1 };

test("parse() parses a rotate function", (t) => {
  const actual = serialize("rotate(42rad)");

  t.deepEqual(actual, {
    type: "transform",
    kind: "rotate",
    x: _0,
    y: _0,
    z: _1,
    angle: { type: "angle", unit: "rad", value: 42 },
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
    angle: { type: "angle", unit: "rad", value: 42 },
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
    angle: { type: "angle", unit: "rad", value: 42 },
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
    angle: { type: "angle", unit: "rad", value: 42 },
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
    angle: { type: "angle", unit: "rad", value: 42 },
  });
});
