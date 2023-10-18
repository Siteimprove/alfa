import { test } from "@siteimprove/alfa-test";

import { Length, Lexer, Rectangle } from "../../../src";

function parse(input: string) {
  return Rectangle.parse(Lexer.lex(input)).getUnsafe()[1].toJSON();
}

test(".parse() parses comma separated rectangles", (t) => {
  t.deepEqual(parse("rect(1px, auto, 2em, auto)"), {
    type: "basic-shape",
    kind: "rectangle",
    bottom: { type: "length", unit: "em", value: 2 },
    left: { type: "keyword", value: "auto" },
    right: { type: "keyword", value: "auto" },
    top: { type: "length", unit: "px", value: 1 },
  });

  t.deepEqual(parse("rect(1px , auto , 2em,auto)"), {
    type: "basic-shape",
    kind: "rectangle",
    bottom: { type: "length", unit: "em", value: 2 },
    left: { type: "keyword", value: "auto" },
    right: { type: "keyword", value: "auto" },
    top: { type: "length", unit: "px", value: 1 },
  });
});

test(".parse() parses space separated rectangles", (t) => {
  t.deepEqual(parse("rect(1px auto 2em auto)"), {
    type: "basic-shape",
    kind: "rectangle",
    bottom: { type: "length", unit: "em", value: 2 },
    left: { type: "keyword", value: "auto" },
    right: { type: "keyword", value: "auto" },
    top: { type: "length", unit: "px", value: 1 },
  });
});

test(".parse() fails if there are more or less than 4 values", (t) => {
  t.deepEqual(Rectangle.parse(Lexer.lex("rect(1px 1px 1px")).isErr(), true);

  t.deepEqual(
    Rectangle.parse(Lexer.lex("rect(1px 1px 1px 1px 1px")).isErr(),
    true
  );
});

test(".parse() fails when mixing comma and space separators", (t) => {
  t.deepEqual(
    Rectangle.parse(Lexer.lex("rect(1px 1px, 1px 1px")).isErr(),
    true
  );
});

test(".parse() accepts calculated lengths", (t) => {
  const actual = (length: number) => `calc(${length}px + 1em)`;
  const expected: (length: number) => Length.JSON = (length: number) => ({
    type: "length",
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
                value: { type: "length", value: 1, unit: "em" },
              },
            ],
          },
        ],
      },
    },
  });

  t.deepEqual(
    parse(`rect(${actual(1)}, ${actual(2)}, ${actual(3)}, ${actual(4)})`),
    {
      type: "basic-shape",
      kind: "rectangle",
      top: expected(1),
      right: expected(2),
      bottom: expected(3),
      left: expected(4),
    }
  );
});
