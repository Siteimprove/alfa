import { test, Test } from "@alfa/test";
import { WithLocation, lex } from "@alfa/lang";
import { Alphabet, Token } from "../src/alphabet";

function html(t: Test, input: string, expected: Array<WithLocation<Token>>) {
  t.deepEqual(lex(input, Alphabet), expected, t.title);
}

test("Can lex a start tag", async t =>
  html(t, "<span>", [
    {
      type: "start-tag",
      value: "span",
      closed: false,
      attributes: [],
      location: {
        start: { line: 0, column: 0 },
        end: { line: 0, column: 6 }
      }
    }
  ]));

test("Can lex a start tag with a missing closing brace", async t =>
  html(t, "<span", []));

test("Can lex a self-closing start tag", async t =>
  html(t, "<span/>", [
    {
      type: "start-tag",
      value: "span",
      closed: true,
      attributes: [],
      location: {
        start: { line: 0, column: 0 },
        end: { line: 0, column: 7 }
      }
    }
  ]));

test("Can lex an orphaned less-than sign", async t =>
  html(t, "<", [
    {
      type: "character",
      value: "<",
      location: {
        start: { line: 0, column: 0 },
        end: { line: 0, column: 1 }
      }
    }
  ]));

test("Can lex an end tag", async t =>
  html(t, "</span>", [
    {
      type: "end-tag",
      value: "span",
      location: {
        start: { line: 0, column: 0 },
        end: { line: 0, column: 7 }
      }
    }
  ]));

test("Can lex a start tag followed by an end tag", async t =>
  html(t, "<span></span>", [
    {
      type: "start-tag",
      value: "span",
      closed: false,
      attributes: [],
      location: {
        start: { line: 0, column: 0 },
        end: { line: 0, column: 6 }
      }
    },
    {
      type: "end-tag",
      value: "span",
      location: {
        start: { line: 0, column: 6 },
        end: { line: 0, column: 13 }
      }
    }
  ]));

test("Can lex a start tag with a double-quoted attribute", async t =>
  html(t, '<span foo="bar">', [
    {
      type: "start-tag",
      value: "span",
      closed: false,
      attributes: [{ name: "foo", value: "bar" }],
      location: {
        start: { line: 0, column: 0 },
        end: { line: 0, column: 16 }
      }
    }
  ]));

test("Can lex a start tag with a single-quoted attribute", async t =>
  html(t, "<span foo='bar'>", [
    {
      type: "start-tag",
      value: "span",
      closed: false,
      attributes: [{ name: "foo", value: "bar" }],
      location: {
        start: { line: 0, column: 0 },
        end: { line: 0, column: 16 }
      }
    }
  ]));

test("Can lex a start tag with an unquoted attribute", async t =>
  html(t, "<span foo=bar>", [
    {
      type: "start-tag",
      value: "span",
      closed: false,
      attributes: [{ name: "foo", value: "bar" }],
      location: {
        start: { line: 0, column: 0 },
        end: { line: 0, column: 14 }
      }
    }
  ]));

test("Can lex a start tag with multiple attributes", async t =>
  html(t, '<span foo="bar" baz="qux">', [
    {
      type: "start-tag",
      value: "span",
      closed: false,
      attributes: [
        { name: "foo", value: "bar" },
        { name: "baz", value: "qux" }
      ],
      location: {
        start: { line: 0, column: 0 },
        end: { line: 0, column: 26 }
      }
    }
  ]));

test("Can lex a start tag with a boolean attribute", async t =>
  html(t, "<span foo>", [
    {
      type: "start-tag",
      value: "span",
      closed: false,
      attributes: [{ name: "foo", value: "" }],
      location: {
        start: { line: 0, column: 0 },
        end: { line: 0, column: 10 }
      }
    }
  ]));

test("Can lex an incorrectly closed end tag", async t =>
  html(t, "</ ", [
    {
      type: "comment",
      value: " ",
      location: {
        start: { line: 0, column: 0 },
        end: { line: 0, column: 3 }
      }
    }
  ]));

test("Can lex character data within a tag", async t =>
  html(t, "<p>Hi</p>", [
    {
      type: "start-tag",
      value: "p",
      closed: false,
      attributes: [],
      location: {
        start: { line: 0, column: 0 },
        end: { line: 0, column: 3 }
      }
    },
    {
      type: "character",
      value: "H",
      location: {
        start: { line: 0, column: 3 },
        end: { line: 0, column: 4 }
      }
    },
    {
      type: "character",
      value: "i",
      location: {
        start: { line: 0, column: 4 },
        end: { line: 0, column: 5 }
      }
    },
    {
      type: "end-tag",
      value: "p",
      location: {
        start: { line: 0, column: 5 },
        end: { line: 0, column: 9 }
      }
    }
  ]));

test("Can lex a comment", async t =>
  html(t, "<!--foo-->", [
    {
      type: "comment",
      value: "foo",
      location: {
        start: { line: 0, column: 0 },
        end: { line: 0, column: 10 }
      }
    }
  ]));
