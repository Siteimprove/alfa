import { Slice } from "@siteimprove/alfa-slice";
import { test } from "@siteimprove/alfa-test";

import { Component, Token } from "../../src/";

const { consume } = Component;
const { whitespace, openParenthesis, closeParenthesis, func, number, comma } =
  Token;

test(".consume() of empty returns error", (t) => {
  t.deepEqual(consume(Slice.empty()).toJSON(), {
    type: "err",
    error: "Unexpected end of file",
  });
});

test(".consume() parses whitespace", (t) => {
  t.deepEqual(
    consume(Slice.of([whitespace()]))
      .map(([, component]) => component.toJSON())
      .get(),
    [{ type: "whitespace" }]
  );
});

test(".consume() parses empty parenthesis block", (t) => {
  t.deepEqual(
    consume(Slice.of([openParenthesis(), closeParenthesis()]))
      .map(([, component]) => component.toJSON())
      .get(),
    [
      {
        type: "open-parenthesis",
      },
      {
        type: "close-parenthesis",
      },
    ]
  );
});

test(".consume() parses function", (t) => {
  t.deepEqual(
    consume(
      Slice.of([
        func("rgb"),
        number(255, true, false),
        comma(),
        whitespace(),
        number(255, true, false),
        comma(),
        whitespace(),
        number(255, true, false),
      ])
    )
      .map(([, component]) => component.toJSON())
      .get(),
    [
      {
        type: "function",
        value: "rgb",
      },
      {
        isInteger: true,
        isSigned: false,
        type: "number",
        value: 255,
      },
      {
        type: "comma",
      },
      {
        type: "whitespace",
      },
      {
        isInteger: true,
        isSigned: false,
        type: "number",
        value: 255,
      },
      {
        type: "comma",
      },
      {
        type: "whitespace",
      },
      {
        isInteger: true,
        isSigned: false,
        type: "number",
        value: 255,
      },
      {
        type: "close-parenthesis",
      },
    ]
  );
});
