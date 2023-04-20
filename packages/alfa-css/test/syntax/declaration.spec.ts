import { Assertions, test } from "@siteimprove/alfa-test";

import { Lexer } from "../../src/syntax/lexer";
import { Declaration } from "../../src/syntax/declaration";

function consume(t: Assertions, input: string, expected: Declaration.JSON) {
  t.deepEqual(
    Declaration.consume(Lexer.lex(input))
      .map(([, declaration]) => declaration)
      .getUnsafe()
      .toJSON(),
    expected,
    input
  );
}

test(".consume() consumes a declaration", (t) => {
  consume(t, "display: none", {
    name: "display",
    value: [
      {
        type: "ident",
        value: "none",
      },
    ],
    important: false,
  });
});

test(".consume() consumes an important declaration", (t) => {
  consume(t, "display: none !important", {
    name: "display",
    value: [
      {
        type: "ident",
        value: "none",
      },
    ],
    important: true,
  });
});

test(".consume() consumes a declaration value with a block", (t) => {
  consume(t, "foo: (bar) !important", {
    name: "foo",
    value: [
      {
        type: "open-parenthesis",
      },
      {
        type: "ident",
        value: "bar",
      },
      {
        type: "close-parenthesis",
      },
    ],
    important: true,
  });
});

test(".consume() consumes a declaration value with a function", (t) => {
  consume(t, "foo: do(bar)", {
    name: "foo",
    value: [
      {
        type: "function",
        value: "do",
      },
      {
        type: "ident",
        value: "bar",
      },
      {
        type: "close-parenthesis",
      },
    ],
    important: false,
  });
});

test(".consume() consumes a declaration value with a function with a block", (t) => {
  consume(t, "foo: do([bar])", {
    name: "foo",
    value: [
      {
        type: "function",
        value: "do",
      },
      {
        type: "open-square-bracket",
      },
      {
        type: "ident",
        value: "bar",
      },
      {
        type: "close-square-bracket",
      },
      {
        type: "close-parenthesis",
      },
    ],
    important: false,
  });
});

test(".consume() consumes a declaration without values", (t) => {
  consume(t, "foo: ", {
    name: "foo",
    value: [],
    important: false,
  });
});

test(".consume() returns error on empty input", (t) => {
  t.deepEqual(Declaration.consume(Lexer.lex("")).toJSON(), {
    type: "err",
    error: "No token left",
  });
});

test(".consume() returns error when first token is not identifier", (t) => {
  t.deepEqual(Declaration.consume(Lexer.lex("(: do([bar])")).toJSON(), {
    type: "err",
    error: "Mismatching token",
  });
});
