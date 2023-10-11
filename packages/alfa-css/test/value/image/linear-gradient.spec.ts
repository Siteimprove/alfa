import { test } from "@siteimprove/alfa-test";

import { Gradient, Lexer } from "../../../src";

function parse(input: string) {
  return Gradient.Linear.parse(Lexer.lex(input)).getUnsafe()[1].toJSON();
}

test("parse() parses a linear gradient with no direction, hint nor intermediate stops", (t) => {
  t.deepEqual(parse("linear-gradient(red, blue)"), {
    type: "gradient",
    kind: "linear",
    direction: { type: "side", side: "bottom" },
    items: [
      {
        type: "stop",
        color: { type: "color", format: "named", color: "red" },
        position: null,
      },
      {
        type: "stop",
        color: { type: "color", format: "named", color: "blue" },
        position: null,
      },
    ],
    repeats: false,
  });
});

test("parse() parses a repeating linear gradient", (t) => {
  t.deepEqual(parse("repeating-linear-gradient(red, blue)"), {
    type: "gradient",
    kind: "linear",
    direction: { type: "side", side: "bottom" },
    items: [
      {
        type: "stop",
        color: { type: "color", format: "named", color: "red" },
        position: null,
      },
      {
        type: "stop",
        color: { type: "color", format: "named", color: "blue" },
        position: null,
      },
    ],
    repeats: true,
  });
});

test("parse() parses a linear gradient with an angle direction", (t) => {
  t.deepEqual(parse("linear-gradient(90deg, red, blue)"), {
    type: "gradient",
    kind: "linear",
    direction: { type: "angle", value: 90, unit: "deg" },
    items: [
      {
        type: "stop",
        color: { type: "color", format: "named", color: "red" },
        position: null,
      },
      {
        type: "stop",
        color: { type: "color", format: "named", color: "blue" },
        position: null,
      },
    ],
    repeats: false,
  });
});

test("parse() parses a linear gradient with a side direction", (t) => {
  t.deepEqual(parse("linear-gradient(to left, red, blue)"), {
    type: "gradient",
    kind: "linear",
    direction: { type: "side", side: "left" },
    items: [
      {
        type: "stop",
        color: { type: "color", format: "named", color: "red" },
        position: null,
      },
      {
        type: "stop",
        color: { type: "color", format: "named", color: "blue" },
        position: null,
      },
    ],
    repeats: false,
  });
});

test("parse() parses a linear gradient with a corner direction", (t) => {
  t.deepEqual(parse("linear-gradient(to top left, red, blue)"), {
    type: "gradient",
    kind: "linear",
    direction: { type: "corner", vertical: "top", horizontal: "left" },
    items: [
      {
        type: "stop",
        color: { type: "color", format: "named", color: "red" },
        position: null,
      },
      {
        type: "stop",
        color: { type: "color", format: "named", color: "blue" },
        position: null,
      },
    ],
    repeats: false,
  });
});

test("parse() parses a linear gradient with a hint", (t) => {
  t.deepEqual(parse("linear-gradient(to left, red, 10%, blue)"), {
    type: "gradient",
    kind: "linear",
    direction: { type: "side", side: "left" },
    items: [
      {
        type: "stop",
        color: { type: "color", format: "named", color: "red" },
        position: null,
      },
      { type: "hint", position: { type: "percentage", value: 0.1 } },
      {
        type: "stop",
        color: { type: "color", format: "named", color: "blue" },
        position: null,
      },
    ],
    repeats: false,
  });
});

test("parse() parses a linear gradient with a intermediate stops", (t) => {
  t.deepEqual(
    parse("linear-gradient(to left, red, 10% yellow, green 2em, blue)"),
    {
      type: "gradient",
      kind: "linear",
      direction: { type: "side", side: "left" },
      items: [
        {
          type: "stop",
          color: { type: "color", format: "named", color: "red" },
          position: null,
        },
        {
          type: "stop",
          color: { type: "color", format: "named", color: "yellow" },
          position: { type: "percentage", value: 0.1 },
        },
        {
          type: "stop",
          color: { type: "color", format: "named", color: "green" },
          position: { type: "length", value: 2, unit: "em" },
        },
        {
          type: "stop",
          color: { type: "color", format: "named", color: "blue" },
          position: null,
        },
      ],
      repeats: false,
    }
  );
});

test("parse() parses a linear gradient with calculations", (t) => {
  t.deepEqual(
    parse(
      "linear-gradient(calc(0.25turn + 10deg), red, calc(1px + 10%) yellow, green 2em, blue)"
    ),
    {
      type: "gradient",
      kind: "linear",
      direction: {
        type: "angle",
        math: {
          type: "math expression",
          expression: {
            type: "value",
            value: { type: "angle", value: 100, unit: "deg" },
          },
        },
      },
      items: [
        {
          type: "stop",
          color: { type: "color", format: "named", color: "red" },
          position: null,
        },
        {
          type: "stop",
          color: { type: "color", format: "named", color: "yellow" },
          position: {
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
                        value: { type: "length", value: 1, unit: "px" },
                      },
                      {
                        type: "value",
                        value: { type: "percentage", value: 0.1 },
                      },
                    ],
                  },
                ],
              },
            },
          },
        },
        {
          type: "stop",
          color: { type: "color", format: "named", color: "green" },
          position: { type: "length", value: 2, unit: "em" },
        },
        {
          type: "stop",
          color: { type: "color", format: "named", color: "blue" },
          position: null,
        },
      ],
      repeats: false,
    }
  );
});
