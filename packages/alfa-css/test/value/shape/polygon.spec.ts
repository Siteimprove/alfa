import { test } from "@siteimprove/alfa-test";

import { Lexer, Polygon } from "../../../src";

function parse(input: string) {
  return Polygon.parse(Lexer.lex(input)).getUnsafe()[1].toJSON();
}

test(".parse() parses a polygon with no fill rule", (t) => {
  t.deepEqual(parse("polygon(1px 0px 1px 1px 0px 1px)"), {
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
  t.deepEqual(parse("polygon(evenodd, 1px 0px 1px 1px 0px 1px)"), {
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
  t.deepEqual(
    Polygon.parse(Lexer.lex("polygon(1px 0px 1px 1px 0px)")).isErr(),
    true,
  );
});

test(".parse() accepts calculated vertices", (t) => {
  const actual = (length: number) => `calc(${length}px + 1%)`;
  const expected = (length: number) => ({
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
                value: { type: "length", value: length, unit: "px" },
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
  });

  t.deepEqual(
    parse(
      `polygon(${actual(1)} ${actual(0)} ${actual(1)} ${actual(1)}` +
        ` ${actual(0)} ${actual(1)})`,
    ),
    {
      type: "basic-shape",
      kind: "polygon",
      fill: {
        type: "none",
      },
      vertices: [
        [expected(1), expected(0)],
        [expected(1), expected(1)],
        [expected(0), expected(1)],
      ],
    },
  );
});
