import { Slice } from "@siteimprove/alfa-slice";
import { Assertions, test } from "@siteimprove/alfa-test";

import { Lexer } from "../../../src/syntax/lexer";
import { Polygon } from "../../../src/value/shape/polygon";

function parse(t: Assertions, input: string, expected: Polygon.JSON) {
  t.deepEqual(
    Polygon.parse(Slice.of(Lexer.lex(input)))
      .map(([_, circle]) => circle)
      .get()
      .toJSON(),
    expected,
    input
  );
}

test("parse() parses a polygon with no fill rule", (t) => {
  parse(t, "polygon(1px 0px 1px 1px 0px 1px)", {
    type: "shape",
    kind: "polygon",
    fillRule: { type: "none" },
    vertices: [
      [
        { type: "length", value: 1, unit: "px" },
        { type: "length", value: 0, unit: "px" },
      ],
      [
        { type: "length", value: 1, unit: "px" },
        { type: "length", value: 1, unit: "px" },
      ],
      [
        { type: "length", value: 0, unit: "px" },
        { type: "length", value: 1, unit: "px" },
      ],
    ],
  });
});

test("parse() parses a polygon with a fill rule", (t) => {
  parse(t, "polygon(evenodd, 1px 0px 1px 1px 0px 1px)", {
    type: "shape",
    kind: "polygon",
    fillRule: { type: "some", value: { type: "keyword", value: "evenodd" } },
    vertices: [
      [
        { type: "length", value: 1, unit: "px" },
        { type: "length", value: 0, unit: "px" },
      ],
      [
        { type: "length", value: 1, unit: "px" },
        { type: "length", value: 1, unit: "px" },
      ],
      [
        { type: "length", value: 0, unit: "px" },
        { type: "length", value: 1, unit: "px" },
      ],
    ],
  });
});

test("parse() fails when there is an odd number of coordinates", (t) => {
  t.deepEqual(
    Polygon.parse(Slice.of(Lexer.lex("polygon(1px 0px 1px 1px 0px)"))).isErr(),
    true
  );
});
