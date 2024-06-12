import { test } from "@siteimprove/alfa-test";

import { Length, Translate } from "../../../dist";

import { parser, parserUnsafe, serializer } from "../../common/parse";

const serialize = serializer(Translate.parse);
const parseErr = parser(Translate.parse);

const _0 = { type: "length", unit: "px", value: 0 } as const;

test("parse() parses a translate function with two lengths", (t) => {
  const actual = serialize("translate(1px, 2em)");

  t.deepEqual(actual, {
    type: "transform",
    kind: "translate",
    x: { type: "length", unit: "px", value: 1 },
    y: { type: "length", unit: "em", value: 2 },
    z: _0,
  });
});

test("parse() parses a translate function with two percentages", (t) => {
  const actual = serialize("translate(10%, 20%)");

  t.deepEqual(actual, {
    type: "transform",
    kind: "translate",
    x: { type: "percentage", value: 0.1 },
    y: { type: "percentage", value: 0.2 },
    z: _0,
  });
});

test("parse() parses a translate function with one length", (t) => {
  const actual = serialize("translate(1px)");

  t.deepEqual(actual, {
    type: "transform",
    kind: "translate",
    x: { type: "length", unit: "px", value: 1 },
    y: _0,
    z: _0,
  });
});

test("parse() parses a translate function with one percentage", (t) => {
  const actual = serialize("translate(10%)");

  t.deepEqual(actual, {
    type: "transform",
    kind: "translate",
    x: { type: "percentage", value: 0.1 },
    y: _0,
    z: _0,
  });
});

test("parse() accept mixed length and percentages in translate()", (t) => {
  for (const input of ["translate(1px, 2%)", "translate(2%, 1px)"]) {
    const actual = parseErr(input);

    t(actual.isOk());
  }
});

test("parse() requires 1 or two arguments for a translate function", (t) => {
  for (const input of ["translate()", "translate(1px, 1px, 1px)"]) {
    const actual = parseErr(input);

    t(actual.isErr());
  }
});

test("parse() parses a translateX function with length", (t) => {
  const actual = serialize("translateX(1px)");

  t.deepEqual(actual, {
    type: "transform",
    kind: "translate",
    x: { type: "length", unit: "px", value: 1 },
    y: _0,
    z: _0,
  });
});

test("parse() parses a translateX function with percentage", (t) => {
  const actual = serialize("translateX(10%)");

  t.deepEqual(actual, {
    type: "transform",
    kind: "translate",
    x: { type: "percentage", value: 0.1 },
    y: _0,
    z: _0,
  });
});

test("parse() parses a translateY function with length", (t) => {
  const actual = serialize("translateY(1px)");

  t.deepEqual(actual, {
    type: "transform",
    kind: "translate",
    x: _0,
    y: { type: "length", unit: "px", value: 1 },
    z: _0,
  });
});

test("parse() parses a translateY function with percentage", (t) => {
  const actual = serialize("translateY(10%)");

  t.deepEqual(actual, {
    type: "transform",
    kind: "translate",
    x: _0,
    y: { type: "percentage", value: 0.1 },
    z: _0,
  });
});

test("parse() parses a translateZ function with length", (t) => {
  const actual = serialize("translateZ(1px)");

  t.deepEqual(actual, {
    type: "transform",
    kind: "translate",
    x: _0,
    y: _0,
    z: { type: "length", unit: "px", value: 1 },
  });
});

test("parse() rejects a translateZ function with percentage", (t) => {
  const actual = parseErr("translateZ(10%)");

  t(actual.isErr());
});

test("parse() parses translate3d function with three lengths", (t) => {
  const actual = serialize("translate3d(2px, 1em, 1px)");

  t.deepEqual(actual, {
    type: "transform",
    kind: "translate",
    x: { type: "length", unit: "px", value: 2 },
    y: { type: "length", unit: "em", value: 1 },
    z: { type: "length", unit: "px", value: 1 },
  });
});

test("parse() requires exactly three parameters for translate3d", (t) => {
  for (const input of [
    "translate3d(1px, 1px)",
    "translate3d(1px, 1px, 1px, 1px)",
  ]) {
    const actual = parseErr(input);

    t(actual.isErr());
  }
});

test("parse() accepts percentages in x and y components of translate3d", (t) => {
  for (const input of [
    "translate3d(1%, 1px, 1px)",
    "translate3d(1%, 1%, 1px)",
    "translate3d(1px, 1%, 1px)",
  ]) {
    const actual = parseErr(input);

    t(actual.isOk());
  }
});

test("parse() rejects percentage in z component of a translate3d", (t) => {
  for (const input of [
    "translate3d(1px, 1px, 1%)",
    "translate3d(1%, 1px, 1%)",
    "translate3d(1%, 1%, 1%)",
    "translate3d(1px, 1%, 1%)",
  ]) {
    const actual = parseErr(input);

    t(actual.isErr());
  }
});

test("parse() accepts calculation in translate function", (t) => {
  const actual = serialize("translate(calc(2px + 10%), calc(1em * 2))");

  t.deepEqual(actual, {
    type: "transform",
    kind: "translate",
    x: {
      type: "length-percentage",
      math: {
        type: "math expression",
        expression: {
          type: "calculation",
          arguments: [
            {
              type: "sum",
              operands: [
                {
                  type: "value",
                  value: { type: "length", unit: "px", value: 2 },
                },
                { type: "value", value: { type: "percentage", value: 0.1 } },
              ],
            },
          ],
        },
      },
    },
    y: {
      type: "length",
      math: {
        type: "math expression",
        expression: {
          type: "value",
          value: { type: "length", unit: "em", value: 2 },
        },
      },
    },
    z: _0,
  });
});

test("parse() accepts calculation in translateX function", (t) => {
  const actual = serialize("translateX(calc(2px + 10%))");

  t.deepEqual(actual, {
    type: "transform",
    kind: "translate",
    x: {
      type: "length-percentage",
      math: {
        type: "math expression",
        expression: {
          type: "calculation",
          arguments: [
            {
              type: "sum",
              operands: [
                {
                  type: "value",
                  value: { type: "length", unit: "px", value: 2 },
                },
                { type: "value", value: { type: "percentage", value: 0.1 } },
              ],
            },
          ],
        },
      },
    },
    y: _0,
    z: _0,
  });
});

test("parse() accepts calculation in translateY function", (t) => {
  const actual = serialize("translateY(calc(1em * 2))");

  t.deepEqual(actual, {
    type: "transform",
    kind: "translate",
    x: _0,
    y: {
      type: "length",
      math: {
        type: "math expression",
        expression: {
          type: "value",
          value: { type: "length", unit: "em", value: 2 },
        },
      },
    },
    z: _0,
  });
});

test("parse() accepts calculation in translateZ function", (t) => {
  const actual = serialize("translateZ(calc(1em * 2))");

  t.deepEqual(actual, {
    type: "transform",
    kind: "translate",
    x: _0,
    y: _0,
    z: {
      type: "length",
      math: {
        type: "math expression",
        expression: {
          type: "value",
          value: { type: "length", unit: "em", value: 2 },
        },
      },
    },
  });
});

test("parse() accepts calculation in translate3d function", (t) => {
  const actual = serialize(
    "translate3d(calc(2px + 10%), calc(1em + 1px), calc(1em * 2))",
  );

  t.deepEqual(actual, {
    type: "transform",
    kind: "translate",
    x: {
      type: "length-percentage",
      math: {
        type: "math expression",
        expression: {
          type: "calculation",
          arguments: [
            {
              type: "sum",
              operands: [
                {
                  type: "value",
                  value: { type: "length", unit: "px", value: 2 },
                },
                { type: "value", value: { type: "percentage", value: 0.1 } },
              ],
            },
          ],
        },
      },
    },
    y: {
      type: "length",
      math: {
        type: "math expression",
        expression: {
          type: "calculation",
          arguments: [
            {
              operands: [
                {
                  type: "value",
                  value: { type: "length", unit: "em", value: 1 },
                },
                {
                  type: "value",
                  value: { type: "length", unit: "px", value: 1 },
                },
              ],
              type: "sum",
            },
          ],
        },
      },
    },
    z: {
      type: "length",
      math: {
        type: "math expression",
        expression: {
          type: "value",
          value: { type: "length", unit: "em", value: 2 },
        },
      },
    },
  });
});

test("resolve() resolves a Translate", (t) => {
  const actual = parserUnsafe(Translate.parse)(
    "translate3d(calc(2px + 10%), calc(1em + 1px), calc(1em * 2))",
  ).resolve({
    length: Length.resolver(
      Length.of(16, "px"),
      Length.of(16, "px"),
      Length.of(16, "px"),
      Length.of(16, "px"),
    ),
    percentageBase: Length.of(10, "px"),
  });

  t.deepEqual(actual.toJSON(), {
    type: "transform",
    kind: "translate",
    x: { type: "length", unit: "px", value: 3 },
    y: { type: "length", unit: "px", value: 17 },
    z: { type: "length", unit: "px", value: 32 },
  });
});
