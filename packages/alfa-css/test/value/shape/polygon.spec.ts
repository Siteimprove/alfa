import { test } from "@siteimprove/alfa-test";

import { Lexer } from "../../../src/syntax/lexer";
import { Polygon } from "../../../src/value/shape/polygon";

function parse(input: string) {
  return Polygon.parse(Lexer.lex(input)).map(([_, circle]) => circle.toJSON());
}

test(".parse() parses a polygon with no fill rule", (t) => {
  t.deepEqual(parse("polygon(1px 0px 1px 1px 0px 1px)").getUnsafe(), {
    type: "basic-shape",
    kind: "polygon",
    fill: {
      type: "none",
    },
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

test(".parse() parses a polygon with a fill rule", (t) => {
  t.deepEqual(parse("polygon(evenodd, 1px 0px 1px 1px 0px 1px)").getUnsafe(), {
    type: "basic-shape",
    kind: "polygon",
    fill: {
      type: "some",
      value: { type: "keyword", value: "evenodd" },
    },
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

test(".parse() fails when there is an odd number of coordinates", (t) => {
  t.deepEqual(parse("polygon(1px 0px 1px 1px 0px)").isErr(), true);
});
