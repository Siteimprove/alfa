import { Char, lex, parse } from "@siteimprove/alfa-lang";
import { Assertions, test } from "@siteimprove/alfa-test";
import { Alphabet, TokenType } from "../../src/alphabet";
import { RuleGrammar } from "../../src/grammars/rule";
import { Rule } from "../../src/types";

function rule(t: Assertions, input: string, expected: Rule | Array<Rule>) {
  const lexer = lex(input, Alphabet);
  const parser = parse(lexer.result, RuleGrammar);

  t.deepEqual(parser.result, expected, input);
}

test("Can parse a single qualified rule", t => {
  rule(t, "div{color:red}", {
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
  });
});

test("Can parse a list of qualified rules", t => {
  rule(t, "div{color:red}span{color:blue}", [
    {
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
  ]);
});

test("Can parse a single at-rule", t => {
  rule(t, "@page{color:red}", {
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
  });
});

test("Can parse an at-rule with a prelude", t => {
  rule(t, "@page foo", {
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
  });
});

test("Can parse an at-rule terminated by a semicolon", t => {
  rule(t, "@page;", {
    name: "page",
    prelude: []
  });
});

test("Can parse a rule with a class selector", t => {
  rule(t, ".foo{}", {
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
  });
});

test("Can parse a rule with an ID selector", t => {
  rule(t, "#foo{}", {
    prelude: [
      {
        type: TokenType.Hash,
        unrestricted: false,
        value: "foo"
      }
    ],
    value: []
  });
});

test("Can parse a rule with an attribute selector", t => {
  rule(t, "[foo]{}", {
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
  });
});
