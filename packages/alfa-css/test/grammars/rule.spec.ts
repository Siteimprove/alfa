import { Char, lex, parse } from "@siteimprove/alfa-lang";
import { Assertions, test } from "@siteimprove/alfa-test";
import { Alphabet, TokenType } from "../../src/alphabet";
import { Rule, RuleGrammar } from "../../src/grammars/rule";

function rule(t: Assertions, input: string, expected: Rule | Array<Rule>) {
  t.deepEqual(parse(lex(input, Alphabet), RuleGrammar), expected, input);
}

test("Can parse a single qualified rule", t =>
  rule(t, "div{color:red}", {
    type: "qualified-rule",
    prelude: [
      {
        type: TokenType.Ident,
        value: "div"
      }
    ],
    value: [
      {
        type: TokenType.Ident,
        value: "color"
      },
      {
        type: TokenType.Colon
      },
      {
        type: TokenType.Ident,
        value: "red"
      }
    ]
  }));

test("Can parse a list of qualified rules", t =>
  rule(t, "div{color:red}span{color:blue}", [
    {
      type: "qualified-rule",
      prelude: [
        {
          type: TokenType.Ident,
          value: "div"
        }
      ],
      value: [
        {
          type: TokenType.Ident,
          value: "color"
        },
        {
          type: TokenType.Colon
        },
        {
          type: TokenType.Ident,
          value: "red"
        }
      ]
    },
    {
      type: "qualified-rule",
      prelude: [
        {
          type: TokenType.Ident,
          value: "span"
        }
      ],
      value: [
        {
          type: TokenType.Ident,
          value: "color"
        },
        {
          type: TokenType.Colon
        },
        {
          type: TokenType.Ident,
          value: "blue"
        }
      ]
    }
  ]));

test("Can parse a single at-rule", t =>
  rule(t, "@page{color:red}", {
    type: "at-rule",
    name: "page",
    prelude: [],
    value: [
      {
        type: TokenType.Ident,
        value: "color"
      },
      {
        type: TokenType.Colon
      },
      {
        type: TokenType.Ident,
        value: "red"
      }
    ]
  }));

test("Can parse an at-rule with a prelude", t =>
  rule(t, "@page foo", {
    type: "at-rule",
    name: "page",
    prelude: [
      {
        type: TokenType.Whitespace
      },
      {
        type: TokenType.Ident,
        value: "foo"
      }
    ]
  }));

test("Can parse an at-rule terminated by a semicolon", t =>
  rule(t, "@page;", {
    type: "at-rule",
    name: "page",
    prelude: []
  }));

test("Can parse a rule with a class selector", t =>
  rule(t, ".foo{}", {
    type: "qualified-rule",
    prelude: [
      {
        type: TokenType.Delim,
        value: Char.FullStop
      },
      {
        type: TokenType.Ident,
        value: "foo"
      }
    ],
    value: []
  }));

test("Can parse a rule with an ID selector", t =>
  rule(t, "#foo{}", {
    type: "qualified-rule",
    prelude: [
      {
        type: TokenType.Delim,
        value: Char.NumberSign
      },
      {
        type: TokenType.Ident,
        value: "foo"
      }
    ],
    value: []
  }));

test("Can parse a rule with an attribute selector", t =>
  rule(t, "[foo]{}", {
    type: "qualified-rule",
    prelude: [
      {
        type: TokenType.LeftSquareBracket
      },
      {
        type: TokenType.Ident,
        value: "foo"
      },
      {
        type: TokenType.RightSquareBracket
      }
    ],
    value: []
  }));
