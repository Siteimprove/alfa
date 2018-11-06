import { test } from "@siteimprove/alfa-test";
import { TokenType } from "../src/alphabet";
import { parseDeclaration, parseRule, parseSelector } from "../src/parse";
import { SelectorType } from "../src/types";

test("Can parse a declaration", t => {
  t.deepEqual(parseDeclaration("text-color: #000 !important;"), [
    {
      name: "text-color",
      value: [
        {
          type: TokenType.Whitespace
        },
        {
          type: TokenType.Hash,
          unrestricted: true,
          value: "000"
        },
        {
          type: TokenType.Whitespace
        }
      ],
      important: true
    }
  ]);
});

test("Can parse a rule", t => {
  t.deepEqual(parseRule("b { text-decoration: none; }"), {
    prelude: [
      {
        type: TokenType.Ident,
        value: "b"
      },
      {
        type: TokenType.Whitespace
      }
    ],
    value: [
      {
        type: TokenType.Whitespace
      },
      {
        type: TokenType.Ident,
        value: "text-decoration"
      },
      {
        type: TokenType.Colon
      },
      {
        type: TokenType.Whitespace
      },
      {
        type: TokenType.Ident,
        value: "none"
      },
      {
        type: TokenType.Semicolon
      },
      {
        type: TokenType.Whitespace
      }
    ]
  });
});

test("Cannot parse a gibberish rule", t => {
  t.deepEqual(parseRule("{ text-decoration: none; }"), null);
});

test("Can parse a selector", t => {
  t.deepEqual(parseSelector("#foo"), {
    type: SelectorType.IdSelector,
    name: "foo"
  });
});
