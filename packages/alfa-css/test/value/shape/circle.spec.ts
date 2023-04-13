import { test } from "@siteimprove/alfa-test";

import { Lexer } from "../../../src/syntax/lexer";
import { Circle } from "../../../src/value/shape/circle";

function parse(input: string) {
  return Circle.parse(Lexer.lex(input)).map(([_, circle]) => circle.toJSON());
}

test("parse() parses a circle with just a radius", (t) => {
  t.deepEqual(parse("circle(farthest-side)").getUnsafe(), {
    type: "basic-shape",
    kind: "circle",
    radius: {
      type: "basic-shape",
      kind: "radius",
      value: {
        type: "keyword",
        value: "farthest-side",
      },
    },
    center: {
      type: "position",
      vertical: {
        type: "keyword",
        value: "center",
      },
      horizontal: {
        type: "keyword",
        value: "center",
      },
    },
  });
});

test("parse() parses a circle with just a center", (t) => {
  t.deepEqual(parse("circle(at left)").getUnsafe(), {
    type: "basic-shape",
    kind: "circle",
    radius: {
      type: "basic-shape",
      kind: "radius",
      value: {
        type: "keyword",
        value: "closest-side",
      },
    },
    center: {
      type: "position",
      vertical: {
        type: "keyword",
        value: "center",
      },
      horizontal: {
        type: "side",
        offset: null,
        side: {
          type: "keyword",
          value: "left",
        },
      },
    },
  });
});

test("parse() parses a circle with both radius and center", (t) => {
  t.deepEqual(parse("circle(10px at left)").getUnsafe(), {
    type: "basic-shape",
    kind: "circle",
    radius: {
      type: "basic-shape",
      kind: "radius",
      value: {
        type: "length",
        value: 10,
        unit: "px",
      },
    },
    center: {
      type: "position",
      vertical: {
        type: "keyword",
        value: "center",
      },
      horizontal: {
        type: "side",
        offset: null,
        side: {
          type: "keyword",
          value: "left",
        },
      },
    },
  });
});

test("parse() fails if there is a negative radius", (t) => {
  t.deepEqual(parse("circle(-1px)").isErr(), true);
});
