import { test } from "@siteimprove/alfa-test";

import { Ellipse } from "../../../dist/index.js";
import { serializer } from "../../common/parse.js";

const serialize = serializer(Ellipse.parse);

test("parse() parses an ellipse", (t) => {
  t.deepEqual(serialize("ellipse(1px 3px at right)"), {
    type: "basic-shape",
    kind: "ellipse",
    rx: {
      type: "basic-shape",
      kind: "radius",
      value: { type: "length", value: 1, unit: "px" },
    },
    ry: {
      type: "basic-shape",
      kind: "radius",
      value: { type: "length", value: 3, unit: "px" },
    },
    center: {
      type: "position",
      vertical: { type: "keyword", value: "center" },
      horizontal: {
        type: "side",
        offset: null,
        side: { type: "keyword", value: "right" },
      },
    },
  });
});

test("parse() accepts calculated radii", (t) => {
  t.deepEqual(serialize("ellipse(calc(1em - 10%) calc(1px + 1ch) at right)"), {
    type: "basic-shape",
    kind: "ellipse",
    rx: {
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
                    value: { type: "length", value: 1, unit: "em" },
                  },
                  {
                    type: "value",
                    value: { type: "percentage", value: -0.1 },
                  },
                ],
              },
            ],
          },
        },
      },
    },
    ry: {
      type: "basic-shape",
      kind: "radius",
      value: {
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
                    value: { type: "length", value: 1, unit: "ch" },
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
        side: { type: "keyword", value: "right" },
      },
    },
  });
});
