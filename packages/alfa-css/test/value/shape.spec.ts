import { test } from "@siteimprove/alfa-test";

import { Shape } from "../../src/value/shape/shape";
import { parser, serializer } from "../common/parse";

const parseErr = parser(Shape.parse);
const serialize = serializer(Shape.parse);

test(".parse() parses <basic-shape> <geometry-box>", (t) => {
  t.deepEqual(serialize("inset(1px) padding-box"), {
    type: "shape",
    box: {
      type: "keyword",
      value: "padding-box",
    },
    shape: {
      type: "basic-shape",
      kind: "inset",
      offsets: [
        { type: "length", value: 1, unit: "px" },
        { type: "length", value: 1, unit: "px" },
        { type: "length", value: 1, unit: "px" },
        { type: "length", value: 1, unit: "px" },
      ],
      corners: {
        type: "none",
      },
    },
  });
});

test(".parse() parses <geometry-box> <basic-shape>", (t) => {
  t.deepEqual(serialize("margin-box inset(1px)"), {
    type: "shape",
    box: {
      type: "keyword",
      value: "margin-box",
    },
    shape: {
      type: "basic-shape",
      kind: "inset",
      offsets: [
        { type: "length", value: 1, unit: "px" },
        { type: "length", value: 1, unit: "px" },
        { type: "length", value: 1, unit: "px" },
        { type: "length", value: 1, unit: "px" },
      ],
      corners: {
        type: "none",
      },
    },
  });
});

test(".parse() parses <basic-shape>", (t) => {
  t.deepEqual(serialize("inset(1px)"), {
    type: "shape",
    box: {
      type: "keyword",
      value: "border-box",
    },
    shape: {
      type: "basic-shape",
      kind: "inset",
      offsets: [
        { type: "length", value: 1, unit: "px" },
        { type: "length", value: 1, unit: "px" },
        { type: "length", value: 1, unit: "px" },
        { type: "length", value: 1, unit: "px" },
      ],
      corners: {
        type: "none",
      },
    },
  });
});

test(".parse() fails if no <basic-shape> is provided", (t) => {
  t.deepEqual(parseErr("margin-box").isErr(), true);
});
