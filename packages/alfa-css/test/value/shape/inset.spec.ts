import { test } from "@siteimprove/alfa-test";

import { Lexer } from "../../../src/syntax/lexer";
import { Inset } from "../../../src/value/shape/inset";

function parse(input: string) {
  return Inset.parse(Lexer.lex(input)).map(([_, circle]) => circle.toJSON());
}

test("parse() parses an inset with square corners", (t) => {
  t.deepEqual(parse("inset(1px 2px 3px 4px)").getUnsafe(), {
    type: "basic-shape",
    kind: "inset",
    offsets: [
      { type: "length", value: 1, unit: "px" },
      { type: "length", value: 2, unit: "px" },
      { type: "length", value: 3, unit: "px" },
      { type: "length", value: 4, unit: "px" },
    ],
    corners: { type: "none" },
  });
});

test("parse() parses an inset with evenly rounded corners", (t) => {
  t.deepEqual(parse("inset(1px 2px 3px 4px round 1px 1px 1px 1px)").getUnsafe(), {
    type: "basic-shape",
    kind: "inset",
    offsets: [
      { type: "length", value: 1, unit: "px" },
      { type: "length", value: 2, unit: "px" },
      { type: "length", value: 3, unit: "px" },
      { type: "length", value: 4, unit: "px" },
    ],
    corners: {
      type: "some",
      value: [
        { type: "length", value: 1, unit: "px" },
        { type: "length", value: 1, unit: "px" },
        { type: "length", value: 1, unit: "px" },
        { type: "length", value: 1, unit: "px" },
      ],
    },
  });
});

test("parse() parses an inset with unevenly rounded corners", (t) => {
  t.deepEqual(
    parse(
      "inset(1px 2px 3px 4px round 1px 1px 1px 1px / 2px 2px 2px 2px)"
    ).getUnsafe(),
    {
      type: "basic-shape",
      kind: "inset",
      offsets: [
        { type: "length", value: 1, unit: "px" },
        { type: "length", value: 2, unit: "px" },
        { type: "length", value: 3, unit: "px" },
        { type: "length", value: 4, unit: "px" },
      ],
      corners: {
        type: "some",
        value: [
          [
            { type: "length", value: 1, unit: "px" },
            { type: "length", value: 2, unit: "px" },
          ],
          [
            { type: "length", value: 1, unit: "px" },
            { type: "length", value: 2, unit: "px" },
          ],
          [
            { type: "length", value: 1, unit: "px" },
            { type: "length", value: 2, unit: "px" },
          ],
          [
            { type: "length", value: 1, unit: "px" },
            { type: "length", value: 2, unit: "px" },
          ],
        ],
      },
    }
  );
});

test("parse() parses a partially specified inset", (t) => {
  t.deepEqual(parse("inset(1px 2px 3px round 1px 1px/2px)").getUnsafe(), {
    type: "basic-shape",
    kind: "inset",
    offsets: [
      { type: "length", value: 1, unit: "px" },
      { type: "length", value: 2, unit: "px" },
      { type: "length", value: 3, unit: "px" },
      { type: "length", value: 2, unit: "px" },
    ],
    corners: {
      type: "some",
      value: [
        [
          { type: "length", value: 1, unit: "px" },
          { type: "length", value: 2, unit: "px" },
        ],
        [
          { type: "length", value: 1, unit: "px" },
          { type: "length", value: 2, unit: "px" },
        ],
        [
          { type: "length", value: 1, unit: "px" },
          { type: "length", value: 2, unit: "px" },
        ],
        [
          { type: "length", value: 1, unit: "px" },
          { type: "length", value: 2, unit: "px" },
        ],
      ],
    },
  });
});
