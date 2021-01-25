import { Assertions, test } from "@siteimprove/alfa-test";

import { Slice } from "@siteimprove/alfa-slice";

import { Lexer } from "../../../src/syntax/lexer";
import { Circle } from "../../../src/value/shape/circle";

function parse(t: Assertions, input: string, expected: Circle.JSON) {
  t.deepEqual(
    Circle.parse(Slice.of(Lexer.lex(input)))
      .map(([_, circle]) => circle)
      .get()
      .toJSON(),
    expected,
    input
  );
}

test("parse() parses a circle with just a radius", (t) => {
  parse(t, "circle(farthest-side)", {
    type: "shape",
    kind: "circle",
    radius: {
      type: "shape",
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
  parse(t, "circle(at left)", {
    type: "shape",
    kind: "circle",
    radius: {
      type: "shape",
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
  parse(t, "circle(10px at left)", {
    type: "shape",
    kind: "circle",
    radius: {
      type: "shape",
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
