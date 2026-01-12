import { test } from "@siteimprove/alfa-test";

import { Gradient } from "../../../dist/index.js";
import { color } from "../../common/color.js";
import { serializer } from "../../common/parse.js";

const serialize = serializer(Gradient.Linear.parse);

const red = color(1, 0, 0);
const lime = color(0, 1, 0); // green is #008000
const blue = color(0, 0, 1);
const yellow = color(1, 1, 0);

test("parse() parses a linear gradient with no direction, hint nor intermediate stops", (t) => {
  t.deepEqual(serialize("linear-gradient(red, blue)"), {
    type: "gradient",
    kind: "linear",
    direction: { type: "side", side: "bottom" },
    items: [
      { type: "stop", color: red, position: null },
      { type: "stop", color: blue, position: null },
    ],
    repeats: false,
  });
});

test("parse() parses a repeating linear gradient", (t) => {
  t.deepEqual(serialize("repeating-linear-gradient(red, blue)"), {
    type: "gradient",
    kind: "linear",
    direction: { type: "side", side: "bottom" },
    items: [
      { type: "stop", color: red, position: null },
      { type: "stop", color: blue, position: null },
    ],
    repeats: true,
  });
});

test("parse() parses a linear gradient with an angle direction", (t) => {
  t.deepEqual(serialize("linear-gradient(90deg, red, blue)"), {
    type: "gradient",
    kind: "linear",
    direction: { type: "angle", value: 90, unit: "deg" },
    items: [
      { type: "stop", color: red, position: null },
      { type: "stop", color: blue, position: null },
    ],
    repeats: false,
  });
});

test("parse() parses a linear gradient with a side direction", (t) => {
  t.deepEqual(serialize("linear-gradient(to left, red, blue)"), {
    type: "gradient",
    kind: "linear",
    direction: { type: "side", side: "left" },
    items: [
      { type: "stop", color: red, position: null },
      { type: "stop", color: blue, position: null },
    ],
    repeats: false,
  });
});

test("parse() parses a linear gradient with a corner direction", (t) => {
  t.deepEqual(serialize("linear-gradient(to top left, red, blue)"), {
    type: "gradient",
    kind: "linear",
    direction: { type: "corner", vertical: "top", horizontal: "left" },
    items: [
      { type: "stop", color: red, position: null },
      { type: "stop", color: blue, position: null },
    ],
    repeats: false,
  });
});

test("parse() parses a linear gradient with a hint", (t) => {
  t.deepEqual(serialize("linear-gradient(to left, red, 10%, blue)"), {
    type: "gradient",
    kind: "linear",
    direction: { type: "side", side: "left" },
    items: [
      { type: "stop", color: red, position: null },
      { type: "hint", position: { type: "percentage", value: 0.1 } },
      { type: "stop", color: blue, position: null },
    ],
    repeats: false,
  });
});

test("parse() parses a linear gradient with a intermediate stops", (t) => {
  t.deepEqual(
    serialize("linear-gradient(to left, red, 10% yellow, lime 2em, blue)"),
    {
      type: "gradient",
      kind: "linear",
      direction: { type: "side", side: "left" },
      items: [
        { type: "stop", color: red, position: null },
        {
          type: "stop",
          color: yellow,
          position: { type: "percentage", value: 0.1 },
        },
        {
          type: "stop",
          color: lime,
          position: { type: "length", value: 2, unit: "em" },
        },
        { type: "stop", color: blue, position: null },
      ],
      repeats: false,
    },
  );
});

test("parse() parses a linear gradient with calculations", (t) => {
  t.deepEqual(
    serialize(
      "linear-gradient(calc(0.25turn + 10deg), red, calc(1px + 10%) yellow, lime 2em, blue)",
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
        { type: "stop", color: red, position: null },
        {
          type: "stop",
          color: yellow,
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
          color: lime,
          position: { type: "length", value: 2, unit: "em" },
        },
        { type: "stop", color: blue, position: null },
      ],
      repeats: false,
    },
  );
});
