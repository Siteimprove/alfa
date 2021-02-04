import { Assertions, test } from "@siteimprove/alfa-test";

import { Slice } from "@siteimprove/alfa-slice";

import { Lexer } from "../../src/syntax/lexer";
import { Shape } from "../../src/value/shape";

function parse(t: Assertions, input: string, expected: Shape.JSON) {
  t.deepEqual(
    Shape.parse(Slice.of(Lexer.lex(input)))
      .map(([_, shape]) => shape)
      .get()
      .toJSON(),
    expected,
    input
  );
}

test("parse() parses <basic-shape> <geometry-box>", (t) => {
  parse(t, "inset(1px) padding-box", {
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

test("parse() parses <geometry-box> <basic-shape>", (t) => {
  parse(t, "margin-box inset(1px)", {
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

test("parse() parses <basic-shape>", (t) => {
  parse(t, "inset(1px)", {
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

test("parse() fails if no <basic-shape> is provided", (t) => {
  t.deepEqual(Shape.parse(Slice.of(Lexer.lex("margin-box"))).isErr(), true);
});
