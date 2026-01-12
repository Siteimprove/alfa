import { test } from "@siteimprove/alfa-test";

import { Gradient } from "../../../dist/index.js";
import { color } from "../../common/color.js";
import { parser, serializer } from "../../common/parse.js";

const parseErr = parser(Gradient.Radial.parse);
const serialize = serializer(Gradient.Radial.parse);

const red = color(1, 0, 0);
const blue = color(0, 0, 1);

test("parse() parses a radial gradient with no shape or position", (t) => {
  t.deepEqual(serialize("radial-gradient(red, blue)"), {
    type: "gradient",
    kind: "radial",
    shape: { type: "extent", shape: "circle", size: "farthest-corner" },
    position: {
      type: "position",
      horizontal: { type: "keyword", value: "center" },
      vertical: { type: "keyword", value: "center" },
    },
    items: [
      { type: "stop", color: red, position: null },
      { type: "stop", color: blue, position: null },
    ],
    repeats: false,
  });
});

test("parse() parses a radial gradient with an extent", (t) => {
  t.deepEqual(serialize("radial-gradient(closest-side, red, blue)"), {
    type: "gradient",
    kind: "radial",
    shape: { type: "extent", shape: "circle", size: "closest-side" },
    position: {
      type: "position",
      horizontal: { type: "keyword", value: "center" },
      vertical: { type: "keyword", value: "center" },
    },
    items: [
      { type: "stop", color: red, position: null },
      { type: "stop", color: blue, position: null },
    ],
    repeats: false,
  });
});

test("parse() parses a radial gradient with an extent and a position", (t) => {
  t.deepEqual(
    serialize("radial-gradient(closest-side at bottom left, red, blue)"),
    {
      type: "gradient",
      kind: "radial",
      shape: { type: "extent", shape: "circle", size: "closest-side" },
      position: {
        type: "position",
        horizontal: {
          type: "side",
          side: { type: "keyword", value: "left" },
          offset: null,
        },
        vertical: {
          type: "side",
          side: { type: "keyword", value: "bottom" },
          offset: null,
        },
      },
      items: [
        { type: "stop", color: red, position: null },
        { type: "stop", color: blue, position: null },
      ],
      repeats: false,
    },
  );
});

test("parse() parses a radial gradient with a circle", (t) => {
  for (const input of ["1px", "1px circle", "circle 1px"]) {
    t.deepEqual(
      serialize(`radial-gradient(${input}, red, blue)`),
      {
        type: "gradient",
        kind: "radial",
        shape: {
          type: "circle",
          radius: { type: "length", value: 1, unit: "px" },
        },
        position: {
          type: "position",
          horizontal: { type: "keyword", value: "center" },
          vertical: { type: "keyword", value: "center" },
        },
        items: [
          { type: "stop", color: red, position: null },
          { type: "stop", color: blue, position: null },
        ],
        repeats: false,
      },
      input,
    );
  }
});

test("parse() parses a radial gradient with a circle and calculated radius", (t) => {
  t.deepEqual(
    serialize(`radial-gradient(calc(1px + 1px), red, blue)`).shape.radius,
    {
      type: "length",
      math: {
        type: "math expression",
        expression: {
          type: "value",
          value: { type: "length", value: 2, unit: "px" },
        },
      },
    },
    `radial-gradient(calc(1px + 1px), red, blue)`,
  );
});

test("parse() rejects percentages in circle radius", (t) => {
  for (const input of ["10%", "calc(1px + 10%)", "calc(10% + 1%)"]) {
    t.deepEqual(parseErr(input).isErr(), true, input);
  }
});

test("parse() parses a radial gradient with an ellipse", (t) => {
  for (const input of ["1px 2px", "1px 2px ellipse", "ellipse 1px 2px"]) {
    t.deepEqual(
      serialize(`radial-gradient(${input}, red, blue)`),
      {
        type: "gradient",
        kind: "radial",
        shape: {
          type: "ellipse",
          horizontal: { type: "length", value: 1, unit: "px" },
          vertical: { type: "length", value: 2, unit: "px" },
        },
        position: {
          type: "position",
          horizontal: { type: "keyword", value: "center" },
          vertical: { type: "keyword", value: "center" },
        },
        items: [
          { type: "stop", color: red, position: null },
          { type: "stop", color: blue, position: null },
        ],
        repeats: false,
      },
      input,
    );
  }
});

test("parse() parses a radial gradient with an ellipse and calculated radii, including length-percentage", (t) => {
  t.deepEqual(
    serialize("radial-gradient(calc(1px + 0.2em) calc(1vh + 20%), red, blue)")
      .shape,
    {
      type: "ellipse",
      horizontal: {
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
                    value: { type: "length", value: 1, unit: "px" },
                  },
                  {
                    type: "value",
                    value: { type: "length", value: 0.2, unit: "em" },
                  },
                ],
              },
            ],
          },
        },
      },
      vertical: {
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
                    value: { type: "length", value: 1, unit: "vh" },
                  },
                  { type: "value", value: { type: "percentage", value: 0.2 } },
                ],
              },
            ],
          },
        },
      },
    },
  );
});

test("parse() parses a radial gradient with a circular extent", (t) => {
  for (const input of [
    "circle",
    "circle farthest-corner",
    "farthest-corner circle",
  ]) {
    t.deepEqual(
      serialize(`radial-gradient(${input}, red, blue)`),
      {
        type: "gradient",
        kind: "radial",
        shape: { type: "extent", shape: "circle", size: "farthest-corner" },
        position: {
          type: "position",
          horizontal: { type: "keyword", value: "center" },
          vertical: { type: "keyword", value: "center" },
        },
        items: [
          { type: "stop", color: red, position: null },
          { type: "stop", color: blue, position: null },
        ],
        repeats: false,
      },
      input,
    );
  }
});

test("parse() parses a radial gradient with an elliptical extent", (t) => {
  for (const input of [
    "ellipse",
    "ellipse farthest-corner",
    "farthest-corner ellipse",
  ]) {
    t.deepEqual(
      serialize(`radial-gradient(${input}, red, blue)`),
      {
        type: "gradient",
        kind: "radial",
        shape: { type: "extent", shape: "ellipse", size: "farthest-corner" },
        position: {
          type: "position",
          horizontal: { type: "keyword", value: "center" },
          vertical: { type: "keyword", value: "center" },
        },
        items: [
          { type: "stop", color: red, position: null },
          { type: "stop", color: blue, position: null },
        ],
        repeats: false,
      },
      input,
    );
  }
});
