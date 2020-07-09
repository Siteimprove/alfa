import { Assertions, test } from "@siteimprove/alfa-test";

import { Slice } from "@siteimprove/alfa-slice";

import { Lexer } from "../../src/syntax/lexer";
import { Declaration } from "../../src/syntax/declaration";

function consume(t: Assertions, input: string, expected: Declaration.JSON) {
  t.deepEqual(
    Declaration.consume(Slice.of(Lexer.lex(input)))
      .map(([, declaration]) => declaration)
      .get()
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

test(".consume() consumes custom properties", (t) => {
  consume(t, "--no-display: none", {
    name: "--no-display",
    value: [{ type: "ident", value: "none" }],
    important: false,
  });

  consume(t, "--no-display: none !important", {
    name: "--no-display",
    value: [{ type: "ident", value: "none" }],
    important: true,
  });
});

test(".consume() consumes var properties", (t) => {
  consume(t, "display: var(--no-display, default)", {
    name: "display",
    value: [
      { type: "function", value: "var" },
      {
        type: "ident",
        value: "--no-display",
      },
      {
        type: "comma",
      },
      {
        type: "whitespace",
      },
      {
        type: "ident",
        value: "default",
      },
      {
        type: "close-parenthesis",
      },
    ],
    important: false,
  });
});
