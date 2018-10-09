import { lex } from "@siteimprove/alfa-lang";
import { Assertions, test } from "@siteimprove/alfa-test";
import { Alphabet, Token, TokenType } from "../src/alphabet";

function html(t: Assertions, input: string, expected: Array<Token>) {
  t.deepEqual(lex(input, Alphabet).result, expected, input);
}

function char(input: string): number {
  return input.charCodeAt(0);
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
      data: char("<")
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

test("Discards duplicate attributes from start tags", t => {
  html(t, '<span foo="foo" foo="bar">', [
    {
      type: TokenType.StartTag,
      name: "span",
      selfClosing: false,
      attributes: [{ name: "foo", value: "foo" }]
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
      data: char("H")
    },
    {
      type: TokenType.Character,
      data: char("i")
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
test("Can lex a comment", t => {
  html(t, "<!--<-->", [
    {
      type: TokenType.Comment,
      data: "<"
    }
  ]);
});

test("Can lex a dashed and bang-ending comment", t => {
  html(t, "<!-----!>", [
    {
      type: TokenType.Comment,
      data: "-"
    }
  ]);
});

test("Can lex a hexadecimal character reference", t => {
  html(t, "&#x00bD;", [
    {
      type: TokenType.Character,
      data: char("½")
    }
  ]);
});

test("Can lex a named character reference", t => {
  html(t, "&lt;&gt;", [
    {
      type: TokenType.Character,
      data: char("<")
    },
    {
      type: TokenType.Character,
      data: char(">")
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

test("Cannot lex a doctype without name", t => {
  html(t, "<!doctype>", []);
});

test("Can lex a doctype with a bogus public ID (missing keyword)", t => {
  html(t, '<!doctype html "foo">', [
    {
      type: TokenType.Doctype,
      name: "html",
      publicId: null,
      systemId: null,
      forceQuirks: true
    }
  ]);
  html(t, "<!doctype html 'foo'>", [
    {
      type: TokenType.Doctype,
      name: "html",
      publicId: null,
      systemId: null,
      forceQuirks: true
    }
  ]);
});

test("Can lex a doctype with a bogus public ID (missing space)", t => {
  html(t, '<!doctype html PUBLIC"foo">', [
    {
      type: TokenType.Doctype,
      name: "html",
      publicId: "foo",
      systemId: null,
      forceQuirks: false
    }
  ]);
  html(t, "<!doctype html PUBLIC'foo'>", [
    {
      type: TokenType.Doctype,
      name: "html",
      publicId: "foo",
      systemId: null,
      forceQuirks: false
    }
  ]);
});

test("Can lex a doctype with a bogus system ID (missing space)", t => {
  html(t, '<!doctype html SYSTEM"foo">', [
    {
      type: TokenType.Doctype,
      name: "html",
      publicId: null,
      systemId: "foo",
      forceQuirks: false
    }
  ]);
  html(t, "<!doctype html SYSTEM'foo'>", [
    {
      type: TokenType.Doctype,
      name: "html",
      publicId: null,
      systemId: "foo",
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
  html(t, "<!doctype html PUBLIC 'foo'>", [
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
  html(t, "<!doctype html SYSTEM 'foo'>", [
    {
      type: TokenType.Doctype,
      name: "html",
      publicId: null,
      systemId: "foo",
      forceQuirks: false
    }
  ]);
});

test("Can lex a doctype with both a public ID and system ID", t => {
  html(t, '<!doctype html PUBLIC "foo" "bar">', [
    {
      type: TokenType.Doctype,
      name: "html",
      publicId: "foo",
      systemId: "bar",
      forceQuirks: false
    }
  ]);
  html(t, '<!doctype html PUBLIC "foo""bar">', [
    {
      type: TokenType.Doctype,
      name: "html",
      publicId: "foo",
      systemId: "bar",
      forceQuirks: false
    }
  ]);
});

test("Can lex CDATA outside of the HTML namespace", t => {
  html(t, "<svg><![CDATA[<p>]]]]></svg>", [
    {
      type: TokenType.StartTag,
      name: "svg",
      selfClosing: false,
      attributes: []
    },
    {
      type: TokenType.Character,
      data: char("<")
    },
    {
      type: TokenType.Character,
      data: char("p")
    },
    {
      type: TokenType.Character,
      data: char(">")
    },
    {
      type: TokenType.Character,
      data: char("]")
    },
    {
      type: TokenType.Character,
      data: char("]")
    },
    {
      type: TokenType.EndTag,
      name: "svg"
    }
  ]);
});

// Tests that the namespaceStack is working as expected
test("Can lex CDATA outside of the HTML namespace with multiple non-html tags", t => {
  html(t, "<svg><svg></svg><![CDATA[<p>]]]]></svg>", [
    {
      type: TokenType.StartTag,
      name: "svg",
      selfClosing: false,
      attributes: []
    },
    {
      type: TokenType.StartTag,
      name: "svg",
      selfClosing: false,
      attributes: []
    },
    {
      type: TokenType.EndTag,
      name: "svg"
    },
    {
      type: TokenType.Character,
      data: char("<")
    },
    {
      type: TokenType.Character,
      data: char("p")
    },
    {
      type: TokenType.Character,
      data: char(">")
    },
    {
      type: TokenType.Character,
      data: char("]")
    },
    {
      type: TokenType.Character,
      data: char("]")
    },
    {
      type: TokenType.EndTag,
      name: "svg"
    }
  ]);
});

test("Cannot lex CDATA inside of the HTML namespace (bogus comment)", t => {
  html(t, "<![CDATA[<p>]]]]>", [
    {
      type: TokenType.Comment,
      data: "[CDATA[<p"
    },
    {
      type: TokenType.Character,
      data: char("]")
    },
    {
      type: TokenType.Character,
      data: char("]")
    },
    {
      type: TokenType.Character,
      data: char("]")
    },
    {
      type: TokenType.Character,
      data: char("]")
    },
    {
      type: TokenType.Character,
      data: char(">")
    }
  ]);
});

test("Can lex a textarea element with an apparent tag", t => {
  html(t, "<textarea><tag></textarea>", [
    {
      type: TokenType.StartTag,
      name: "textarea",
      selfClosing: false,
      attributes: []
    },
    {
      type: TokenType.Character,
      data: char("<")
    },
    {
      type: TokenType.Character,
      data: char("t")
    },
    {
      type: TokenType.Character,
      data: char("a")
    },
    {
      type: TokenType.Character,
      data: char("g")
    },
    {
      type: TokenType.Character,
      data: char(">")
    },
    {
      type: TokenType.EndTag,
      name: "textarea"
    }
  ]);
});

test("Can lex a simple script element", t => {
  html(t, "<script></script>", [
    {
      type: TokenType.StartTag,
      name: "script",
      selfClosing: false,
      attributes: []
    },
    {
      type: TokenType.EndTag,
      name: "script"
    }
  ]);
});

test("Can lex a noscript element with an apparent tag", t => {
  html(t, "<noscript><tag></noscript>", [
    {
      type: TokenType.StartTag,
      name: "noscript",
      selfClosing: false,
      attributes: []
    },
    {
      type: TokenType.Character,
      data: char("<")
    },
    {
      type: TokenType.Character,
      data: char("t")
    },
    {
      type: TokenType.Character,
      data: char("a")
    },
    {
      type: TokenType.Character,
      data: char("g")
    },
    {
      type: TokenType.Character,
      data: char(">")
    },
    {
      type: TokenType.EndTag,
      name: "noscript"
    }
  ]);
});

test("Can lex a script element with an apparent tag", t => {
  html(t, "<script><tag></script>", [
    {
      type: TokenType.StartTag,
      name: "script",
      selfClosing: false,
      attributes: []
    },
    {
      type: TokenType.Character,
      data: char("<")
    },
    {
      type: TokenType.Character,
      data: char("t")
    },
    {
      type: TokenType.Character,
      data: char("a")
    },
    {
      type: TokenType.Character,
      data: char("g")
    },
    {
      type: TokenType.Character,
      data: char(">")
    },
    {
      type: TokenType.EndTag,
      name: "script"
    }
  ]);
});

test("Can lex a script element with an atribute", t => {
  html(t, "<script type='text/javascript'></script>", [
    {
      type: TokenType.StartTag,
      name: "script",
      selfClosing: false,
      attributes: [
        {
          name: "type",
          value: "text/javascript"
        }
      ]
    },
    {
      type: TokenType.EndTag,
      name: "script"
    }
  ]);
});

test("Can lex a self-closing script element", t => {
  html(t, "<script />", [
    {
      type: TokenType.StartTag,
      name: "script",
      selfClosing: true,
      attributes: []
    }
  ]);
});

test("Can lex a script element with a space in the end", t => {
  html(t, "<script></script >", [
    {
      type: TokenType.StartTag,
      name: "script",
      selfClosing: false,
      attributes: []
    },
    {
      type: TokenType.EndTag,
      name: "script"
    }
  ]);
});

test("Can lex a script element with an apparent comment", t => {
  html(t, "<script><!--<script>--</script>--></script>", [
    {
      type: TokenType.StartTag,
      name: "script",
      selfClosing: false,
      attributes: []
    },
    {
      type: TokenType.Character,
      data: char("<")
    },
    {
      type: TokenType.Character,
      data: char("!")
    },
    {
      type: TokenType.Character,
      data: char("-")
    },
    {
      type: TokenType.Character,
      data: char("-")
    },
    {
      type: TokenType.Character,
      data: char("<")
    },
    {
      type: TokenType.Character,
      data: char("s")
    },
    {
      type: TokenType.Character,
      data: char("c")
    },
    {
      type: TokenType.Character,
      data: char("r")
    },
    {
      type: TokenType.Character,
      data: char("i")
    },
    {
      type: TokenType.Character,
      data: char("p")
    },
    {
      type: TokenType.Character,
      data: char("t")
    },
    {
      type: TokenType.Character,
      data: char(">")
    },
    {
      type: TokenType.Character,
      data: char("-")
    },
    {
      type: TokenType.Character,
      data: char("-")
    },
    {
      type: TokenType.Character,
      data: char("<")
    },
    {
      type: TokenType.Character,
      data: char("/")
    },
    {
      type: TokenType.Character,
      data: char("s")
    },
    {
      type: TokenType.Character,
      data: char("c")
    },
    {
      type: TokenType.Character,
      data: char("r")
    },
    {
      type: TokenType.Character,
      data: char("i")
    },
    {
      type: TokenType.Character,
      data: char("p")
    },
    {
      type: TokenType.Character,
      data: char("t")
    },
    {
      type: TokenType.Character,
      data: char(">")
    },
    {
      type: TokenType.Character,
      data: char("-")
    },
    {
      type: TokenType.Character,
      data: char("-")
    },
    {
      type: TokenType.Character,
      data: char(">")
    },
    {
      type: TokenType.EndTag,
      name: "script"
    }
  ]);
});

test("Can lex a script element with an apparent comment ending early", t => {
  html(t, "<script><!--<script>--></script>", [
    {
      type: TokenType.StartTag,
      name: "script",
      selfClosing: false,
      attributes: []
    },
    {
      type: TokenType.Character,
      data: char("<")
    },
    {
      type: TokenType.Character,
      data: char("!")
    },
    {
      type: TokenType.Character,
      data: char("-")
    },
    {
      type: TokenType.Character,
      data: char("-")
    },
    {
      type: TokenType.Character,
      data: char("<")
    },
    {
      type: TokenType.Character,
      data: char("s")
    },
    {
      type: TokenType.Character,
      data: char("c")
    },
    {
      type: TokenType.Character,
      data: char("r")
    },
    {
      type: TokenType.Character,
      data: char("i")
    },
    {
      type: TokenType.Character,
      data: char("p")
    },
    {
      type: TokenType.Character,
      data: char("t")
    },
    {
      type: TokenType.Character,
      data: char(">")
    },
    {
      type: TokenType.Character,
      data: char("-")
    },
    {
      type: TokenType.Character,
      data: char("-")
    },
    {
      type: TokenType.Character,
      data: char(">")
    },
    {
      type: TokenType.EndTag,
      name: "script"
    }
  ]);
});

test("Can lex a script element with an apparent comment", t => {
  html(t, "<script><!--<p></p >--></script>", [
    {
      type: TokenType.StartTag,
      name: "script",
      selfClosing: false,
      attributes: []
    },
    {
      type: TokenType.Character,
      data: char("<")
    },
    {
      type: TokenType.Character,
      data: char("!")
    },
    {
      type: TokenType.Character,
      data: char("-")
    },
    {
      type: TokenType.Character,
      data: char("-")
    },
    {
      type: TokenType.Character,
      data: char("<")
    },
    {
      type: TokenType.Character,
      data: char("p")
    },
    {
      type: TokenType.Character,
      data: char(">")
    },
    {
      type: TokenType.Character,
      data: char("<")
    },
    {
      type: TokenType.Character,
      data: char("/")
    },
    {
      type: TokenType.Character,
      data: char("p")
    },
    {
      type: TokenType.Character,
      data: char(" ")
    },
    {
      type: TokenType.Character,
      data: char(">")
    },
    {
      type: TokenType.Character,
      data: char("-")
    },
    {
      type: TokenType.Character,
      data: char("-")
    },
    {
      type: TokenType.Character,
      data: char(">")
    },
    {
      type: TokenType.EndTag,
      name: "script"
    }
  ]);
});
