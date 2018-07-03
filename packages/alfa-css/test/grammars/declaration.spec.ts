import { lex, parse } from "@siteimprove/alfa-lang";
import { Assertions, test } from "@siteimprove/alfa-test";
import { Alphabet, TokenType } from "../../src/alphabet";
import {
  Declaration,
  DeclarationGrammar
} from "../../src/grammars/declaration";

function declaration(
  t: Assertions,
  input: string,
  expected: Declaration | Array<Declaration>
) {
  t.deepEqual(parse(lex(input, Alphabet), DeclarationGrammar), expected, input);
}

test("Can parse a single declaration", t =>
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
  }));

test("Can parse a list of declarations", t =>
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
  ]));

test("Can parse an important declaration", t =>
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
  }));
