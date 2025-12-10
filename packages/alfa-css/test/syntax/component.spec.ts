import { Slice } from "@siteimprove/alfa-slice";
import { test } from "@siteimprove/alfa-test";

import { Component, Lexer, Token } from "../../dist/index.js";

const { lex } = Lexer;
const { whitespace } = Token;

function consume(input: string): Component.JSON {
  return Component.consume(lex(input))
    .map(([, component]) => component.toJSON())
    .getUnsafe();
}

test(".consume() of empty returns error", (t) => {
  t.deepEqual(Component.consume(lex("")).toJSON(), {
    type: "err",
    error: "Unexpected end of file",
  });
});

test(".consume() parses whitespace", (t) => {
  t.deepEqual(consume(" "), [{ type: "whitespace" }]);
});

test(".consume() parses empty parenthesis block", (t) => {
  t.deepEqual(consume("()"), [
    { type: "open-parenthesis" },
    { type: "close-parenthesis" },
  ]);
});

test(".consume() parses function", (t) => {
  t.deepEqual(consume("var(--foo)"), [
    { type: "function", value: "var" },
    { type: "ident", value: "--foo" },
    { type: "close-parenthesis" },
  ]);
});

test(".consume() accepts EOF as the end of function without closing parenthesis", (t) => {
  // https://drafts.csswg.org/css-syntax/#consume-a-function
  t.deepEqual(consume("var(--foo"), [
    { type: "function", value: "var" },
    { type: "ident", value: "--foo" },
    // The closing parenthesis is added by the Symbol.iterator on Function.
    { type: "close-parenthesis" },
  ]);
});

test(".consume() parses only the first token of ill-formed blocks", (t) => {
  t.deepEqual(consume("(]"), [{ type: "open-parenthesis" }]);
});

test(".consume() parses only the first token of other inputs", (t) => {
  for (const [input, token] of [
    ["foo bar", { type: "ident", value: "foo" }],
    ["+2 - 3", { type: "number", isInteger: true, isSigned: true, value: 2 }],
    ["#fff or more", { type: "hash", isIdentifier: true, value: "fff" }],
    [" / 2", { type: "whitespace" }],
    ["; color: red;", { type: "semicolon" }],
    ["# # +", { type: "delim", value: 0x23 }],
  ] as const) {
    t.deepEqual(consume(input), [token]);
  }
});

test(".parse() parses leading whitespaces", (t) => {
  const spaces = Slice.of<Token>([whitespace(), whitespace()]);
  t.deepEqual(
    Component.parse(spaces.concat(lex("var(--foo)")))
      .map(([, component]) => component.toJSON())
      .getUnsafe(),
    [
      { type: "function", value: "var" },
      { type: "ident", value: "--foo" },
      { type: "close-parenthesis" },
    ],
  );
});
