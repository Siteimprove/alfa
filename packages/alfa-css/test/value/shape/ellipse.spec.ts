import { Assertions, test } from "@siteimprove/alfa-test";

import { Slice } from "@siteimprove/alfa-slice";

import { Lexer } from "../../../src/syntax/lexer";
import { Ellipse } from "../../../src/value/shape/ellipse";

function parse(t: Assertions, input: string, expected: Ellipse.JSON) {
  t.deepEqual(
    Ellipse.parse(Slice.of(Lexer.lex(input)))
      .map(([_, ellipse]) => ellipse)
      .get()
      .toJSON(),
    expected,
    input
  );
}

test("parse() parses an ellipse", (t) => {
  parse(t, "ellipse(1px 3px at right)", {
    type: "shape",
    kind: "ellipse",
    rx: {
      type: "shape",
      kind: "radius",
      value: {
        type: "length",
        value: 1,
        unit: "px",
      },
    },
    ry: {
      type: "shape",
      kind: "radius",
      value: {
        type: "length",
        value: 3,
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
          value: "right",
        },
      },
    },
  });
});
