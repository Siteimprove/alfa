import { test, Test } from "@alfa/test";
import { WithLocation } from "@alfa/lang";
import { CssToken, lex } from "../src/lexer";

async function css(
  t: Test,
  input: string,
  expected: Array<WithLocation<CssToken>>
) {
  t.deepEqual(lex(input), expected);
}

test("Can lex whitespace", async t =>
  css(t, "  \n", [{ type: "whitespace", line: 0, column: 0 }]));

test("Can lex a comment", async t =>
  css(t, "/*Hello world*/", [
    { type: "comment", value: "Hello world", line: 0, column: 0 }
  ]));

test("Can lex an ident", async t =>
  css(t, "foo", [{ type: "ident", value: "foo", line: 0, column: 0 }]));

test("Can lex an ident prefixed with a single hyphen", async t =>
  css(t, "-foo", [{ type: "ident", value: "-foo", line: 0, column: 0 }]));

test("Can lex an ident prefixed with a double hyphen", async t =>
  css(t, "--foo", [{ type: "ident", value: "--foo", line: 0, column: 0 }]));

test("Can lex an ident containing an underscore", async t =>
  css(t, "foo_bar", [{ type: "ident", value: "foo_bar", line: 0, column: 0 }]));

test("Can lex an ident containing a hyphen", async t =>
  css(t, "foo-bar", [{ type: "ident", value: "foo-bar", line: 0, column: 0 }]));

test("Can lex a double quoted string", async t =>
  css(t, '"foo"', [{ type: "string", value: "foo", line: 0, column: 0 }]));

test("Can lex a single quoted string", async t =>
  css(t, "'foo'", [{ type: "string", value: "foo", line: 0, column: 0 }]));

test("Can lex an integer", async t =>
  css(t, "123", [{ type: "number", value: 123, line: 0, column: 0 }]));

test("Can lex a decimal", async t =>
  css(t, "123.456", [{ type: "number", value: 123.456, line: 0, column: 0 }]));

test("Can lex a number in E-notation", async t =>
  css(t, "123.456e2", [
    { type: "number", value: 123.456e2, line: 0, column: 0 }
  ]));

test("Can lex a rule declaration", async t =>
  css(t, "#foo{background:none}", [
    { type: "delim", value: "#", line: 0, column: 0 },
    { type: "ident", value: "foo", line: 0, column: 1 },
    { type: "{", line: 0, column: 4 },
    { type: "ident", value: "background", line: 0, column: 5 },
    { type: ":", line: 0, column: 15 },
    { type: "ident", value: "none", line: 0, column: 16 },
    { type: "}", line: 0, column: 20 }
  ]));
