import { Assertions, test } from "@siteimprove/alfa-test";

import { Lexer } from "../../src/syntax/lexer";
import { Token } from "../../src/syntax/token";

function lex(t: Assertions, input: string, expected: Array<Token.JSON>) {
  t.deepEqual(
    Lexer.lex(input).map(token => token.toJSON()),
    expected,
    input
  );
}

function char(input: string): number {
  return input.charCodeAt(0);
}

test(".lex() lexes an integer", t => {
  lex(t, "123", [
    {
      type: "integer",
      value: 123
    }
  ]);
});

test(".lex() lexes a decimal", t => {
  lex(t, `1.23`, [
    {
      type: "decimal",
      value: 1.23
    }
  ]);

  lex(t, `.123`, [
    {
      type: "decimal",
      value: 0.123
    }
  ]);

  lex(t, `123.`, [
    {
      type: "decimal",
      value: 123
    }
  ]);
});

test(".lex() lexes a double", t => {
  lex(t, `1e2`, [
    {
      type: "double",
      value: 100
    }
  ]);

  lex(t, `1e+2`, [
    {
      type: "double",
      value: 100
    }
  ]);

  lex(t, `1e-2`, [
    {
      type: "double",
      value: 0.01
    }
  ]);

  lex(t, `1.23e2`, [
    {
      type: "double",
      value: 123
    }
  ]);

  lex(t, `.123e3`, [
    {
      type: "double",
      value: 123
    }
  ]);

  lex(t, `123.e1`, [
    {
      type: "double",
      value: 1230
    }
  ]);
});

test(".lex() lexes a string", t => {
  lex(t, `"foo"`, [
    {
      type: "string",
      value: "foo"
    }
  ]);

  lex(t, `'foo'`, [
    {
      type: "string",
      value: "foo"
    }
  ]);

  lex(t, `""`, [
    {
      type: "string",
      value: ""
    }
  ]);

  lex(t, `''`, [
    {
      type: "string",
      value: ""
    }
  ]);

  lex(t, `""""`, [
    {
      type: "string",
      value: `"`
    }
  ]);

  lex(t, `''''`, [
    {
      type: "string",
      value: "'"
    }
  ]);
});

test(".lex() lexes a comment", t => {
  lex(t, `(:foo:)`, [
    {
      type: "comment",
      value: "foo"
    }
  ]);

  lex(t, `(:foo`, [
    {
      type: "comment",
      value: "foo"
    }
  ]);

  lex(t, `(:(:foo:):)`, [
    {
      type: "comment",
      value: "(:foo:)"
    }
  ]);
});

test(".lex() lexes a name", t => {
  lex(t, `foo`, [
    {
      type: "name",
      prefix: null,
      value: "foo"
    }
  ]);

  lex(t, `foo:bar`, [
    {
      type: "name",
      prefix: "foo",
      value: "bar"
    }
  ]);
});

test(".lex() lexes a character", t => {
  lex(t, `-`, [
    {
      type: "character",
      value: char("-")
    }
  ]);

  lex(t, `+`, [
    {
      type: "character",
      value: char("+")
    }
  ]);

  lex(t, ` `, [
    {
      type: "character",
      value: char(" ")
    }
  ]);
});

test(".lex() lexes an axis expression", t => {
  lex(t, `self::foo`, [
    {
      type: "name",
      prefix: null,
      value: "self"
    },
    {
      type: "character",
      value: char(":")
    },
    {
      type: "character",
      value: char(":")
    },
    {
      type: "name",
      prefix: null,
      value: "foo"
    }
  ]);

  lex(t, `..`, [
    {
      type: "character",
      value: char(".")
    },
    {
      type: "character",
      value: char(".")
    }
  ]);
});
