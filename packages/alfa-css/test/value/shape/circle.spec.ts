import { test } from "@siteimprove/alfa-test";

import { Circle, Lexer } from "../../../src";

function parse(input: string) {
  return Circle.parse(Lexer.lex(input)).getUnsafe()[1].toJSON();
}

test("parse() parses a circle with just a radius", (t) => {
  t.deepEqual(parse("circle(farthest-side)"), {
    type: "basic-shape",
    kind: "circle",
    radius: {
      type: "basic-shape",
      kind: "radius",
      value: { type: "keyword", value: "farthest-side" },
    },
    center: {
      type: "position",
      vertical: { type: "keyword", value: "center" },
      horizontal: { type: "keyword", value: "center" },
    },
  });
});

test("parse() parses a circle with just a center", (t) => {
  t.deepEqual(parse("circle(at left)"), {
    type: "basic-shape",
    kind: "circle",
    radius: {
      type: "basic-shape",
      kind: "radius",
      value: { type: "keyword", value: "closest-side" },
    },
    center: {
      type: "position",
      vertical: { type: "keyword", value: "center" },
      horizontal: {
        type: "side",
        offset: null,
        side: { type: "keyword", value: "left" },
      },
    },
  });
});

test("parse() parses a circle with both radius and center", (t) => {
  t.deepEqual(parse("circle(10px at left)"), {
    type: "basic-shape",
    kind: "circle",
    radius: {
      type: "basic-shape",
      kind: "radius",
      value: { type: "length", value: 10, unit: "px" },
    },
    center: {
      type: "position",
      vertical: { type: "keyword", value: "center" },
      horizontal: {
        type: "side",
        offset: null,
        side: { type: "keyword", value: "left" },
      },
    },
  });
});

test("parse() fails if there is a negative radius", (t) => {
  t.deepEqual(Circle.parse(Lexer.lex("circle(-1px)")).isErr(), true);
});

test("parse() accepts calculated radius", (t) => {
  t.deepEqual(parse("circle(calc(10px + 1%) at left)"), {
    type: "basic-shape",
    kind: "circle",
    radius: {
      type: "basic-shape",
      kind: "radius",
      value: {
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
                    value: { type: "length", value: 10, unit: "px" },
                  },
                  {
                    type: "value",
                    value: { type: "percentage", value: 0.01 },
                  },
                ],
              },
            ],
          },
        },
      },
    },
    center: {
      type: "position",
      vertical: { type: "keyword", value: "center" },
      horizontal: {
        type: "side",
        offset: null,
        side: { type: "keyword", value: "left" },
      },
    },
  });
});
