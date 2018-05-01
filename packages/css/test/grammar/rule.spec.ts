import { test, Test } from "@alfa/test";
import { parse, lex } from "@alfa/lang";
import { Alphabet } from "../../src/alphabet";
import { AtRule, QualifiedRule } from "../../src/grammar";
import { RuleGrammar } from "../../src/grammar/rule";

async function rule(
  t: Test,
  input: string,
  expected: AtRule | QualifiedRule | Array<AtRule | QualifiedRule>
) {
  t.deepEqual(parse(lex(input, Alphabet), RuleGrammar), expected, t.title);
}

test("Can parse a single qualified rule", async t =>
  rule(t, "div{color:red}", {
    type: "qualified-rule",
    prelude: [
      {
        type: "ident",
        value: "div"
      }
    ],
    value: {
      type: "simple-block",
      name: "{",
      value: [
        {
          type: "ident",
          value: "color"
        },
        {
          type: ":"
        },
        {
          type: "ident",
          value: "red"
        }
      ]
    }
  }));

test("Can parse a list of qualified rules", async t =>
  rule(t, "div{color:red}span{color:blue}", [
    {
      type: "qualified-rule",
      prelude: [
        {
          type: "ident",
          value: "div"
        }
      ],
      value: {
        type: "simple-block",
        name: "{",
        value: [
          {
            type: "ident",
            value: "color"
          },
          {
            type: ":"
          },
          {
            type: "ident",
            value: "red"
          }
        ]
      }
    },
    {
      type: "qualified-rule",
      prelude: [
        {
          type: "ident",
          value: "span"
        }
      ],
      value: {
        type: "simple-block",
        name: "{",
        value: [
          {
            type: "ident",
            value: "color"
          },
          {
            type: ":"
          },
          {
            type: "ident",
            value: "blue"
          }
        ]
      }
    }
  ]));
