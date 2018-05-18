import { test, Test } from "@siteimprove/alfa-test";
import { parse, lex } from "@siteimprove/alfa-lang";
import { Alphabet } from "../../src/alphabet";
import { SelectorGrammar, Selector } from "../../src/grammars/selector";

async function selector(
  t: Test,
  input: string,
  expected: Selector | Array<Selector>
) {
  t.deepEqual(parse(lex(input, Alphabet), SelectorGrammar), expected, t.title);
}

test("Can parse a type selector", async t =>
  selector(t, "div", {
    type: "type-selector",
    name: "div",
    namespace: null
  }));

test("Can parse an uppercase type selector", async t =>
  selector(t, "DIV", {
    type: "type-selector",
    name: "div",
    namespace: null
  }));

test("Can parse a type selector with a namespace", async t =>
  selector(t, "svg|a", {
    type: "type-selector",
    name: "a",
    namespace: "svg"
  }));

test("Can parse a type selector with an empty namespace", async t =>
  selector(t, "|a", {
    type: "type-selector",
    name: "a",
    namespace: ""
  }));

test("Can parse the universal selector with an empty namespace", async t =>
  selector(t, "|*", {
    type: "type-selector",
    name: "*",
    namespace: ""
  }));

test("Can parse a type selector with the universal namespace", async t =>
  selector(t, "*|a", {
    type: "type-selector",
    name: "a",
    namespace: "*"
  }));

test("Can parse the universal selector with the universal namespace", async t =>
  selector(t, "*|*", {
    type: "type-selector",
    name: "*",
    namespace: "*"
  }));

test("Can parse a class selector", async t =>
  selector(t, ".foo", {
    type: "class-selector",
    name: "foo"
  }));

test("Can parse an ID selector", async t =>
  selector(t, "#foo", {
    type: "id-selector",
    name: "foo"
  }));

test("Can parse a compound selector", async t =>
  selector(t, "#foo.bar", {
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
  selector(t, "*", {
    type: "type-selector",
    name: "*",
    namespace: null
  }));

test("Can parse a compound selector with a type in prefix position", async t =>
  selector(t, "div.foo", {
    type: "compound-selector",
    selectors: [
      {
        type: "type-selector",
        name: "div",
        namespace: null
      },
      {
        type: "class-selector",
        name: "foo"
      }
    ]
  }));

test("Can parse a single descendant selector", async t =>
  selector(t, "div .foo", {
    type: "relative-selector",
    combinator: " ",
    relative: {
      type: "type-selector",
      name: "div",
      namespace: null
    },
    selector: {
      type: "class-selector",
      name: "foo"
    }
  }));

test("Can parse a single descendant selector with a right-hand type selector", async t =>
  selector(t, "div span", {
    type: "relative-selector",
    combinator: " ",
    relative: {
      type: "type-selector",
      name: "div",
      namespace: null
    },
    selector: {
      type: "type-selector",
      name: "span",
      namespace: null
    }
  }));

test("Can parse a double descendant selector", async t =>
  selector(t, "div .foo #bar", {
    type: "relative-selector",
    combinator: " ",
    relative: {
      type: "relative-selector",
      combinator: " ",
      relative: {
        type: "type-selector",
        name: "div",
        namespace: null
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
  selector(t, "div > .foo", {
    type: "relative-selector",
    combinator: ">",
    relative: {
      type: "type-selector",
      name: "div",
      namespace: null
    },
    selector: {
      type: "class-selector",
      name: "foo"
    }
  }));

test("Can parse a sibling selector", async t =>
  selector(t, "div ~ .foo", {
    type: "relative-selector",
    combinator: "~",
    relative: {
      type: "type-selector",
      name: "div",
      namespace: null
    },
    selector: {
      type: "class-selector",
      name: "foo"
    }
  }));

test("Can parse a direct sibling selector", async t =>
  selector(t, "div + .foo", {
    type: "relative-selector",
    combinator: "+",
    relative: {
      type: "type-selector",
      name: "div",
      namespace: null
    },
    selector: {
      type: "class-selector",
      name: "foo"
    }
  }));

test("Can parse a list of simple selectors", async t =>
  selector(t, ".foo, .bar, .baz", [
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
  ]));

test("Can parse a list of simple and compound selectors", async t =>
  selector(t, ".foo, #bar.baz", [
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
  ]));

test("Can parse a list of descendant selectors", async t =>
  selector(t, "div .foo, span .baz", [
    {
      type: "relative-selector",
      combinator: " ",
      relative: {
        type: "type-selector",
        name: "div",
        namespace: null
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
        name: "span",
        namespace: null
      },
      selector: {
        type: "class-selector",
        name: "baz"
      }
    }
  ]));

test("Can parse a list of sibling selectors", async t =>
  selector(t, "div ~ .foo, span ~ .baz", [
    {
      type: "relative-selector",
      combinator: "~",
      relative: {
        type: "type-selector",
        name: "div",
        namespace: null
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
        name: "span",
        namespace: null
      },
      selector: {
        type: "class-selector",
        name: "baz"
      }
    }
  ]));

test("Can parse a list of selectors with no whitespace", async t =>
  selector(t, ".foo,.bar,.baz", [
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
  ]));

test("Can parse a compound selector relative to a class selector", async t =>
  selector(t, ".foo div.bar", {
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
          name: "div",
          namespace: null
        },
        {
          type: "class-selector",
          name: "bar"
        }
      ]
    }
  }));

test("Can parse a compound selector relative to a compound selector", async t =>
  selector(t, "span.foo div.bar", {
    type: "relative-selector",
    combinator: " ",
    relative: {
      type: "compound-selector",
      selectors: [
        {
          type: "type-selector",
          name: "span",
          namespace: null
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
          name: "div",
          namespace: null
        },
        {
          type: "class-selector",
          name: "bar"
        }
      ]
    }
  }));

test("Can parse a descendant selector relative to a sibling selector", async t =>
  selector(t, "div ~ span .foo", {
    type: "relative-selector",
    combinator: " ",
    relative: {
      type: "relative-selector",
      combinator: "~",
      relative: {
        type: "type-selector",
        name: "div",
        namespace: null
      },
      selector: {
        type: "type-selector",
        name: "span",
        namespace: null
      }
    },
    selector: {
      type: "class-selector",
      name: "foo"
    }
  }));

test("Can parse an attribute selector without a value", async t =>
  selector(t, "[foo]", {
    type: "attribute-selector",
    name: "foo",
    value: null,
    matcher: null,
    modifier: null
  }));

test("Can parse an attribute selector with an ident value", async t =>
  selector(t, "[foo=bar]", {
    type: "attribute-selector",
    name: "foo",
    value: "bar",
    matcher: null,
    modifier: null
  }));

test("Can parse an attribute selector with a string value", async t =>
  selector(t, '[foo="bar"]', {
    type: "attribute-selector",
    name: "foo",
    value: "bar",
    matcher: null,
    modifier: null
  }));

test("Can parse an attribute selector with a matcher", async t =>
  selector(t, "[foo*=bar]", {
    type: "attribute-selector",
    name: "foo",
    value: "bar",
    matcher: "*",
    modifier: null
  }));

test("Can parse an attribute selector with a casing modifier", async t =>
  selector(t, "[foo=bar i]", {
    type: "attribute-selector",
    name: "foo",
    value: "bar",
    matcher: null,
    modifier: "i"
  }));

test("Can parse an attribute selector when part of a compound selector", async t =>
  selector(t, ".foo[foo]", {
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
        matcher: null,
        modifier: null
      }
    ]
  }));

test("Can parse an attribute selector when part of a descendant selector", async t =>
  selector(t, "div [foo]", {
    type: "relative-selector",
    combinator: " ",
    relative: {
      type: "type-selector",
      name: "div",
      namespace: null
    },
    selector: {
      type: "attribute-selector",
      name: "foo",
      value: null,
      matcher: null,
      modifier: null
    }
  }));

test("Can parse an attribute selector when part of a compound selector relative to a class selector", async t =>
  selector(t, ".foo div[foo]", {
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
          name: "div",
          namespace: null
        },
        {
          type: "attribute-selector",
          name: "foo",
          value: null,
          matcher: null,
          modifier: null
        }
      ]
    }
  }));

test("Can parse a pseudo-element selector", async t =>
  selector(t, "::foo", {
    type: "pseudo-element-selector",
    name: "foo"
  }));

test("Can parse a pseudo-element selector when part of a compound selector", async t =>
  selector(t, ".foo::foo", {
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
  selector(t, "div ::foo", {
    type: "relative-selector",
    combinator: " ",
    relative: {
      type: "type-selector",
      name: "div",
      namespace: null
    },
    selector: {
      type: "pseudo-element-selector",
      name: "foo"
    }
  }));

test("Can parse a pseudo-element selector when part of a compound selector relative to a class selector", async t =>
  selector(t, ".foo div::foo", {
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
          name: "div",
          namespace: null
        },
        {
          type: "pseudo-element-selector",
          name: "foo"
        }
      ]
    }
  }));

test("Can parse a named pseudo-class selector", async t =>
  selector(t, ":hover", {
    type: "pseudo-class-selector",
    name: "hover",
    value: null
  }));

test("Can parse a functional pseudo-class selector", async t =>
  selector(t, ":not(.foo)", {
    type: "pseudo-class-selector",
    name: "not",
    value: {
      type: "class-selector",
      name: "foo"
    }
  }));

test("Can parse a pseudo-class selector when part of a compound selector", async t =>
  selector(t, "div:hover", {
    type: "compound-selector",
    selectors: [
      {
        type: "type-selector",
        name: "div",
        namespace: null
      },
      {
        type: "pseudo-class-selector",
        name: "hover",
        value: null
      }
    ]
  }));

test("Can parse a pseudo-class selector when part of a compound selector relative to a class selector", async t =>
  selector(t, ".foo div:hover", {
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
          name: "div",
          namespace: null
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
  selector(t, ".foo div.bar:hover", {
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
          name: "div",
          namespace: null
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
