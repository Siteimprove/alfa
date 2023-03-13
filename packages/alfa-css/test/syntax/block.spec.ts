import { Slice } from "@siteimprove/alfa-slice";
import { test } from "@siteimprove/alfa-test";

import { Block, Lexer, Token } from "../../src/";

const { lex } = Lexer;
const { consume } = Block;
const { whitespace, openParenthesis, closeParenthesis } = Token;

test(".consume() of empty returns error", (t) => {
  t.deepEqual(consume(lex("")).toJSON(), {
    type: "err",
    error: "No token left",
  });
});

test(".consume() of invalid input returns error", (t) => {
  t.deepEqual(consume(lex(")")).toJSON(), {
    type: "err",
    error: "Mismatching token",
  });
});

test(".consume() of unclosed block returns error", (t) => {
  t.deepEqual(consume(lex("( ")).toJSON(), {
    type: "err",
    error: "Expected closing delimiter",
  });
});

test(".consume() parses empty parenthesis block", (t) => {
  t.deepEqual(
    consume(lex("()"))
      .map(([, block]) => block.toJSON())
      .get(),
    {
      token: {
        type: "open-parenthesis",
      },
      value: [],
    }
  );
});

test(".consume() parses nested blocks", (t) => {
  t.deepEqual(
    consume(lex("(())"))
      .map(([, block]) => block.toJSON())
      .get(),
    {
      token: {
        type: "open-parenthesis",
      },
      value: [
        {
          type: "open-parenthesis",
        },
        {
          type: "close-parenthesis",
        },
      ],
    }
  );
});
