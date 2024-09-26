import { test } from "@siteimprove/alfa-test";

import { Scale } from "../../../dist/index.js";

import { parser, serializer } from "../../common/parse.js";

const serializeFunc = serializer(Scale.parseFunc);
const parseErrFunc = parser(Scale.parseFunc);
const serializeProp = serializer(Scale.parseProp);

const _1 = { type: "number", value: 1 } as const;
const _2 = { type: "number", value: 2 } as const;

test("parseFunc() parses scale function with two arguments", (t) => {
  const actual = serializeFunc("scale(1, 2)");

  t.deepEqual(actual, {
    type: "transform",
    kind: "scale",
    x: _1,
    y: _2,
    z: null,
  });
});

test("parseFunc() parses scale function with one argument", (t) => {
  const actual = serializeFunc("scale(2)");

  t.deepEqual(actual, {
    type: "transform",
    kind: "scale",
    x: _2,
    y: _2,
    z: null,
  });
});

test("parseFunc() expects exactly one or two arguments for scale", (t) => {
  for (const input of ["scale()", "scale(1, 2, 3)"]) {
    const actual = parseErrFunc(input);

    t(actual.isErr());
  }
});

test("parseFunc() parses scaleX function", (t) => {
  const actual = serializeFunc("scaleX(2)");

  t.deepEqual(actual, {
    type: "transform",
    kind: "scale",
    x: _2,
    y: _1,
    z: null,
  });
});

test("parseFunc() expects exactly one argument for scaleX", (t) => {
  for (const input of ["scaleX()", "scaleX(1, 2)"]) {
    const actual = parseErrFunc(input);

    t(actual.isErr());
  }
});

test("parseFunc() parses scaleY function", (t) => {
  const actual = serializeFunc("scaleY(2)");

  t.deepEqual(actual, {
    type: "transform",
    kind: "scale",
    x: _1,
    y: _2,
    z: null,
  });
});

test("parseFunc() expects exactly one argument for scaleY", (t) => {
  for (const input of ["scaleY()", "scaleY(1, 2)"]) {
    const actual = parseErrFunc(input);

    t(actual.isErr());
  }
});

test("parseFunc() accepts calculations in a scale function", (t) => {
  const actual = serializeFunc("scale(calc(10 - 9), calc(1 + 1))");

  t.deepEqual(actual, {
    type: "transform",
    kind: "scale",
    x: _1,
    y: _2,
    z: null,
  });
});

test("parseFunc() parses scaleX function", (t) => {
  const actual = serializeFunc("scaleX(calc(1 + 1))");

  t.deepEqual(actual, {
    type: "transform",
    kind: "scale",
    x: _2,
    y: _1,
    z: null,
  });
});

test("parseFunc() parses scaleY function", (t) => {
  const actual = serializeFunc("scaleY(calc(1 + 1))");

  t.deepEqual(actual, {
    type: "transform",
    kind: "scale",
    x: _1,
    y: _2,
    z: null,
  });
});

test("parseFunc() accepts percentages scale", (t) => {
  const actual = serializeFunc("scale(150%, 50%)");

  t.deepEqual(actual, {
    type: "transform",
    kind: "scale",
    x: { type: "percentage", value: 1.5 },
    y: { type: "percentage", value: 0.5 },
    z: null,
  });
});

test("parseFunc() accepts a mix of numbers and percentages in scale", (t) => {
  const actual = serializeFunc("scale(1.5, 50%)");

  t.deepEqual(actual, {
    type: "transform",
    kind: "scale",
    x: { type: "number", value: 1.5 },
    y: { type: "percentage", value: 0.5 },
    z: null,
  });
});

test("parseFunc() parses scale3d function with three arguments", (t) => {
  const actual = serializeFunc("scale3d(0.5, 1, 1.7)");

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

test("parseFunc() expects exactly three arguments for scale3d", (t) => {
  for (const input of ["scale3d()", "scale3d(2)", "scale3d(1, 2)"]) {
    const actual = parseErrFunc(input);

    t(actual.isErr());
  }
});

test("parseFunc() parses scaleZ function", (t) => {
  const actual = serializeFunc("scaleZ(2)");

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
    const actual = parseErrFunc(input);

    t(actual.isErr());
  }
});

test("parseFunc() accepts calculations in a scale3d function", (t) => {
  const actual = serializeFunc(
    "scale3d(calc(10 - 9), calc(1 + 1), calc(10 / 5))",
  );

  t.deepEqual(actual, {
    type: "transform",
    kind: "scale",
    x: _1,
    y: _2,
    z: _2,
  });
});

test("parseFunc() accepts calculations in scaleZ function", (t) => {
  const actual = serializeFunc("scaleZ(calc(1 + 1))");

  t.deepEqual(actual, {
    type: "transform",
    kind: "scale",
    x: _1,
    y: _1,
    z: _2,
  });
});

test("parseFunc() accepts percentages in scale3d", (t) => {
  const actual = serializeFunc("scale3d(150%, 50%, 200%)");

  t.deepEqual(actual, {
    type: "transform",
    kind: "scale",
    x: { type: "percentage", value: 1.5 },
    y: { type: "percentage", value: 0.5 },
    z: { type: "percentage", value: 2 },
  });
});

test("parseFunc() accepts a mix of numbers and percentages in scale3d", (t) => {
  const actual = serializeFunc("scale3d(1.5, 50%, 1.7)");

  t.deepEqual(actual, {
    type: "transform",
    kind: "scale",
    x: { type: "number", value: 1.5 },
    y: { type: "percentage", value: 0.5 },
    z: { type: "number", value: 1.7 },
  });
});

test("parseProp() parses two values", (t) => {
  const actual = serializeProp("1 2");

  t.deepEqual(actual, {
    type: "transform",
    kind: "scale",
    x: _1,
    y: _2,
    z: null,
  });
});

test("parseProp() parses one value", (t) => {
  const actual = serializeProp("2");

  t.deepEqual(actual, {
    type: "transform",
    kind: "scale",
    x: _2,
    y: _2,
    z: null,
  });
});

test("parseProp() parses three values", (t) => {
  const actual = serializeProp("0.5 1 1.7");

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

test("parseProp() accepts percentages", (t) => {
  const actual = serializeProp("150% 50% 200%");

  t.deepEqual(actual, {
    type: "transform",
    kind: "scale",
    x: { type: "percentage", value: 1.5 },
    y: { type: "percentage", value: 0.5 },
    z: { type: "percentage", value: 2 },
  });
});

test("parseProp() accepts a mix of numbers and percentages", (t) => {
  const actual = serializeProp("1.5 50% 1.7");

  t.deepEqual(actual, {
    type: "transform",
    kind: "scale",
    x: { type: "number", value: 1.5 },
    y: { type: "percentage", value: 0.5 },
    z: { type: "number", value: 1.7 },
  });
});
