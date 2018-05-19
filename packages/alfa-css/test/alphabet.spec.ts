import { test, Test } from "@siteimprove/alfa-test";
import { lex } from "@siteimprove/alfa-lang";
import { Alphabet, Token } from "../src/alphabet";

function css(t: Test, input: string, expected: Array<Token>) {
  t.deepEqual(lex(input, Alphabet), expected, t.title);
}

test("Can lex whitespace", t =>
  css(t, "  \n \t", [
    {
      type: "whitespace"
    }
  ]));

test("Can lex a comma", t =>
  css(t, ",", [
    {
      type: ","
    }
  ]));

test("Can lex a colon", t =>
  css(t, ":", [
    {
      type: ":"
    }
  ]));

test("Can lex a semicolon", t =>
  css(t, ";", [
    {
      type: ";"
    }
  ]));

test("Can lex a comment", t =>
  css(t, "/*Hello world*/", [
    {
      type: "comment",
      value: "Hello world"
    }
  ]));

test("Can lex an ident", t =>
  css(t, "foo", [
    {
      type: "ident",
      value: "foo"
    }
  ]));

test("Can lex an ident prefixed with a single hyphen", t =>
  css(t, "-foo", [
    {
      type: "ident",
      value: "-foo"
    }
  ]));

test("Can lex an ident containing an underscore", t =>
  css(t, "foo_bar", [
    {
      type: "ident",
      value: "foo_bar"
    }
  ]));

test("Can lex an ident containing a hyphen", t =>
  css(t, "foo-bar", [
    {
      type: "ident",
      value: "foo-bar"
    }
  ]));

test("Can lex two idents separated by a comma", t =>
  css(t, "foo,bar", [
    {
      type: "ident",
      value: "foo"
    },
    {
      type: ","
    },
    {
      type: "ident",
      value: "bar"
    }
  ]));

test("Can lex a double quoted string", t =>
  css(t, '"foo"', [
    {
      type: "string",
      value: "foo"
    }
  ]));

test("Can lex a single quoted string", t =>
  css(t, "'foo'", [
    {
      type: "string",
      value: "foo"
    }
  ]));

test("Can lex an integer", t =>
  css(t, "123", [
    {
      type: "number",
      value: 123,
      integer: true
    }
  ]));

test("Can lex a decimal", t =>
  css(t, "123.456", [
    {
      type: "number",
      value: 123.456,
      integer: false
    }
  ]));

test("Can lex a number in E-notation", t =>
  css(t, "123.456e2", [
    {
      type: "number",
      value: 123.456e2,
      integer: false
    }
  ]));

test("Can lex a dimension", t =>
  css(t, "123px", [
    {
      type: "dimension",
      value: 123,
      integer: true,
      unit: "px"
    }
  ]));

test("Can lex a percentage", t =>
  css(t, "123%", [
    {
      type: "percentage",
      value: 1.23,
      integer: true
    }
  ]));

test("Can lex a function with no arguments", t =>
  css(t, "rgb()", [
    {
      type: "function-name",
      value: "rgb"
    },
    {
      type: ")"
    }
  ]));

test("Can lex a function with a single argument", t =>
  css(t, "rgb(123)", [
    {
      type: "function-name",
      value: "rgb"
    },
    {
      type: "number",
      value: 123,
      integer: true
    },
    {
      type: ")"
    }
  ]));

test("Can lex an ID selector", t =>
  css(t, "#foo", [
    {
      type: "delim",
      value: "#"
    },
    {
      type: "ident",
      value: "foo"
    }
  ]));

test("Can lex a class selector", t =>
  css(t, ".foo", [
    {
      type: "delim",
      value: "."
    },
    {
      type: "ident",
      value: "foo"
    }
  ]));

test("Can lex a type selector with a namespace", t =>
  css(t, "svg|div", [
    {
      type: "ident",
      value: "svg"
    },
    {
      type: "delim",
      value: "|"
    },
    {
      type: "ident",
      value: "div"
    }
  ]));

test("Can lex a declaration", t =>
  css(t, "color:red", [
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
  ]));

test("Can lex an+b values", t =>
  css(t, "2n+4", [
    {
      type: "dimension",
      value: 2,
      integer: true,
      unit: "n"
    },
    {
      type: "number",
      value: 4,
      integer: true
    }
  ]));

test("Can lex an escaped character", t =>
  css(t, "\\/", [
    {
      type: "ident",
      value: "/"
    }
  ]));

test("Can lex an escaped unicode point", t =>
  css(t, "\\002d", [
    {
      type: "ident",
      value: "\u002d"
    }
  ]));
