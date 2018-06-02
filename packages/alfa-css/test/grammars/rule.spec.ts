import { test, Test } from "@siteimprove/alfa-test";
import { Char, parse, lex } from "@siteimprove/alfa-lang";
import { Alphabet } from "../../src/alphabet";
import { Rule, RuleGrammar } from "../../src/grammars/rule";

function rule(t: Test, input: string, expected: Rule | Array<Rule>) {
  t.deepEqual(parse(lex(input, Alphabet), RuleGrammar), expected, t.title);
}

test("Can parse a single qualified rule", t =>
  rule(t, "div{color:red}", {
    type: "qualified-rule",
    prelude: [
      {
        type: "ident",
        value: "div"
      }
    ],
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
  }));

test("Can parse a list of qualified rules", t =>
  rule(t, "div{color:red}span{color:blue}", [
    {
      type: "qualified-rule",
      prelude: [
        {
          type: "ident",
          value: "div"
        }
      ],
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
    },
    {
      type: "qualified-rule",
      prelude: [
        {
          type: "ident",
          value: "span"
        }
      ],
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
  ]));

test("Can parse a single at-rule", t =>
  rule(t, "@page{color:red}", {
    type: "at-rule",
    name: "page",
    prelude: [],
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
  }));

test("Can parse a rule with a class selector", t =>
  rule(t, ".foo{}", {
    type: "qualified-rule",
    prelude: [
      {
        type: "delim",
        value: Char.FullStop
      },
      {
        type: "ident",
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
        type: "delim",
        value: Char.NumberSign
      },
      {
        type: "ident",
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
        type: "["
      },
      {
        type: "ident",
        value: "foo"
      },
      {
        type: "]"
      }
    ],
    value: []
  }));
