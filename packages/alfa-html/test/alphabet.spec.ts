import { lex } from "@siteimprove/alfa-lang";
import { Assertions, test } from "@siteimprove/alfa-test";
import { Alphabet, Token, TokenType } from "../src/alphabet";

function html(t: Assertions, input: string, expected: Array<Token>) {
  t.deepEqual(lex(input, Alphabet), expected, input);
}

test("Can lex a start tag", t => {
  html(t, "<span>", [
    {
      type: TokenType.StartTag,
      name: "span",
      selfClosing: false,
      attributes: []
    }
  ]);
});

test("Can lex a start tag with a missing closing brace", t => {
  html(t, "<span", []);
});

test("Can lex a self-closing start tag", t => {
  html(t, "<span/>", [
    {
      type: TokenType.StartTag,
      name: "span",
      selfClosing: true,
      attributes: []
    }
  ]);
});

test("Can lex an orphaned less-than sign", t => {
  html(t, "<", [
    {
      type: TokenType.Character,
      data: "<"
    }
  ]);
});

test("Can lex an end tag", t => {
  html(t, "</span>", [
    {
      type: TokenType.EndTag,
      name: "span"
    }
  ]);
});

test("Can lex a start tag followed by an end tag", t => {
  html(t, "<span></span>", [
    {
      type: TokenType.StartTag,
      name: "span",
      selfClosing: false,
      attributes: []
    },
    {
      type: TokenType.EndTag,
      name: "span"
    }
  ]);
});

test("Can lex a start tag with a double-quoted attribute", t => {
  html(t, '<span foo="bar">', [
    {
      type: TokenType.StartTag,
      name: "span",
      selfClosing: false,
      attributes: [{ name: "foo", value: "bar" }]
    }
  ]);
});

test("Can lex a start tag with a single-quoted attribute", t => {
  html(t, "<span foo='bar'>", [
    {
      type: TokenType.StartTag,
      name: "span",
      selfClosing: false,
      attributes: [{ name: "foo", value: "bar" }]
    }
  ]);
});

test("Can lex a start tag with an unquoted attribute", t => {
  html(t, "<span foo=bar>", [
    {
      type: TokenType.StartTag,
      name: "span",
      selfClosing: false,
      attributes: [{ name: "foo", value: "bar" }]
    }
  ]);
});

test("Can lex a start tag with multiple attributes", t => {
  html(t, '<span foo="bar" baz="qux">', [
    {
      type: TokenType.StartTag,
      name: "span",
      selfClosing: false,
      attributes: [{ name: "foo", value: "bar" }, { name: "baz", value: "qux" }]
    }
  ]);
});

test("Can lex a start tag with a boolean attribute", t => {
  html(t, "<span foo>", [
    {
      type: TokenType.StartTag,
      name: "span",
      selfClosing: false,
      attributes: [{ name: "foo", value: "" }]
    }
  ]);
});

test("Can lex an incorrectly selfClosing end tag", t => {
  html(t, "</ ", [
    {
      type: TokenType.Comment,
      data: " "
    }
  ]);
});

test("Can lex character data within a tag", t => {
  html(t, "<p>Hi</p>", [
    {
      type: TokenType.StartTag,
      name: "p",
      selfClosing: false,
      attributes: []
    },
    {
      type: TokenType.Character,
      data: "H"
    },
    {
      type: TokenType.Character,
      data: "i"
    },
    {
      type: TokenType.EndTag,
      name: "p"
    }
  ]);
});

test("Can lex a comment", t => {
  html(t, "<!--foo-->", [
    {
      type: TokenType.Comment,
      data: "foo"
    }
  ]);
});

test("Can lex a named character reference", t => {
  html(t, "&lt;&gt;", [
    {
      type: TokenType.Character,
      data: "<"
    },
    {
      type: TokenType.Character,
      data: ">"
    }
  ]);
});

test("Can lex a simple doctype", t => {
  html(t, "<!doctype html>", [
    {
      type: TokenType.Doctype,
      name: "html",
      publicId: null,
      systemId: null,
      forceQuirks: false
    }
  ]);
});

test("Can lex a doctype with a public ID", t => {
  html(t, '<!doctype html PUBLIC "foo">', [
    {
      type: TokenType.Doctype,
      name: "html",
      publicId: "foo",
      systemId: null,
      forceQuirks: false
    }
  ]);
});

test("Can lex a doctype with a system ID", t => {
  html(t, '<!doctype html SYSTEM "foo">', [
    {
      type: TokenType.Doctype,
      name: "html",
      publicId: null,
      systemId: "foo",
      forceQuirks: false
    }
  ]);
});
