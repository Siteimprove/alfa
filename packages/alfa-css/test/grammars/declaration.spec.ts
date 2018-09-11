import { lex, parse } from "@siteimprove/alfa-lang";
import { Assertions, test } from "@siteimprove/alfa-test";
import { Alphabet, TokenType } from "../../src/alphabet";
import { DeclarationGrammar } from "../../src/grammars/declaration";
import { Declaration } from "../../src/types";

function declaration(
  t: Assertions,
  input: string,
  expected: Declaration | Array<Declaration>
) {
  const lexer = lex(input, Alphabet);
  const parser = parse(lexer.result, DeclarationGrammar);

  t.deepEqual(parser.result, expected, input);
}

test("Can parse a single declaration", t => {
  declaration(t, "color:red", {
    type: "declaration",
    name: "color",
    value: [
      {
        type: TokenType.Ident,
        value: "red"
      }
    ],
    important: false
  });
});

test("Can parse a list of declarations", t => {
  declaration(t, "color:red;font-size:24px", [
    {
      type: "declaration",
      name: "color",
      value: [
        {
          type: TokenType.Ident,
          value: "red"
        }
      ],
      important: false
    },
    {
      type: "declaration",
      name: "font-size",
      value: [
        {
          type: TokenType.Dimension,
          value: 24,
          integer: true,
          unit: "px"
        }
      ],
      important: false
    }
  ]);
});

test("Can parse an important declaration", t => {
  declaration(t, "color:red!important", {
    type: "declaration",
    name: "color",
    value: [
      {
        type: TokenType.Ident,
        value: "red"
      }
    ],
    important: true
  });
});
