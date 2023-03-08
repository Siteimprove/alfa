import { Slice } from "@siteimprove/alfa-slice";
import { test } from "@siteimprove/alfa-test";

import { Component, Lexer, Token } from "../../src/";

const { lex } = Lexer;
const { consume, parse } = Component;
const { whitespace } = Token;

test(".consume() of empty returns error", (t) => {
  t.deepEqual(consume(lex("")).toJSON(), {
    type: "err",
    error: "Unexpected end of file",
  });
});

test(".consume() parses whitespace", (t) => {
  t.deepEqual(
    consume(lex(" "))
      .map(([, component]) => component.toJSON())
      .get(),
    [{ type: "whitespace" }]
  );
});

test(".consume() parses empty parenthesis block", (t) => {
  t.deepEqual(
    consume(lex("()"))
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
    consume(lex("var(--foo)"))
      .map(([, component]) => component.toJSON())
      .get(),
    [
      {
        type: "function",
        value: "var",
      },
      {
        type: "ident",
        value: "--foo",
      },
      {
        type: "close-parenthesis",
      },
    ]
  );
});

test(".parse() parses leading whitespaces", (t) => {
  const spaces = Slice.of<Token>([whitespace(), whitespace()]);
  t.deepEqual(
    parse(spaces.concat(lex("var(--foo)")))
      .map(([, component]) => component.toJSON())
      .get(),
    [
      {
        type: "function",
        value: "var",
      },
      {
        type: "ident",
        value: "--foo",
      },
      {
        type: "close-parenthesis",
      },
    ]
  );
});
