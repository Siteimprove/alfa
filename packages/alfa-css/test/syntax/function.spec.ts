import { test } from "@siteimprove/alfa-test";

import { Function, Lexer } from "../../src/";

const { lex } = Lexer;
const { consume } = Function;

test(".consume() of empty returns error", (t) => {
  t.deepEqual(consume(lex("")).toJSON(), {
    type: "err",
    error: "No token left",
  });
});

test(".consume() parses valid function declaration", (t) => {
  t.deepEqual(
    consume(lex("var(--foo)"))
      .map(([, func]) => func.toJSON())
      .get(),
    {
      name: "var",
      value: [
        {
          type: "ident",
          value: "--foo",
        },
      ],
    }
  );
});

test(".consume() parses function without closing parenthesis", (t) => {
  t.deepEqual(
    consume(lex("var(--foo"))
      .map(([, func]) => func.toJSON())
      .get(),
    {
      name: "var",
      value: [
        {
          type: "ident",
          value: "--foo",
        },
      ],
    }
  );
});
