import { lex } from "@siteimprove/alfa-lang";
import { Assertions, test } from "@siteimprove/alfa-test";
import { Alphabet, Token, TokenType } from "../src/alphabet";

function xpath(t: Assertions, input: string, expected: Array<Token>) {
  t.deepEqual(lex(input, Alphabet).result, expected, input);
}

function char(input: string): number {
  return input.charCodeAt(0);
}

test("Can lex an integer", t => {
  xpath(t, "123", [
    {
      type: TokenType.Integer,
      value: 123
    }
  ]);
});

test("Can lex a decimal", t => {
  xpath(t, `1.23`, [
    {
      type: TokenType.Decimal,
      value: 1.23
    }
  ]);

  xpath(t, `.123`, [
    {
      type: TokenType.Decimal,
      value: 0.123
    }
  ]);

  xpath(t, `123.`, [
    {
      type: TokenType.Decimal,
      value: 123
    }
  ]);
});

test("Can lex a double", t => {
  xpath(t, `1e2`, [
    {
      type: TokenType.Double,
      value: 100
    }
  ]);

  xpath(t, `1e+2`, [
    {
      type: TokenType.Double,
      value: 100
    }
  ]);

  xpath(t, `1e-2`, [
    {
      type: TokenType.Double,
      value: 0.01
    }
  ]);

  xpath(t, `1.23e2`, [
    {
      type: TokenType.Double,
      value: 123
    }
  ]);

  xpath(t, `.123e3`, [
    {
      type: TokenType.Double,
      value: 123
    }
  ]);

  xpath(t, `123.e1`, [
    {
      type: TokenType.Double,
      value: 1230
    }
  ]);
});

test("Can lex a string", t => {
  xpath(t, `"foo"`, [
    {
      type: TokenType.String,
      value: "foo"
    }
  ]);

  xpath(t, `'foo'`, [
    {
      type: TokenType.String,
      value: "foo"
    }
  ]);

  xpath(t, `""`, [
    {
      type: TokenType.String,
      value: ""
    }
  ]);

  xpath(t, `''`, [
    {
      type: TokenType.String,
      value: ""
    }
  ]);

  xpath(t, `""""`, [
    {
      type: TokenType.String,
      value: `"`
    }
  ]);

  xpath(t, `''''`, [
    {
      type: TokenType.String,
      value: "'"
    }
  ]);
});

test("Can lex a comment", t => {
  xpath(t, `(:foo:)`, [
    {
      type: TokenType.Comment,
      value: "foo"
    }
  ]);

  xpath(t, `(:foo`, [
    {
      type: TokenType.Comment,
      value: "foo"
    }
  ]);

  xpath(t, `(:(:foo:):)`, [
    {
      type: TokenType.Comment,
      value: "(:foo:)"
    }
  ]);
});

test("Can lex a name", t => {
  xpath(t, `foo`, [
    {
      type: TokenType.Name,
      value: "foo"
    }
  ]);

  xpath(t, `foo:bar`, [
    {
      type: TokenType.Name,
      prefix: "foo",
      value: "bar"
    }
  ]);
});

test("Can lex a character", t => {
  xpath(t, `-`, [
    {
      type: TokenType.Character,
      value: char("-")
    }
  ]);

  xpath(t, `+`, [
    {
      type: TokenType.Character,
      value: char("+")
    }
  ]);

  xpath(t, ` `, [
    {
      type: TokenType.Character,
      value: char(" ")
    }
  ]);
});

test("Can lex an axis expression", t => {
  xpath(t, `self::foo`, [
    {
      type: TokenType.Name,
      value: "self"
    },
    {
      type: TokenType.Character,
      value: char(":")
    },
    {
      type: TokenType.Character,
      value: char(":")
    },
    {
      type: TokenType.Name,
      value: "foo"
    }
  ]);
});
