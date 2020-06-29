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
