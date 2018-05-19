import { test, Test } from "@siteimprove/alfa-test";
import { lex } from "@siteimprove/alfa-lang";
import { Alphabet, Token } from "../src/alphabet";

function html(t: Test, input: string, expected: Array<Token>) {
  t.deepEqual(lex(input, Alphabet), expected, t.title);
}

test("Can lex a start tag", t =>
  html(t, "<span>", [
    {
      type: "start-tag",
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
      type: "start-tag",
      value: "span",
      closed: true,
      attributes: []
    }
  ]));

test("Can lex an orphaned less-than sign", t =>
  html(t, "<", [
    {
      type: "character",
      value: "<"
    }
  ]));

test("Can lex an end tag", t =>
  html(t, "</span>", [
    {
      type: "end-tag",
      value: "span"
    }
  ]));

test("Can lex a start tag followed by an end tag", t =>
  html(t, "<span></span>", [
    {
      type: "start-tag",
      value: "span",
      closed: false,
      attributes: []
    },
    {
      type: "end-tag",
      value: "span"
    }
  ]));

test("Can lex a start tag with a double-quoted attribute", t =>
  html(t, '<span foo="bar">', [
    {
      type: "start-tag",
      value: "span",
      closed: false,
      attributes: [{ name: "foo", value: "bar" }]
    }
  ]));

test("Can lex a start tag with a single-quoted attribute", t =>
  html(t, "<span foo='bar'>", [
    {
      type: "start-tag",
      value: "span",
      closed: false,
      attributes: [{ name: "foo", value: "bar" }]
    }
  ]));

test("Can lex a start tag with an unquoted attribute", t =>
  html(t, "<span foo=bar>", [
    {
      type: "start-tag",
      value: "span",
      closed: false,
      attributes: [{ name: "foo", value: "bar" }]
    }
  ]));

test("Can lex a start tag with multiple attributes", t =>
  html(t, '<span foo="bar" baz="qux">', [
    {
      type: "start-tag",
      value: "span",
      closed: false,
      attributes: [{ name: "foo", value: "bar" }, { name: "baz", value: "qux" }]
    }
  ]));

test("Can lex a start tag with a boolean attribute", t =>
  html(t, "<span foo>", [
    {
      type: "start-tag",
      value: "span",
      closed: false,
      attributes: [{ name: "foo", value: "" }]
    }
  ]));

test("Can lex an incorrectly closed end tag", t =>
  html(t, "</ ", [
    {
      type: "comment",
      value: " "
    }
  ]));

test("Can lex character data within a tag", t =>
  html(t, "<p>Hi</p>", [
    {
      type: "start-tag",
      value: "p",
      closed: false,
      attributes: []
    },
    {
      type: "character",
      value: "H"
    },
    {
      type: "character",
      value: "i"
    },
    {
      type: "end-tag",
      value: "p"
    }
  ]));

test("Can lex a comment", t =>
  html(t, "<!--foo-->", [
    {
      type: "comment",
      value: "foo"
    }
  ]));
