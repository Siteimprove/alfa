import { test } from "@siteimprove/alfa-test";

import { Lexer } from "../../src/syntax/lexer";
import { Shape } from "../../src/value/shape";

function parse(input: string) {
  return Shape.parse(Lexer.lex(input)).map(([_, shape]) => shape.toJSON());
}

test(".parse() parses <basic-shape> <geometry-box>", (t) => {
  t.deepEqual(parse("inset(1px) padding-box").getUnsafe(), {
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
  t.deepEqual(parse("margin-box inset(1px)").getUnsafe(), {
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
  t.deepEqual(parse("inset(1px)").getUnsafe(), {
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
  t.deepEqual(parse("margin-box").isErr(), true);
});
