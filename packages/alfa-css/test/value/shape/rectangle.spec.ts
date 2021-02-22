import { test } from "@siteimprove/alfa-test";

import { Lexer } from "../../../src/syntax/lexer";
import { Rectangle } from "../../../src/value/shape/rectangle";

function parse(input: string) {
  return Rectangle.parse(Lexer.lex(input)).map(([_, rectangle]) =>
    rectangle.toJSON()
  );
}

test(".parse() parses comma separated rectangles", (t) => {
  t.deepEqual(parse("rect(1px, auto, 2em, auto)").get(), {
    type: "basic-shape",
    kind: "rectangle",
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

  t.deepEqual(parse("rect(1px , auto , 2em,auto)").get(), {
    type: "basic-shape",
    kind: "rectangle",
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

test(".parse() parses space separated rectangles", (t) => {
  t.deepEqual(parse("rect(1px auto 2em auto)").get(), {
    type: "basic-shape",
    kind: "rectangle",
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

test(".parse() fails if there are more or less than 4 values", (t) => {
  t.deepEqual(parse("rect(1px 1px 1px").isErr(), true);

  t.deepEqual(parse("rect(1px 1px 1px 1px 1px").isErr(), true);
});

test(".parse() fails when mixing comma and space separators", (t) => {
  t.deepEqual(parse("rect(1px 1px, 1px 1px").isErr(), true);
});
