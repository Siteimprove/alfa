import { lex, parse } from "@siteimprove/alfa-lang";
import { Assertions, test } from "@siteimprove/alfa-test";
import { Alphabet } from "../../src/alphabet";
import { SelectorGrammar } from "../../src/grammars/selector";
import {
  AttributeMatcher,
  AttributeModifier,
  Selector,
  SelectorCombinator,
  SelectorType
} from "../../src/types";

function selector(
  t: Assertions,
  input: string,
  expected: Selector | Array<Selector> | null
) {
  const lexer = lex(input, Alphabet);
  const parser = parse(lexer.result, SelectorGrammar);

  t.deepEqual(parser.result, expected, input);
}

test("Can parse a type selector", t => {
  selector(t, "div", {
    type: SelectorType.TypeSelector,
    name: "div",
    namespace: null
  });
});

test("Can parse an uppercase type selector", t => {
  selector(t, "DIV", {
    type: SelectorType.TypeSelector,
    name: "div",
    namespace: null
  });
});

test("Can parse a type selector with a namespace", t => {
  selector(t, "svg|a", {
    type: SelectorType.TypeSelector,
    name: "a",
    namespace: "svg"
  });
});

test("Can parse a type selector with an empty namespace", t => {
  selector(t, "|a", {
    type: SelectorType.TypeSelector,
    name: "a",
    namespace: ""
  });
});

test("Can parse the universal selector with an empty namespace", t => {
  selector(t, "|*", {
    type: SelectorType.TypeSelector,
    name: "*",
    namespace: ""
  });
});

test("Can parse a type selector with the universal namespace", t => {
  selector(t, "*|a", {
    type: SelectorType.TypeSelector,
    name: "a",
    namespace: "*"
  });
});

test("Can parse the universal selector with the universal namespace", t => {
  selector(t, "*|*", {
    type: SelectorType.TypeSelector,
    name: "*",
    namespace: "*"
  });
});

test("Can parse a class selector", t => {
  selector(t, ".foo", {
    type: SelectorType.ClassSelector,
    name: "foo"
  });
});

test("Can parse an ID selector", t => {
  selector(t, "#foo", {
    type: SelectorType.IdSelector,
    name: "foo"
  });
});

test("Can parse a compound selector", t => {
  selector(t, "#foo.bar", {
    type: SelectorType.CompoundSelector,
    left: {
      type: SelectorType.IdSelector,
      name: "foo"
    },
    right: {
      type: SelectorType.ClassSelector,
      name: "bar"
    }
  });
});

test("Can parse the universal selector", t => {
  selector(t, "*", {
    type: SelectorType.TypeSelector,
    name: "*",
    namespace: null
  });
});

test("Can parse a compound selector with a type in prefix position", t => {
  selector(t, "div.foo", {
    type: SelectorType.CompoundSelector,
    left: {
      type: SelectorType.TypeSelector,
      name: "div",
      namespace: null
    },
    right: {
      type: SelectorType.ClassSelector,
      name: "foo"
    }
  });
});

test("Can parse a single descendant selector", t => {
  selector(t, "div .foo", {
    type: SelectorType.RelativeSelector,
    combinator: SelectorCombinator.Descendant,
    left: {
      type: SelectorType.TypeSelector,
      name: "div",
      namespace: null
    },
    right: {
      type: SelectorType.ClassSelector,
      name: "foo"
    }
  });
});

test("Can parse a single descendant selector with a right-hand type selector", t => {
  selector(t, "div span", {
    type: SelectorType.RelativeSelector,
    combinator: SelectorCombinator.Descendant,
    left: {
      type: SelectorType.TypeSelector,
      name: "div",
      namespace: null
    },
    right: {
      type: SelectorType.TypeSelector,
      name: "span",
      namespace: null
    }
  });
});

test("Can parse a double descendant selector", t => {
  selector(t, "div .foo #bar", {
    type: SelectorType.RelativeSelector,
    combinator: SelectorCombinator.Descendant,
    left: {
      type: SelectorType.RelativeSelector,
      combinator: SelectorCombinator.Descendant,
      left: {
        type: SelectorType.TypeSelector,
        name: "div",
        namespace: null
      },
      right: {
        type: SelectorType.ClassSelector,
        name: "foo"
      }
    },
    right: {
      type: SelectorType.IdSelector,
      name: "bar"
    }
  });
});

test("Can parse a direct descendant selector", t => {
  selector(t, "div > .foo", {
    type: SelectorType.RelativeSelector,
    combinator: SelectorCombinator.DirectDescendant,
    left: {
      type: SelectorType.TypeSelector,
      name: "div",
      namespace: null
    },
    right: {
      type: SelectorType.ClassSelector,
      name: "foo"
    }
  });
});

test("Can parse a sibling selector", t => {
  selector(t, "div ~ .foo", {
    type: SelectorType.RelativeSelector,
    combinator: SelectorCombinator.Sibling,
    left: {
      type: SelectorType.TypeSelector,
      name: "div",
      namespace: null
    },
    right: {
      type: SelectorType.ClassSelector,
      name: "foo"
    }
  });
});

test("Can parse a direct sibling selector", t => {
  selector(t, "div + .foo", {
    type: SelectorType.RelativeSelector,
    combinator: SelectorCombinator.DirectSibling,
    left: {
      type: SelectorType.TypeSelector,
      name: "div",
      namespace: null
    },
    right: {
      type: SelectorType.ClassSelector,
      name: "foo"
    }
  });
});

test("Can parse a list of simple selectors", t => {
  selector(t, ".foo, .bar, .baz", [
    {
      type: SelectorType.ClassSelector,
      name: "foo"
    },
    {
      type: SelectorType.ClassSelector,
      name: "bar"
    },
    {
      type: SelectorType.ClassSelector,
      name: "baz"
    }
  ]);
});

test("Can parse a list of simple and compound selectors", t => {
  selector(t, ".foo, #bar.baz", [
    {
      type: SelectorType.ClassSelector,
      name: "foo"
    },
    {
      type: SelectorType.CompoundSelector,
      left: {
        type: SelectorType.IdSelector,
        name: "bar"
      },
      right: {
        type: SelectorType.ClassSelector,
        name: "baz"
      }
    }
  ]);
});

test("Can parse a list of descendant selectors", t => {
  selector(t, "div .foo, span .baz", [
    {
      type: SelectorType.RelativeSelector,
      combinator: SelectorCombinator.Descendant,
      left: {
        type: SelectorType.TypeSelector,
        name: "div",
        namespace: null
      },
      right: {
        type: SelectorType.ClassSelector,
        name: "foo"
      }
    },
    {
      type: SelectorType.RelativeSelector,
      combinator: SelectorCombinator.Descendant,
      left: {
        type: SelectorType.TypeSelector,
        name: "span",
        namespace: null
      },
      right: {
        type: SelectorType.ClassSelector,
        name: "baz"
      }
    }
  ]);
});

test("Can parse a list of sibling selectors", t => {
  selector(t, "div ~ .foo, span ~ .baz", [
    {
      type: SelectorType.RelativeSelector,
      combinator: SelectorCombinator.Sibling,
      left: {
        type: SelectorType.TypeSelector,
        name: "div",
        namespace: null
      },
      right: {
        type: SelectorType.ClassSelector,
        name: "foo"
      }
    },
    {
      type: SelectorType.RelativeSelector,
      combinator: SelectorCombinator.Sibling,
      left: {
        type: SelectorType.TypeSelector,
        name: "span",
        namespace: null
      },
      right: {
        type: SelectorType.ClassSelector,
        name: "baz"
      }
    }
  ]);
});

test("Can parse a list of selectors with no whitespace", t => {
  selector(t, ".foo,.bar,.baz", [
    {
      type: SelectorType.ClassSelector,
      name: "foo"
    },
    {
      type: SelectorType.ClassSelector,
      name: "bar"
    },
    {
      type: SelectorType.ClassSelector,
      name: "baz"
    }
  ]);
});

test("Can parse a compound selector relative to a class selector", t => {
  selector(t, ".foo div.bar", {
    type: SelectorType.RelativeSelector,
    combinator: SelectorCombinator.Descendant,
    left: {
      type: SelectorType.ClassSelector,
      name: "foo"
    },
    right: {
      type: SelectorType.CompoundSelector,
      left: {
        type: SelectorType.TypeSelector,
        name: "div",
        namespace: null
      },
      right: {
        type: SelectorType.ClassSelector,
        name: "bar"
      }
    }
  });
});

test("Can parse a compound selector relative to a compound selector", t => {
  selector(t, "span.foo div.bar", {
    type: SelectorType.RelativeSelector,
    combinator: SelectorCombinator.Descendant,
    left: {
      type: SelectorType.CompoundSelector,
      left: {
        type: SelectorType.TypeSelector,
        name: "span",
        namespace: null
      },
      right: {
        type: SelectorType.ClassSelector,
        name: "foo"
      }
    },
    right: {
      type: SelectorType.CompoundSelector,
      left: {
        type: SelectorType.TypeSelector,
        name: "div",
        namespace: null
      },
      right: {
        type: SelectorType.ClassSelector,
        name: "bar"
      }
    }
  });
});

test("Can parse a descendant selector relative to a sibling selector", t => {
  selector(t, "div ~ span .foo", {
    type: SelectorType.RelativeSelector,
    combinator: SelectorCombinator.Descendant,
    left: {
      type: SelectorType.RelativeSelector,
      combinator: SelectorCombinator.Sibling,
      left: {
        type: SelectorType.TypeSelector,
        name: "div",
        namespace: null
      },
      right: {
        type: SelectorType.TypeSelector,
        name: "span",
        namespace: null
      }
    },
    right: {
      type: SelectorType.ClassSelector,
      name: "foo"
    }
  });
});

test("Can parse an attribute selector without a value", t => {
  selector(t, "[foo]", {
    type: SelectorType.AttributeSelector,
    name: "foo",
    value: null,
    matcher: null,
    modifier: 0
  });
});

test("Can parse an attribute selector with an ident value", t => {
  selector(t, "[foo=bar]", {
    type: SelectorType.AttributeSelector,
    name: "foo",
    value: "bar",
    matcher: null,
    modifier: 0
  });
});

test("Can parse an attribute selector with a string value", t => {
  selector(t, '[foo="bar"]', {
    type: SelectorType.AttributeSelector,
    name: "foo",
    value: "bar",
    matcher: null,
    modifier: 0
  });
});

test("Can parse an attribute selector with a matcher", t => {
  selector(t, "[foo*=bar]", {
    type: SelectorType.AttributeSelector,
    name: "foo",
    value: "bar",
    matcher: AttributeMatcher.Substring,
    modifier: 0
  });
});

test("Can parse an attribute selector with a casing modifier", t => {
  selector(t, "[foo=bar i]", {
    type: SelectorType.AttributeSelector,
    name: "foo",
    value: "bar",
    matcher: null,
    modifier: AttributeModifier.CaseInsensitive
  });
});

test("Can parse an attribute selector when part of a compound selector", t => {
  selector(t, ".foo[foo]", {
    type: SelectorType.CompoundSelector,
    left: {
      type: SelectorType.ClassSelector,
      name: "foo"
    },
    right: {
      type: SelectorType.AttributeSelector,
      name: "foo",
      value: null,
      matcher: null,
      modifier: 0
    }
  });
});

test("Can parse an attribute selector when part of a descendant selector", t => {
  selector(t, "div [foo]", {
    type: SelectorType.RelativeSelector,
    combinator: SelectorCombinator.Descendant,
    left: {
      type: SelectorType.TypeSelector,
      name: "div",
      namespace: null
    },
    right: {
      type: SelectorType.AttributeSelector,
      name: "foo",
      value: null,
      matcher: null,
      modifier: 0
    }
  });
});

test("Can parse an attribute selector when part of a compound selector relative to a class selector", t => {
  selector(t, ".foo div[foo]", {
    type: SelectorType.RelativeSelector,
    combinator: SelectorCombinator.Descendant,
    left: {
      type: SelectorType.ClassSelector,
      name: "foo"
    },
    right: {
      type: SelectorType.CompoundSelector,
      left: {
        type: SelectorType.TypeSelector,
        name: "div",
        namespace: null
      },
      right: {
        type: SelectorType.AttributeSelector,
        name: "foo",
        value: null,
        matcher: null,
        modifier: 0
      }
    }
  });
});

test("Can parse a pseudo-element selector", t => {
  selector(t, "::before", {
    type: SelectorType.PseudoElementSelector,
    name: "before"
  });
});

test("Can parse a pseudo-element selector when part of a compound selector", t => {
  selector(t, ".foo::before", {
    type: SelectorType.CompoundSelector,
    left: {
      type: SelectorType.ClassSelector,
      name: "foo"
    },
    right: {
      type: SelectorType.PseudoElementSelector,
      name: "before"
    }
  });
});

test("Can parse a pseudo-element selector when part of a descendant selector", t => {
  selector(t, "div ::before", {
    type: SelectorType.RelativeSelector,
    combinator: SelectorCombinator.Descendant,
    left: {
      type: SelectorType.TypeSelector,
      name: "div",
      namespace: null
    },
    right: {
      type: SelectorType.PseudoElementSelector,
      name: "before"
    }
  });
});

test("Can parse a pseudo-element selector when part of a compound selector relative to a class selector", t => {
  selector(t, ".foo div::before", {
    type: SelectorType.RelativeSelector,
    combinator: SelectorCombinator.Descendant,
    left: {
      type: SelectorType.ClassSelector,
      name: "foo"
    },
    right: {
      type: SelectorType.CompoundSelector,
      left: {
        type: SelectorType.TypeSelector,
        name: "div",
        namespace: null
      },
      right: {
        type: SelectorType.PseudoElementSelector,
        name: "before"
      }
    }
  });
});

test("Only allows pseudo-element selectors as the last selector", t => {
  selector(t, "::foo.foo", null);
  selector(t, "::foo+foo", null);
});

test("Can parse a named pseudo-class selector", t => {
  selector(t, ":hover", {
    type: SelectorType.PseudoClassSelector,
    name: "hover",
    value: null
  });
});

test("Can parse a functional pseudo-class selector", t => {
  selector(t, ":not(.foo)", {
    type: SelectorType.PseudoClassSelector,
    name: "not",
    value: {
      type: SelectorType.ClassSelector,
      name: "foo"
    }
  });
});

test("Can parse a pseudo-class selector when part of a compound selector", t => {
  selector(t, "div:hover", {
    type: SelectorType.CompoundSelector,
    left: {
      type: SelectorType.TypeSelector,
      name: "div",
      namespace: null
    },
    right: {
      type: SelectorType.PseudoClassSelector,
      name: "hover",
      value: null
    }
  });
});

test("Can parse a pseudo-class selector when part of a compound selector relative to a class selector", t => {
  selector(t, ".foo div:hover", {
    type: SelectorType.RelativeSelector,
    combinator: SelectorCombinator.Descendant,
    left: {
      type: SelectorType.ClassSelector,
      name: "foo"
    },
    right: {
      type: SelectorType.CompoundSelector,
      left: {
        type: SelectorType.TypeSelector,
        name: "div",
        namespace: null
      },
      right: {
        type: SelectorType.PseudoClassSelector,
        name: "hover",
        value: null
      }
    }
  });
});

test("Can parse a compound type, class, and pseudo-class selector relative to a class selector", t => {
  selector(t, ".foo div.bar:hover", {
    type: SelectorType.RelativeSelector,
    combinator: SelectorCombinator.Descendant,
    left: {
      type: SelectorType.ClassSelector,
      name: "foo"
    },
    right: {
      type: SelectorType.CompoundSelector,
      left: {
        type: SelectorType.TypeSelector,
        name: "div",
        namespace: null
      },
      right: {
        type: SelectorType.CompoundSelector,
        left: {
          type: SelectorType.ClassSelector,
          name: "bar"
        },
        right: {
          type: SelectorType.PseudoClassSelector,
          name: "hover",
          value: null
        }
      }
    }
  });
});

test("Can parse a simple selector relative to a compound selector", t => {
  selector(t, ".foo > div.bar", {
    type: SelectorType.RelativeSelector,
    combinator: SelectorCombinator.DirectDescendant,
    left: {
      type: SelectorType.ClassSelector,
      name: "foo"
    },
    right: {
      type: SelectorType.CompoundSelector,
      left: {
        type: SelectorType.TypeSelector,
        name: "div",
        namespace: null
      },
      right: {
        type: SelectorType.ClassSelector,
        name: "bar"
      }
    }
  });
});

test("Can parse a relative selector relative to a compound selector", t => {
  selector(t, ".foo > .bar + div.baz", {
    type: SelectorType.RelativeSelector,
    combinator: SelectorCombinator.DirectSibling,
    left: {
      type: SelectorType.RelativeSelector,
      combinator: SelectorCombinator.DirectDescendant,
      left: {
        type: SelectorType.ClassSelector,
        name: "foo"
      },
      right: {
        type: SelectorType.ClassSelector,
        name: "bar"
      }
    },
    right: {
      type: SelectorType.CompoundSelector,
      left: {
        type: SelectorType.TypeSelector,
        name: "div",
        namespace: null
      },
      right: {
        type: SelectorType.ClassSelector,
        name: "baz"
      }
    }
  });
});
