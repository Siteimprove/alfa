import { test, Assertions } from "@siteimprove/alfa-test";
import { lex } from "@siteimprove/alfa-lang";
import { Alphabet, Token, TokenType } from "../src/alphabet";

function html(t: Assertions, input: string, expected: Array<Token>) {
  t.deepEqual(lex(input, Alphabet), expected, input);
}

test("Can lex a start tag", t =>
  html(t, "<span>", [
    {
      type: TokenType.StartTag,
      value: "span",
      closed: false,
      attributes: []
    }
  ]));

test("Can lex a start tag with a missing closing brace", t =>
  html(t, "<span", []));

test("Can lex a self-closing start tag", t =>
  html(t, "<span/>", [
    {
      type: TokenType.StartTag,
      value: "span",
      closed: true,
      attributes: []
    }
  ]));

test("Can lex an orphaned less-than sign", t =>
  html(t, "<", [
    {
      type: TokenType.Character,
      value: "<"
    }
  ]));

test("Can lex an end tag", t =>
  html(t, "</span>", [
    {
      type: TokenType.EndTag,
      value: "span"
    }
  ]));

test("Can lex a start tag followed by an end tag", t =>
  html(t, "<span></span>", [
    {
      type: TokenType.StartTag,
      value: "span",
      closed: false,
      attributes: []
    },
    {
      type: TokenType.EndTag,
      value: "span"
    }
  ]));

test("Can lex a start tag with a double-quoted attribute", t =>
  html(t, '<span foo="bar">', [
    {
      type: TokenType.StartTag,
      value: "span",
      closed: false,
      attributes: [{ name: "foo", value: "bar" }]
    }
  ]));

test("Can lex a start tag with a single-quoted attribute", t =>
  html(t, "<span foo='bar'>", [
    {
      type: TokenType.StartTag,
      value: "span",
      closed: false,
      attributes: [{ name: "foo", value: "bar" }]
    }
  ]));

test("Can lex a start tag with an unquoted attribute", t =>
  html(t, "<span foo=bar>", [
    {
      type: TokenType.StartTag,
      value: "span",
      closed: false,
      attributes: [{ name: "foo", value: "bar" }]
    }
  ]));

test("Can lex a start tag with multiple attributes", t =>
  html(t, '<span foo="bar" baz="qux">', [
    {
      type: TokenType.StartTag,
      value: "span",
      closed: false,
      attributes: [{ name: "foo", value: "bar" }, { name: "baz", value: "qux" }]
    }
  ]));

test("Can lex a start tag with a boolean attribute", t =>
  html(t, "<span foo>", [
    {
      type: TokenType.StartTag,
      value: "span",
      closed: false,
      attributes: [{ name: "foo", value: "" }]
    }
  ]));

test("Can lex an incorrectly closed end tag", t =>
  html(t, "</ ", [
    {
      type: TokenType.Comment,
      value: " "
    }
  ]));

test("Can lex character data within a tag", t =>
  html(t, "<p>Hi</p>", [
    {
      type: TokenType.StartTag,
      value: "p",
      closed: false,
      attributes: []
    },
    {
      type: TokenType.Character,
      value: "H"
    },
    {
      type: TokenType.Character,
      value: "i"
    },
    {
      type: TokenType.EndTag,
      value: "p"
    }
  ]));

test("Can lex a comment", t =>
  html(t, "<!--foo-->", [
    {
      type: TokenType.Comment,
      value: "foo"
    }
  ]));

test("Can lex a named character reference", t =>
  html(t, "&lt;&gt;", [
    {
      type: TokenType.Character,
      value: "<"
    },
    {
      type: TokenType.Character,
      value: ">"
    }
  ]));
