import { test } from "@siteimprove/alfa-test";

import { Lexer } from "../../../src/syntax/lexer";
import { Ellipse } from "../../../src/value/shape/ellipse";

function parse(input: string) {
  return Ellipse.parse(Lexer.lex(input)).map(([_, ellipse]) =>
    ellipse.toJSON()
  );
}

test("parse() parses an ellipse", (t) => {
  t.deepEqual(parse("ellipse(1px 3px at right)").get(), {
    type: "basic-shape",
    kind: "ellipse",
    rx: {
      type: "basic-shape",
      kind: "radius",
      value: {
        type: "length",
        value: 1,
        unit: "px",
      },
    },
    ry: {
      type: "basic-shape",
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
