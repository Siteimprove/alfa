import { test, Test } from "@alfa/test";
import { WithLocation } from "@alfa/lang";
import { CssToken, lex } from "../src/lexer";

function css(t: Test, input: string, expected: Array<WithLocation<CssToken>>) {
  t.deepEqual(lex(input), expected, t.title);
}

test("Can lex whitespace", async t =>
  css(t, "  \n \t", [
    {
      type: "whitespace",
      location: {
        start: { line: 0, column: 0 },
        end: { line: 1, column: 2 }
      }
    }
  ]));

test("Can lex a comma", async t =>
  css(t, ",", [
    {
      type: ",",
      location: {
        start: { line: 0, column: 0 },
        end: { line: 0, column: 1 }
      }
    }
  ]));

test("Can lex a colon", async t =>
  css(t, ":", [
    {
      type: ":",
      location: {
        start: { line: 0, column: 0 },
        end: { line: 0, column: 1 }
      }
    }
  ]));

test("Can lex a semicolon", async t =>
  css(t, ";", [
    {
      type: ";",
      location: {
        start: { line: 0, column: 0 },
        end: { line: 0, column: 1 }
      }
    }
  ]));

test("Can lex a comment", async t =>
  css(t, "/*Hello world*/", [
    {
      type: "comment",
      value: "Hello world",
      location: {
        start: { line: 0, column: 0 },
        end: { line: 0, column: 15 }
      }
    }
  ]));

test("Can lex an ident", async t =>
  css(t, "foo", [
    {
      type: "ident",
      value: "foo",
      location: {
        start: { line: 0, column: 0 },
        end: { line: 0, column: 3 }
      }
    }
  ]));

test("Can lex an ident prefixed with a single hyphen", async t =>
  css(t, "-foo", [
    {
      type: "ident",
      value: "-foo",
      location: {
        start: { line: 0, column: 0 },
        end: { line: 0, column: 4 }
      }
    }
  ]));

test("Can lex an ident containing an underscore", async t =>
  css(t, "foo_bar", [
    {
      type: "ident",
      value: "foo_bar",
      location: {
        start: { line: 0, column: 0 },
        end: { line: 0, column: 7 }
      }
    }
  ]));

test("Can lex an ident containing a hyphen", async t =>
  css(t, "foo-bar", [
    {
      type: "ident",
      value: "foo-bar",
      location: {
        start: { line: 0, column: 0 },
        end: { line: 0, column: 7 }
      }
    }
  ]));

test("Can lex two idents separated by a comma", async t =>
  css(t, "foo,bar", [
    {
      type: "ident",
      value: "foo",
      location: {
        start: { line: 0, column: 0 },
        end: { line: 0, column: 3 }
      }
    },
    {
      type: ",",
      location: {
        start: { line: 0, column: 3 },
        end: { line: 0, column: 4 }
      }
    },
    {
      type: "ident",
      value: "bar",
      location: {
        start: { line: 0, column: 4 },
        end: { line: 0, column: 7 }
      }
    }
  ]));

test("Can lex a double quoted string", async t =>
  css(t, '"foo"', [
    {
      type: "string",
      value: "foo",
      location: {
        start: { line: 0, column: 0 },
        end: { line: 0, column: 5 }
      }
    }
  ]));

test("Can lex a single quoted string", async t =>
  css(t, "'foo'", [
    {
      type: "string",
      value: "foo",
      location: {
        start: { line: 0, column: 0 },
        end: { line: 0, column: 5 }
      }
    }
  ]));

test("Can lex an integer", async t =>
  css(t, "123", [
    {
      type: "number",
      value: 123,
      location: {
        start: { line: 0, column: 0 },
        end: { line: 0, column: 3 }
      }
    }
  ]));

test("Can lex a decimal", async t =>
  css(t, "123.456", [
    {
      type: "number",
      value: 123.456,
      location: {
        start: { line: 0, column: 0 },
        end: { line: 0, column: 7 }
      }
    }
  ]));

test("Can lex a number in E-notation", async t =>
  css(t, "123.456e2", [
    {
      type: "number",
      value: 123.456e2,
      location: {
        start: { line: 0, column: 0 },
        end: { line: 0, column: 9 }
      }
    }
  ]));

test("Can lex a dimension", async t =>
  css(t, "123px", [
    {
      type: "dimension",
      value: 123,
      unit: "px",
      location: {
        start: { line: 0, column: 0 },
        end: { line: 0, column: 5 }
      }
    }
  ]));

test("Can lex a percentage", async t =>
  css(t, "123%", [
    {
      type: "percentage",
      value: 1.23,
      location: {
        start: { line: 0, column: 0 },
        end: { line: 0, column: 4 }
      }
    }
  ]));

test("Can lex a function with no arguments", async t =>
  css(t, "rgb()", [
    {
      type: "function-name",
      value: "rgb",
      location: {
        start: { line: 0, column: 0 },
        end: { line: 0, column: 4 }
      }
    },
    {
      type: ")",
      location: {
        start: { line: 0, column: 4 },
        end: { line: 0, column: 5 }
      }
    }
  ]));

test("Can lex a function with a single argument", async t =>
  css(t, "rgb(123)", [
    {
      type: "function-name",
      value: "rgb",
      location: {
        start: { line: 0, column: 0 },
        end: { line: 0, column: 4 }
      }
    },
    {
      type: "number",
      value: 123,
      location: {
        start: { line: 0, column: 4 },
        end: { line: 0, column: 7 }
      }
    },
    {
      type: ")",
      location: {
        start: { line: 0, column: 7 },
        end: { line: 0, column: 8 }
      }
    }
  ]));
