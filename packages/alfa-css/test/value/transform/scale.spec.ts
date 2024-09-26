import { test } from "@siteimprove/alfa-test";

import { Scale } from "../../../dist/index.js";

import { parser, serializer } from "../../common/parse.js";

const serialize = serializer(Scale.parseFunc);
const parseErr = parser(Scale.parseFunc);

const _1 = { type: "number", value: 1 } as const;
const _2 = { type: "number", value: 2 } as const;

test("parse() parses scale function with two arguments", (t) => {
  const actual = serialize("scale(1, 2)");

  t.deepEqual(actual, {
    type: "transform",
    kind: "scale",
    x: _1,
    y: _2,
    z: null,
  });
});

test("parse() parses scale function with one argument", (t) => {
  const actual = serialize("scale(2)");

  t.deepEqual(actual, {
    type: "transform",
    kind: "scale",
    x: _2,
    y: _2,
    z: null,
  });
});

test("parses expect exactly one or two arguments for scale", (t) => {
  for (const input of ["scale()", "scale(1, 2, 3)"]) {
    const actual = parseErr(input);

    t(actual.isErr());
  }
});

test("parse() parses scaleX function", (t) => {
  const actual = serialize("scaleX(2)");

  t.deepEqual(actual, {
    type: "transform",
    kind: "scale",
    x: _2,
    y: _1,
    z: null,
  });
});

test("parses expect exactly one argument for scaleX", (t) => {
  for (const input of ["scaleX()", "scaleX(1, 2)"]) {
    const actual = parseErr(input);

    t(actual.isErr());
  }
});

test("parse() parses scaleY function", (t) => {
  const actual = serialize("scaleY(2)");

  t.deepEqual(actual, {
    type: "transform",
    kind: "scale",
    x: _1,
    y: _2,
    z: null,
  });
});

test("parses expect exactly one argument for scaleY", (t) => {
  for (const input of ["scaleY()", "scaleY(1, 2)"]) {
    const actual = parseErr(input);

    t(actual.isErr());
  }
});

test("parse() accepts calculations in a scale function", (t) => {
  const actual = serialize("scale(calc(10 - 9), calc(1 + 1))");

  t.deepEqual(actual, {
    type: "transform",
    kind: "scale",
    x: _1,
    y: _2,
    z: null,
  });
});

test("parse() parses scaleX function", (t) => {
  const actual = serialize("scaleX(calc(1 + 1))");

  t.deepEqual(actual, {
    type: "transform",
    kind: "scale",
    x: _2,
    y: _1,
    z: null,
  });
});

test("parse() parses scaleY function", (t) => {
  const actual = serialize("scaleY(calc(1 + 1))");

  t.deepEqual(actual, {
    type: "transform",
    kind: "scale",
    x: _1,
    y: _2,
    z: null,
  });
});

test("parse() accepts percentages scale", (t) => {
  const actual = serialize("scale(150%, 50%)");

  t.deepEqual(actual, {
    type: "transform",
    kind: "scale",
    x: { type: "percentage", value: 1.5 },
    y: { type: "percentage", value: 0.5 },
    z: null,
  });
});

test("parse() accepts a mix of numbers and percentages in scale", (t) => {
  const actual = serialize("scale(1.5, 50%)");

  t.deepEqual(actual, {
    type: "transform",
    kind: "scale",
    x: { type: "number", value: 1.5 },
    y: { type: "percentage", value: 0.5 },
    z: null,
  });
});

test("parse() parses scale3d function with three arguments", (t) => {
  const actual = serialize("scale3d(0.5, 1, 1.7)");

  t.deepEqual(actual, {
    type: "transform",
    kind: "scale",
    x: {
      type: "number",
      value: 0.5,
    },
    y: {
      type: "number",
      value: 1,
    },
    z: {
      type: "number",
      value: 1.7,
    },
  });
});

test("parse() expects exactly three arguments for scale3d", (t) => {
  for (const input of ["scale3d()", "scale3d(2)", "scale3d(1, 2)"]) {
    const actual = parseErr(input);

    t(actual.isErr());
  }
});

test("parse() parses scaleZ function", (t) => {
  const actual = serialize("scaleZ(2)");

  t.deepEqual(actual, {
    type: "transform",
    kind: "scale",
    x: _1,
    y: _1,
    z: {
      type: "number",
      value: 2,
    },
  });
});

test("parses expect exactly one argument for scaleZ", (t) => {
  for (const input of ["scaleZ()", "scaleZ(1, 2)"]) {
    const actual = parseErr(input);

    t(actual.isErr());
  }
});

test("parse() accepts calculations in a scale3d function", (t) => {
  const actual = serialize("scale3d(calc(10 - 9), calc(1 + 1), calc(10 / 5))");

  t.deepEqual(actual, {
    type: "transform",
    kind: "scale",
    x: _1,
    y: _2,
    z: _2,
  });
});

test("parse() accepts calculations in scaleZ function", (t) => {
  const actual = serialize("scaleZ(calc(1 + 1))");

  t.deepEqual(actual, {
    type: "transform",
    kind: "scale",
    x: _1,
    y: _1,
    z: _2,
  });
});

test("parse() accepts percentages in scale3d", (t) => {
  const actual = serialize("scale3d(150%, 50%, 200%)");

  t.deepEqual(actual, {
    type: "transform",
    kind: "scale",
    x: { type: "percentage", value: 1.5 },
    y: { type: "percentage", value: 0.5 },
    z: { type: "percentage", value: 2 },
  });
});

test("parse() accepts a mix of numbers and percentages in scale3d", (t) => {
  const actual = serialize("scale3d(1.5, 50%, 1.7)");

  t.deepEqual(actual, {
    type: "transform",
    kind: "scale",
    x: { type: "number", value: 1.5 },
    y: { type: "percentage", value: 0.5 },
    z: { type: "number", value: 1.7 },
  });
});
