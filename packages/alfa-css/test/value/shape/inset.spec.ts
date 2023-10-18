import { test } from "@siteimprove/alfa-test";

import { Inset, Lexer } from "../../../src";

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
  t.deepEqual(
    parse("inset(1px 2px 3px 4px round 1px 1px 1px 1px)").getUnsafe(),
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
          { type: "length", value: 1, unit: "px" },
          { type: "length", value: 1, unit: "px" },
          { type: "length", value: 1, unit: "px" },
          { type: "length", value: 1, unit: "px" },
        ],
      },
    }
  );
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

test("parse() accepts calculated offsets and corners", (t) => {
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
      `inset(${actual(1)} ${actual(2)} ${actual(3)} ${actual(4)} ` +
        `round ${actual(1)} ${actual(1)} ${actual(1)} ${actual(1)} ` +
        `/ ${actual(2)} ${actual(2)} ${actual(2)} ${actual(2)})`
    ).getUnsafe(),
    {
      type: "basic-shape",
      kind: "inset",
      offsets: [expected(1), expected(2), expected(3), expected(4)],
      corners: {
        type: "some",
        value: [
          [expected(1), expected(2)],
          [expected(1), expected(2)],
          [expected(1), expected(2)],
          [expected(1), expected(2)],
        ],
      },
    }
  );
});
