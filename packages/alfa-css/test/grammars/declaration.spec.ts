import { test, Test } from "@siteimprove/alfa-test";
import { parse, lex } from "@siteimprove/alfa-lang";
import { Alphabet } from "../../src/alphabet";
import { Declaration } from "../../src/grammar";
import { DeclarationGrammar } from "../../src/grammars/declaration";

async function declaration(
  t: Test,
  input: string,
  expected: Declaration | Array<Declaration>
) {
  t.deepEqual(
    parse(lex(input, Alphabet), DeclarationGrammar),
    expected,
    t.title
  );
}

test("Can parse a single declaration", async t =>
  declaration(t, "color:red", {
    type: "declaration",
    name: "color",
    value: [
      {
        type: "ident",
        value: "red"
      }
    ],
    important: false
  }));

test("Can parse a list of declarations", async t =>
  declaration(t, "color:red;font-size:24px", [
    {
      type: "declaration",
      name: "color",
      value: [
        {
          type: "ident",
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
          type: "dimension",
          value: 24,
          integer: true,
          unit: "px"
        }
      ],
      important: false
    }
  ]));

test("Can parse an important declaration", async t =>
  declaration(t, "color:red!important", {
    type: "declaration",
    name: "color",
    value: [
      {
        type: "ident",
        value: "red"
      }
    ],
    important: true
  }));
