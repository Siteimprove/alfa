import { test, Test } from "@alfa/test";
import { CssTree, parse } from "../src/parser";

async function css(t: Test, input: string, expected: CssTree) {
  t.deepEqual(parse(input), expected, "Parse trees match");
}

test("Can parse a type selector", async t =>
  css(t, "div", {
    type: "type-selector",
    name: "div"
  }));

test("Can parse an uppercase type selector", async t =>
  css(t, "DIV", {
    type: "type-selector",
    name: "div"
  }));

test("Can parse a class selector", async t =>
  css(t, ".foo", {
    type: "class-selector",
    name: "foo"
  }));

test("Can parse an ID selector", async t =>
  css(t, "#foo", {
    type: "id-selector",
    name: "foo"
  }));

test("Can parse a compound selector", async t =>
  css(t, "#foo.bar", {
    type: "compound-selector",
    selectors: [
      {
        type: "id-selector",
        name: "foo"
      },
      {
        type: "class-selector",
        name: "bar"
      }
    ]
  }));

test("Can parse the universal selector", async t =>
  css(t, "*", {
    type: "type-selector",
    name: "*"
  }));

test("Can parse a compound selector with a type in prefix position", async t =>
  css(t, "div.foo", {
    type: "compound-selector",
    selectors: [
      {
        type: "type-selector",
        name: "div"
      },
      {
        type: "class-selector",
        name: "foo"
      }
    ]
  }));

test("Can parse a single descendant selector", async t =>
  css(t, "div .foo", {
    type: "relative-selector",
    combinator: " ",
    relative: {
      type: "type-selector",
      name: "div"
    },
    selector: {
      type: "class-selector",
      name: "foo"
    }
  }));

test("Can parse a single descendant selector with a right-hand type selector", async t =>
  css(t, "div span", {
    type: "relative-selector",
    combinator: " ",
    relative: {
      type: "type-selector",
      name: "div"
    },
    selector: {
      type: "type-selector",
      name: "span"
    }
  }));

test("Can parse a double descendant selector", async t =>
  css(t, "div .foo #bar", {
    type: "relative-selector",
    combinator: " ",
    relative: {
      type: "relative-selector",
      combinator: " ",
      relative: {
        type: "type-selector",
        name: "div"
      },
      selector: {
        type: "class-selector",
        name: "foo"
      }
    },
    selector: {
      type: "id-selector",
      name: "bar"
    }
  }));

test("Can parse a direct descendant selector", async t =>
  css(t, "div > .foo", {
    type: "relative-selector",
    combinator: ">",
    relative: {
      type: "type-selector",
      name: "div"
    },
    selector: {
      type: "class-selector",
      name: "foo"
    }
  }));

test("Can parse a sibling selector", async t =>
  css(t, "div ~ .foo", {
    type: "relative-selector",
    combinator: "~",
    relative: {
      type: "type-selector",
      name: "div"
    },
    selector: {
      type: "class-selector",
      name: "foo"
    }
  }));

test("Can parse a direct sibling selector", async t =>
  css(t, "div + .foo", {
    type: "relative-selector",
    combinator: "+",
    relative: {
      type: "type-selector",
      name: "div"
    },
    selector: {
      type: "class-selector",
      name: "foo"
    }
  }));

test("Can parse a list of simple selectors", async t =>
  css(t, ".foo, .bar, .baz", {
    type: "selector-list",
    selectors: [
      {
        type: "class-selector",
        name: "foo"
      },
      {
        type: "class-selector",
        name: "bar"
      },
      {
        type: "class-selector",
        name: "baz"
      }
    ]
  }));

test("Can parse a list of simple and compound selectors", async t =>
  css(t, ".foo, #bar.baz", {
    type: "selector-list",
    selectors: [
      {
        type: "class-selector",
        name: "foo"
      },
      {
        type: "compound-selector",
        selectors: [
          {
            type: "id-selector",
            name: "bar"
          },
          {
            type: "class-selector",
            name: "baz"
          }
        ]
      }
    ]
  }));

test("Can parse a list of descendant selectors", async t =>
  css(t, "div .foo, span .baz", {
    type: "selector-list",
    selectors: [
      {
        type: "relative-selector",
        combinator: " ",
        relative: {
          type: "type-selector",
          name: "div"
        },
        selector: {
          type: "class-selector",
          name: "foo"
        }
      },
      {
        type: "relative-selector",
        combinator: " ",
        relative: {
          type: "type-selector",
          name: "span"
        },
        selector: {
          type: "class-selector",
          name: "baz"
        }
      }
    ]
  }));

test("Can parse a list of sibling selectors", async t =>
  css(t, "div ~ .foo, span ~ .baz", {
    type: "selector-list",
    selectors: [
      {
        type: "relative-selector",
        combinator: "~",
        relative: {
          type: "type-selector",
          name: "div"
        },
        selector: {
          type: "class-selector",
          name: "foo"
        }
      },
      {
        type: "relative-selector",
        combinator: "~",
        relative: {
          type: "type-selector",
          name: "span"
        },
        selector: {
          type: "class-selector",
          name: "baz"
        }
      }
    ]
  }));

test("Can parse a list of selectors with no whitespace", async t =>
  css(t, ".foo,.bar,.baz", {
    type: "selector-list",
    selectors: [
      {
        type: "class-selector",
        name: "foo"
      },
      {
        type: "class-selector",
        name: "bar"
      },
      {
        type: "class-selector",
        name: "baz"
      }
    ]
  }));

test("Can parse a compound selector relative to a class selector", async t =>
  css(t, ".foo div.bar", {
    type: "relative-selector",
    combinator: " ",
    relative: {
      type: "class-selector",
      name: "foo"
    },
    selector: {
      type: "compound-selector",
      selectors: [
        {
          type: "type-selector",
          name: "div"
        },
        {
          type: "class-selector",
          name: "bar"
        }
      ]
    }
  }));

test("Can parse a compound selector relative to a compound selector", async t =>
  css(t, "span.foo div.bar", {
    type: "relative-selector",
    combinator: " ",
    relative: {
      type: "compound-selector",
      selectors: [
        {
          type: "type-selector",
          name: "span"
        },
        {
          type: "class-selector",
          name: "foo"
        }
      ]
    },
    selector: {
      type: "compound-selector",
      selectors: [
        {
          type: "type-selector",
          name: "div"
        },
        {
          type: "class-selector",
          name: "bar"
        }
      ]
    }
  }));

test("Can parse a descendant selector relative to a sibling selector", async t =>
  css(t, "div ~ span .foo", {
    type: "relative-selector",
    combinator: " ",
    relative: {
      type: "relative-selector",
      combinator: "~",
      relative: {
        type: "type-selector",
        name: "div"
      },
      selector: {
        type: "type-selector",
        name: "span"
      }
    },
    selector: {
      type: "class-selector",
      name: "foo"
    }
  }));

test("Can parse an attribute selector without a value", async t =>
  css(t, "[foo]", {
    type: "attribute-selector",
    name: "foo",
    value: null,
    matcher: null
  }));

test("Can parse an attribute selector with an ident value", async t =>
  css(t, "[foo=bar]", {
    type: "attribute-selector",
    name: "foo",
    value: "bar",
    matcher: null
  }));

test("Can parse an attribute selector with a string value", async t =>
  css(t, '[foo="bar"]', {
    type: "attribute-selector",
    name: "foo",
    value: "bar",
    matcher: null
  }));

test("Can parse an attribute selector when part of a compound selector", async t =>
  css(t, ".foo[foo]", {
    type: "compound-selector",
    selectors: [
      {
        type: "class-selector",
        name: "foo"
      },
      {
        type: "attribute-selector",
        name: "foo",
        value: null,
        matcher: null
      }
    ]
  }));

test("Can parse an attribute selector when part of a descendant selector", async t =>
  css(t, "div [foo]", {
    type: "relative-selector",
    combinator: " ",
    relative: {
      type: "type-selector",
      name: "div"
    },
    selector: {
      type: "attribute-selector",
      name: "foo",
      value: null,
      matcher: null
    }
  }));

test("Can parse an attribute selector when part of a compound selector relative to a class selector", async t =>
  css(t, ".foo div[foo]", {
    type: "relative-selector",
    combinator: " ",
    relative: {
      type: "class-selector",
      name: "foo"
    },
    selector: {
      type: "compound-selector",
      selectors: [
        {
          type: "type-selector",
          name: "div"
        },
        {
          type: "attribute-selector",
          name: "foo",
          value: null,
          matcher: null
        }
      ]
    }
  }));

test("Can parse a pseudo-element selector", async t =>
  css(t, "::foo", {
    type: "pseudo-element-selector",
    name: "foo"
  }));

test("Can parse a pseudo-element selector when part of a compound selector", async t =>
  css(t, ".foo::foo", {
    type: "compound-selector",
    selectors: [
      {
        type: "class-selector",
        name: "foo"
      },
      {
        type: "pseudo-element-selector",
        name: "foo"
      }
    ]
  }));

test("Can parse a pseudo-element selector when part of a descendant selector", async t =>
  css(t, "div ::foo", {
    type: "relative-selector",
    combinator: " ",
    relative: {
      type: "type-selector",
      name: "div"
    },
    selector: {
      type: "pseudo-element-selector",
      name: "foo"
    }
  }));

test("Can parse a pseudo-element selector when part of a compound selector relative to a class selector", async t =>
  css(t, ".foo div::foo", {
    type: "relative-selector",
    combinator: " ",
    relative: {
      type: "class-selector",
      name: "foo"
    },
    selector: {
      type: "compound-selector",
      selectors: [
        {
          type: "type-selector",
          name: "div"
        },
        {
          type: "pseudo-element-selector",
          name: "foo"
        }
      ]
    }
  }));

test("Can parse a named pseudo-class selector", async t =>
  css(t, ":hover", {
    type: "pseudo-class-selector",
    name: "hover",
    value: null
  }));

test("Can parse a functional pseudo-class selector", async t =>
  css(t, ":not(.foo)", {
    type: "pseudo-class-selector",
    name: "not",
    value: {
      type: "class-selector",
      name: "foo"
    }
  }));

test("Can parse a pseudo-class selector when part of a compound selector", async t =>
  css(t, "div:hover", {
    type: "compound-selector",
    selectors: [
      {
        type: "type-selector",
        name: "div"
      },
      {
        type: "pseudo-class-selector",
        name: "hover",
        value: null
      }
    ]
  }));

test("Can parse a pseudo-class selector when part of a compound selector relative to a class selector", async t =>
  css(t, ".foo div:hover", {
    type: "relative-selector",
    combinator: " ",
    relative: {
      type: "class-selector",
      name: "foo"
    },
    selector: {
      type: "compound-selector",
      selectors: [
        {
          type: "type-selector",
          name: "div"
        },
        {
          type: "pseudo-class-selector",
          name: "hover",
          value: null
        }
      ]
    }
  }));

test("Can parse a compound type, class, and pseudo-class selector relative to a class selector", async t =>
  css(t, ".foo div.bar:hover", {
    type: "relative-selector",
    combinator: " ",
    relative: {
      type: "class-selector",
      name: "foo"
    },
    selector: {
      type: "compound-selector",
      selectors: [
        {
          type: "type-selector",
          name: "div"
        },
        {
          type: "class-selector",
          name: "bar"
        },
        {
          type: "pseudo-class-selector",
          name: "hover",
          value: null
        }
      ]
    }
  }));

test("Can parse a function with no values", async t =>
  css(t, "rgb()", {
    type: "function",
    name: "rgb",
    value: []
  }));

test("Can parse a function with a single value", async t =>
  css(t, "rgb(123)", {
    type: "function",
    name: "rgb",
    value: [
      {
        type: "number",
        value: 123
      }
    ]
  }));

test("Can parse a function with multiple values", async t =>
  css(t, "rgb(123, 456)", {
    type: "function",
    name: "rgb",
    value: [
      {
        type: "number",
        value: 123
      },
      {
        type: "number",
        value: 456
      }
    ]
  }));

test("Can parse a function with multiple values and no whitespace", async t =>
  css(t, "rgb(123,456)", {
    type: "function",
    name: "rgb",
    value: [
      {
        type: "number",
        value: 123
      },
      {
        type: "number",
        value: 456
      }
    ]
  }));
