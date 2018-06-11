import { test, Assertions } from "@siteimprove/alfa-test";
import { lex, Char } from "@siteimprove/alfa-lang";
import { Alphabet, Token, TokenType } from "../src/alphabet";

function css(t: Assertions, input: string, expected: Array<Token>) {
  t.deepEqual(lex(input, Alphabet), expected, input);
}

test("Can lex whitespace", t =>
  css(t, "  \n \t", [
    {
      type: TokenType.Whitespace
    }
  ]));

test("Can lex a comma", t =>
  css(t, ",", [
    {
      type: TokenType.Comma
    }
  ]));

test("Can lex a colon", t =>
  css(t, ":", [
    {
      type: TokenType.Colon
    }
  ]));

test("Can lex a semicolon", t =>
  css(t, ";", [
    {
      type: TokenType.Semicolon
    }
  ]));

test("Can lex a comment", t => css(t, "/*Hello world*/", []));

test("Can lex a comment followed by an ident", t =>
  css(t, "/*Hello world*/foo", [{ type: TokenType.Ident, value: "foo" }]));

test("Can lex an ident", t =>
  css(t, "foo", [
    {
      type: TokenType.Ident,
      value: "foo"
    }
  ]));

test("Can lex an ident prefixed with a single hyphen", t =>
  css(t, "-foo", [
    {
      type: TokenType.Ident,
      value: "-foo"
    }
  ]));

test("Can lex an ident containing an underscore", t =>
  css(t, "foo_bar", [
    {
      type: TokenType.Ident,
      value: "foo_bar"
    }
  ]));

test("Can lex an ident containing a hyphen", t =>
  css(t, "foo-bar", [
    {
      type: TokenType.Ident,
      value: "foo-bar"
    }
  ]));

test("Can lex two idents separated by a comma", t =>
  css(t, "foo,bar", [
    {
      type: TokenType.Ident,
      value: "foo"
    },
    {
      type: TokenType.Comma
    },
    {
      type: TokenType.Ident,
      value: "bar"
    }
  ]));

test("Can lex a double quoted string", t =>
  css(t, '"foo"', [
    {
      type: TokenType.String,
      value: "foo",
      mark: Char.QuotationMark
    }
  ]));

test("Can lex a single quoted string", t =>
  css(t, "'foo'", [
    {
      type: TokenType.String,
      value: "foo",
      mark: Char.Apostrophe
    }
  ]));

test("Can lex an integer", t =>
  css(t, "123", [
    {
      type: TokenType.Number,
      value: 123,
      integer: true
    }
  ]));

test("Can lex a negative integer", t =>
  css(t, "-123", [
    {
      type: TokenType.Number,
      value: -123,
      integer: true
    }
  ]));

test("Can lex a decimal", t =>
  css(t, "123.456", [
    {
      type: TokenType.Number,
      value: 123.456,
      integer: false
    }
  ]));

test("Can lex a negative decimal", t =>
  css(t, "-123.456", [
    {
      type: TokenType.Number,
      value: -123.456,
      integer: false
    }
  ]));

test("Can lex a decimal in E-notation", t =>
  css(t, "123.456e2", [
    {
      type: TokenType.Number,
      value: 123.456e2,
      integer: false
    }
  ]));

test("Can lex a negative decimal in E-notation", t =>
  css(t, "-123.456e2", [
    {
      type: TokenType.Number,
      value: -123.456e2,
      integer: false
    }
  ]));

test("Can lex a dimension", t =>
  css(t, "123px", [
    {
      type: TokenType.Dimension,
      value: 123,
      integer: true,
      unit: "px"
    }
  ]));

test("Can lex a percentage", t =>
  css(t, "123%", [
    {
      type: TokenType.Percentage,
      value: 1.23,
      integer: true
    }
  ]));

test("Can lex a function with no arguments", t =>
  css(t, "rgb()", [
    {
      type: TokenType.FunctionName,
      value: "rgb"
    },
    {
      type: TokenType.RightParenthesis
    }
  ]));

test("Can lex a function with a single argument", t =>
  css(t, "rgb(123)", [
    {
      type: TokenType.FunctionName,
      value: "rgb"
    },
    {
      type: TokenType.Number,
      value: 123,
      integer: true
    },
    {
      type: TokenType.RightParenthesis
    }
  ]));

test("Can lex an ID selector", t =>
  css(t, "#foo", [
    {
      type: TokenType.Delim,
      value: Char.NumberSign
    },
    {
      type: TokenType.Ident,
      value: "foo"
    }
  ]));

test("Can lex a class selector", t =>
  css(t, ".foo", [
    {
      type: TokenType.Delim,
      value: Char.FullStop
    },
    {
      type: TokenType.Ident,
      value: "foo"
    }
  ]));

test("Can lex a type selector with a namespace", t =>
  css(t, "svg|div", [
    {
      type: TokenType.Ident,
      value: "svg"
    },
    {
      type: TokenType.Delim,
      value: Char.VerticalLine
    },
    {
      type: TokenType.Ident,
      value: "div"
    }
  ]));

test("Can lex a declaration", t =>
  css(t, "color:red", [
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
  ]));

test("Can lex an+b values", t =>
  css(t, "2n+4", [
    {
      type: TokenType.Dimension,
      value: 2,
      integer: true,
      unit: "n"
    },
    {
      type: TokenType.Number,
      value: 4,
      integer: true
    }
  ]));

test("Can lex an escaped character", t =>
  css(t, "\\/", [
    {
      type: TokenType.Ident,
      value: "/"
    }
  ]));

test("Can lex an escaped unicode point", t =>
  css(t, "\\002d", [
    {
      type: TokenType.Ident,
      value: "\u002d"
    }
  ]));

test("Can lex an @-keyword", t =>
  css(t, "@page", [
    {
      type: TokenType.AtKeyword,
      value: "page"
    }
  ]));
