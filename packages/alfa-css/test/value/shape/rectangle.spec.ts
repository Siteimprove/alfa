import { Slice } from "@siteimprove/alfa-slice";
import { Assertions, test } from "@siteimprove/alfa-test";

import { Lexer } from "../../../src/syntax/lexer";
import { Rectangle } from "../../../src/value/shape/rectangle";

function parse(t: Assertions, input: string, expected: Rectangle.JSON) {
  t.deepEqual(
    Rectangle.parse(Slice.of(Lexer.lex(input)))
      .map(([_, rectangle]) => rectangle)
      .get()
      .toJSON(),
    expected,
    input
  );
}

test("parse() parses comma separated rectangles", (t) => {
  parse(t, "rect(1px, auto, 2em, auto)", {
    type: "shape",
    format: "rectangle",
    bottom: {
      type: "length",
      unit: "em",
      value: 2,
    },
    left: {
      type: "keyword",
      value: "auto",
    },
    right: {
      type: "keyword",
      value: "auto",
    },
    top: {
      type: "length",
      unit: "px",
      value: 1,
    },
  });
});

test("parse() parses space separated rectangles", (t) => {
  parse(t, "rect(1px auto 2em auto)", {
    type: "shape",
    format: "rectangle",
    bottom: {
      type: "length",
      unit: "em",
      value: 2,
    },
    left: {
      type: "keyword",
      value: "auto",
    },
    right: {
      type: "keyword",
      value: "auto",
    },
    top: {
      type: "length",
      unit: "px",
      value: 1,
    },
  });
});

test("parse() fails if there are more or less than 4 values", (t) => {
  t.deepEqual(
    Rectangle.parse(Slice.of(Lexer.lex("rect(1px 1px 1px"))).isErr(),
    true
  );

  t.deepEqual(
    Rectangle.parse(Slice.of(Lexer.lex("rect(1px 1px 1px 1px 1px"))).isErr(),
    true
  );
});

test("parse() fails when mixing comma and space separators", (t) => {
  t.deepEqual(
    Rectangle.parse(Slice.of(Lexer.lex("rect(1px 1px, 1px 1px"))).isErr(),
    true
  );
});
