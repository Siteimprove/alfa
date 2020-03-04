import { Assertions, test } from "@siteimprove/alfa-test";

import { Lexer } from "../../src/syntax/lexer";
import { Token } from "../../src/syntax/token";

function lex(t: Assertions, input: string, expected: Array<Token.JSON>) {
  t.deepEqual(
    Lexer.lex(input).map(token => token.toJSON()),
    expected,
    input
  );
}

test(".lex() lexes whitespace", t => {
  lex(t, "  \n \t", [
    {
      type: "whitespace"
    }
  ]);
});

test(".lex() lexes a comma", t => {
  lex(t, ",", [
    {
      type: "comma"
    }
  ]);
});

test(".lex() lexes a colon", t => {
  lex(t, ":", [
    {
      type: "colon"
    }
  ]);
});

test(".lex() lexes a semicolon", t => {
  lex(t, ";", [
    {
      type: "semicolon"
    }
  ]);
});

test(".lex() lexes a comment", t => {
  lex(t, "/*Hello world*/", []);
});

test(".lex() lexes a comment followed by an ident", t => {
  lex(t, "/*Hello world*/foo", [{ type: "ident", value: "foo" }]);
});

test(".lex() lexes a multiline comment", t => {
  lex(
    t,
    `/**
      * Hello world
      */`,
    []
  );
});

test(".lex() lexes an ident", t => {
  lex(t, "foo", [
    {
      type: "ident",
      value: "foo"
    }
  ]);
});

test(".lex() lexes an ident prefixed with a single hyphen", t => {
  lex(t, "-foo", [
    {
      type: "ident",
      value: "-foo"
    }
  ]);
});

test(".lex() lexes an ident containing an underscore", t => {
  lex(t, "foo_bar", [
    {
      type: "ident",
      value: "foo_bar"
    }
  ]);
});

test(".lex() lexes an ident containing a hyphen", t => {
  lex(t, "foo-bar", [
    {
      type: "ident",
      value: "foo-bar"
    }
  ]);
});

test(".lex() lexes two idents separated by a comma", t => {
  lex(t, "foo,bar", [
    {
      type: "ident",
      value: "foo"
    },
    {
      type: "comma"
    },
    {
      type: "ident",
      value: "bar"
    }
  ]);
});

test(".lex() lexes a double quoted string", t => {
  lex(t, '"foo"', [
    {
      type: "string",
      value: "foo"
    }
  ]);
});

test(".lex() lexes a single quoted string", t => {
  lex(t, "'foo'", [
    {
      type: "string",
      value: "foo"
    }
  ]);
});

test(".lex() lexes a really large string", t => {
  const value = "a".repeat(1000000);

  lex(t, `"${value}"`, [
    {
      type: "string",
      value
    }
  ]);
});

test(".lex() lexes an integer", t => {
  lex(t, "123", [
    {
      type: "number",
      value: 123,
      isInteger: true,
      isSigned: false
    }
  ]);
});

test(".lex() lexes a positive integer", t => {
  lex(t, "+123", [
    {
      type: "number",
      value: 123,
      isInteger: true,
      isSigned: true
    }
  ]);
});

test(".lex() lexes a negative integer", t => {
  lex(t, "-123", [
    {
      type: "number",
      value: -123,
      isInteger: true,
      isSigned: true
    }
  ]);
});

test(".lex() lexes a decimal", t => {
  lex(t, "123.456", [
    {
      type: "number",
      value: 123.456,
      isInteger: false,
      isSigned: false
    }
  ]);
});

test(".lex() lexes odd decimals", t => {
  lex(t, "0.3", [
    {
      type: "number",
      value: 0.3,
      isInteger: false,
      isSigned: false
    }
  ]);
});

test(".lex() lexes a negative decimal", t => {
  lex(t, "-123.456", [
    {
      type: "number",
      value: -123.456,
      isInteger: false,
      isSigned: true
    }
  ]);
});

test(".lex() lexes a decimal in E-notation", t => {
  lex(t, "123.456e2", [
    {
      type: "number",
      value: 123.456e2,
      isInteger: false,
      isSigned: false
    }
  ]);
});

test(".lex() lexes a negative decimal in E-notation", t => {
  lex(t, "-123.456e2", [
    {
      type: "number",
      value: -123.456e2,
      isInteger: false,
      isSigned: true
    }
  ]);
});

test(".lex() lexes odd E-notations", t => {
  lex(t, "3e-1", [
    {
      type: "number",
      value: 3e-1,
      isInteger: false,
      isSigned: false
    }
  ]);
});

test(".lex() lexes a dimension", t => {
  lex(t, "123px", [
    {
      type: "dimension",
      value: 123,
      isInteger: true,
      isSigned: false,
      unit: "px"
    }
  ]);
});

test(".lex() lexes a percentage", t => {
  lex(t, "123%", [
    {
      type: "percentage",
      value: 1.23,
      isInteger: true
    }
  ]);
});

test(".lex() lexes a function with no arguments", t => {
  lex(t, "rgb()", [
    {
      type: "function",
      value: "rgb"
    },
    {
      type: "close-parenthesis"
    }
  ]);
});

test(".lex() lexes a function with a single argument", t => {
  lex(t, "rgb(123)", [
    {
      type: "function",
      value: "rgb"
    },
    {
      type: "number",
      value: 123,
      isInteger: true,
      isSigned: false
    },
    {
      type: "close-parenthesis"
    }
  ]);
});

test(".lex() lexes a URL", t => {
  lex(t, "url(https://example.com)", [
    {
      type: "url",
      value: "https://example.com"
    }
  ]);
});

test(".lex() lexes a URL with a string value", t => {
  lex(t, "url('https://example.com')", [
    {
      type: "function",
      value: "url"
    },
    {
      type: "string",
      value: "https://example.com"
    },
    {
      type: "close-parenthesis"
    }
  ]);
});

test(".lex() lexes an ID selector", t => {
  lex(t, "#foo", [
    {
      type: "hash",
      value: "foo",
      isIdentifier: true
    }
  ]);
});

test(".lex() lexes a class selector", t => {
  lex(t, ".foo", [
    {
      type: "delim",
      value: 0x2e
    },
    {
      type: "ident",
      value: "foo"
    }
  ]);
});

test(".lex() lexes a type selector with a namespace", t => {
  lex(t, "svg|div", [
    {
      type: "ident",
      value: "svg"
    },
    {
      type: "delim",
      value: 0x7c
    },
    {
      type: "ident",
      value: "div"
    }
  ]);
});

test(".lex() lexes a declaration", t => {
  lex(t, "color:red", [
    {
      type: "ident",
      value: "color"
    },
    {
      type: "colon"
    },
    {
      type: "ident",
      value: "red"
    }
  ]);
});

test(".lex() lexes an+b values", t => {
  lex(t, "2n+4", [
    {
      type: "dimension",
      value: 2,
      isInteger: true,
      isSigned: false,
      unit: "n"
    },
    {
      type: "number",
      value: 4,
      isInteger: true,
      isSigned: true
    }
  ]);

  lex(t, "n-4", [
    {
      type: "ident",
      value: "n-4"
    }
  ]);

  lex(t, "1n-4", [
    {
      type: "dimension",
      value: 1,
      isInteger: true,
      isSigned: false,
      unit: "n-4"
    }
  ]);

  lex(t, "-1n+5", [
    {
      type: "dimension",
      value: -1,
      isInteger: true,
      isSigned: true,
      unit: "n"
    },
    {
      type: "number",
      value: 5,
      isInteger: true,
      isSigned: true
    }
  ]);
});

test(".lex() lexes an escaped character", t => {
  lex(t, "\\/", [
    {
      type: "ident",
      value: "/"
    }
  ]);
});

test(".lex() lexes an escaped unicode point", t => {
  lex(t, "\\002d", [
    {
      type: "ident",
      value: "\u002d"
    }
  ]);
});

test(".lex() lexes an @-keyword", t => {
  lex(t, "@page", [
    {
      type: "at-keyword",
      value: "page"
    }
  ]);
});

test(".lex() lexes an attribute selector with an includes matcher", t => {
  lex(t, "[href~=com]", [
    {
      type: "open-square-bracket"
    },
    {
      type: "ident",
      value: "href"
    },
    {
      type: "delim",
      value: 0x7e
    },
    {
      type: "delim",
      value: 0x3d
    },
    {
      type: "ident",
      value: "com"
    },
    {
      type: "close-square-bracket"
    }
  ]);
});

test(".lex() lexes an attribute selector with a dash matcher", t => {
  lex(t, "[href|=https]", [
    {
      type: "open-square-bracket"
    },
    {
      type: "ident",
      value: "href"
    },
    {
      type: "delim",
      value: 0x7c
    },
    {
      type: "delim",
      value: 0x3d
    },
    {
      type: "ident",
      value: "https"
    },
    {
      type: "close-square-bracket"
    }
  ]);
});

test(".lex() lexes an attribute selector with a prefix matcher", t => {
  lex(t, "[href^=https]", [
    {
      type: "open-square-bracket"
    },
    {
      type: "ident",
      value: "href"
    },
    {
      type: "delim",
      value: 0x5e
    },
    {
      type: "delim",
      value: 0x3d
    },
    {
      type: "ident",
      value: "https"
    },
    {
      type: "close-square-bracket"
    }
  ]);
});

test(".lex() lexes an attribute selector with a suffix matcher", t => {
  lex(t, "[href$=com]", [
    {
      type: "open-square-bracket"
    },
    {
      type: "ident",
      value: "href"
    },
    {
      type: "delim",
      value: 0x24
    },
    {
      type: "delim",
      value: 0x3d
    },
    {
      type: "ident",
      value: "com"
    },
    {
      type: "close-square-bracket"
    }
  ]);
});

test(".lex() lexes an attribute selector with a substring matcher", t => {
  lex(t, "[href*=com]", [
    {
      type: "open-square-bracket"
    },
    {
      type: "ident",
      value: "href"
    },
    {
      type: "delim",
      value: 0x2a
    },
    {
      type: "delim",
      value: 0x3d
    },
    {
      type: "ident",
      value: "com"
    },
    {
      type: "close-square-bracket"
    }
  ]);
});

test(".lex() lexes a column selector", t => {
  lex(t, "td||.column", [
    {
      type: "ident",
      value: "td"
    },
    {
      type: "delim",
      value: 0x7c
    },
    {
      type: "delim",
      value: 0x7c
    },
    {
      type: "delim",
      value: 0x2e
    },
    {
      type: "ident",
      value: "column"
    }
  ]);
});
