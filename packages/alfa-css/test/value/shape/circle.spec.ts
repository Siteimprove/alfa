import { test } from "@siteimprove/alfa-test";

import { Circle } from "../../../dist";
import { parser, serializer } from "../../common/parse";

const parseErr = parser(Circle.parse);
const serialize = serializer(Circle.parse);

test("parse() parses a circle with just a radius", (t) => {
  t.deepEqual(serialize("circle(farthest-side)"), {
    type: "basic-shape",
    kind: "circle",
    radius: {
      type: "basic-shape",
      kind: "radius",
      value: { type: "keyword", value: "farthest-side" },
    },
    center: {
      type: "position",
      vertical: { type: "keyword", value: "center" },
      horizontal: { type: "keyword", value: "center" },
    },
  });
});

test("parse() parses a circle with just a center", (t) => {
  t.deepEqual(serialize("circle(at left)"), {
    type: "basic-shape",
    kind: "circle",
    radius: {
      type: "basic-shape",
      kind: "radius",
      value: { type: "keyword", value: "closest-side" },
    },
    center: {
      type: "position",
      vertical: { type: "keyword", value: "center" },
      horizontal: {
        type: "side",
        offset: null,
        side: { type: "keyword", value: "left" },
      },
    },
  });
});

test("parse() parses a circle with both radius and center", (t) => {
  t.deepEqual(serialize("circle(10px at left)"), {
    type: "basic-shape",
    kind: "circle",
    radius: {
      type: "basic-shape",
      kind: "radius",
      value: { type: "length", value: 10, unit: "px" },
    },
    center: {
      type: "position",
      vertical: { type: "keyword", value: "center" },
      horizontal: {
        type: "side",
        offset: null,
        side: { type: "keyword", value: "left" },
      },
    },
  });
});

test("parse() fails if there is a negative radius", (t) => {
  t.deepEqual(parseErr("circle(-1px)").isErr(), true);
});

test("parse() accepts calculated radius", (t) => {
  t.deepEqual(serialize("circle(calc(10px + 1%) at left)"), {
    type: "basic-shape",
    kind: "circle",
    radius: {
      type: "basic-shape",
      kind: "radius",
      value: {
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
                    value: { type: "length", value: 10, unit: "px" },
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
      },
    },
    center: {
      type: "position",
      vertical: { type: "keyword", value: "center" },
      horizontal: {
        type: "side",
        offset: null,
        side: { type: "keyword", value: "left" },
      },
    },
  });
});
