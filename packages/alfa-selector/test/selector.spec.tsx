import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Selector } from "../src/selector";

test(".parse() parses a type selector", (t) => {
  t.deepEqual(Selector.parse("div").get().toJSON(), {
    type: "type",
    name: "div",
    namespace: null,
  });
});

test(".parse() parses an uppercase type selector", (t) => {
  t.deepEqual(Selector.parse("DIV").get().toJSON(), {
    type: "type",
    name: "DIV",
    namespace: null,
  });
});

test(".parse() parses a type selector with a namespace", (t) => {
  t.deepEqual(Selector.parse("svg|a").get().toJSON(), {
    type: "type",
    name: "a",
    namespace: "svg",
  });
});

test(".parse() parses a type selector with an empty namespace", (t) => {
  t.deepEqual(Selector.parse("|a").get().toJSON(), {
    type: "type",
    name: "a",
    namespace: "",
  });
});

test(".parse() parses the universal selector with an empty namespace", (t) => {
  t.deepEqual(Selector.parse("|*").get().toJSON(), {
    type: "universal",
    namespace: "",
  });
});

test(".parse() parses a type selector with the universal namespace", (t) => {
  t.deepEqual(Selector.parse("*|a").get().toJSON(), {
    type: "type",
    name: "a",
    namespace: "*",
  });
});

test(".parse() parses the universal selector with the universal namespace", (t) => {
  t.deepEqual(Selector.parse("*|*").get().toJSON(), {
    type: "universal",
    namespace: "*",
  });
});

test(".parse() parses a class selector", (t) => {
  t.deepEqual(Selector.parse(".foo").get().toJSON(), {
    type: "class",
    name: "foo",
  });
});

test(".parse() parses an ID selector", (t) => {
  t.deepEqual(Selector.parse("#foo").get().toJSON(), {
    type: "id",
    name: "foo",
  });
});

test(".parse() parses a compound selector", (t) => {
  t.deepEqual(Selector.parse("#foo.bar").get().toJSON(), {
    type: "compound",
    left: {
      type: "id",
      name: "foo",
    },
    right: {
      type: "class",
      name: "bar",
    },
  });
});

test(".parse() parses the universal selector", (t) => {
  t.deepEqual(Selector.parse("*").get().toJSON(), {
    type: "universal",
    namespace: null,
  });
});

test(".parse() parses a compound selector with a type in prefix position", (t) => {
  t.deepEqual(Selector.parse("div.foo").get().toJSON(), {
    type: "compound",
    left: {
      type: "type",
      name: "div",
      namespace: null,
    },
    right: {
      type: "class",
      name: "foo",
    },
  });
});

test(".parse() parses a single descendant selector", (t) => {
  t.deepEqual(Selector.parse("div .foo").get().toJSON(), {
    type: "complex",
    combinator: Selector.Combinator.Descendant,
    left: {
      type: "type",
      name: "div",
      namespace: null,
    },
    right: {
      type: "class",
      name: "foo",
    },
  });
});

test(".parse() parses a single descendant selector with a right-hand type selector", (t) => {
  t.deepEqual(Selector.parse("div span").get().toJSON(), {
    type: "complex",
    combinator: Selector.Combinator.Descendant,
    left: {
      type: "type",
      name: "div",
      namespace: null,
    },
    right: {
      type: "type",
      name: "span",
      namespace: null,
    },
  });
});

test(".parse() parses a double descendant selector", (t) => {
  t.deepEqual(Selector.parse("div .foo #bar").get().toJSON(), {
    type: "complex",
    combinator: Selector.Combinator.Descendant,
    left: {
      type: "complex",
      combinator: Selector.Combinator.Descendant,
      left: {
        type: "type",
        name: "div",
        namespace: null,
      },
      right: {
        type: "class",
        name: "foo",
      },
    },
    right: {
      type: "id",
      name: "bar",
    },
  });
});

test(".parse() parses a direct descendant selector", (t) => {
  t.deepEqual(Selector.parse("div > .foo").get().toJSON(), {
    type: "complex",
    combinator: Selector.Combinator.DirectDescendant,
    left: {
      type: "type",
      name: "div",
      namespace: null,
    },
    right: {
      type: "class",
      name: "foo",
    },
  });
});

test(".parse() parses a sibling selector", (t) => {
  t.deepEqual(Selector.parse("div ~ .foo").get().toJSON(), {
    type: "complex",
    combinator: Selector.Combinator.Sibling,
    left: {
      type: "type",
      name: "div",
      namespace: null,
    },
    right: {
      type: "class",
      name: "foo",
    },
  });
});

test(".parse() parses a direct sibling selector", (t) => {
  t.deepEqual(Selector.parse("div + .foo").get().toJSON(), {
    type: "complex",
    combinator: Selector.Combinator.DirectSibling,
    left: {
      type: "type",
      name: "div",
      namespace: null,
    },
    right: {
      type: "class",
      name: "foo",
    },
  });
});

test(".parse() parses a list of simple selectors", (t) => {
  t.deepEqual(Selector.parse(".foo, .bar, .baz").get().toJSON(), {
    type: "list",
    left: {
      type: "class",
      name: "foo",
    },
    right: {
      type: "list",
      left: {
        type: "class",
        name: "bar",
      },
      right: {
        type: "class",
        name: "baz",
      },
    },
  });
});

test(".parse() parses a list of simple and compound selectors", (t) => {
  t.deepEqual(Selector.parse(".foo, #bar.baz").get().toJSON(), {
    type: "list",
    left: {
      type: "class",
      name: "foo",
    },
    right: {
      type: "compound",
      left: {
        type: "id",
        name: "bar",
      },
      right: {
        type: "class",
        name: "baz",
      },
    },
  });
});

test(".parse() parses a list of descendant selectors", (t) => {
  t.deepEqual(Selector.parse("div .foo, span .baz").get().toJSON(), {
    type: "list",
    left: {
      type: "complex",
      combinator: Selector.Combinator.Descendant,
      left: {
        type: "type",
        name: "div",
        namespace: null,
      },
      right: {
        type: "class",
        name: "foo",
      },
    },
    right: {
      type: "complex",
      combinator: Selector.Combinator.Descendant,
      left: {
        type: "type",
        name: "span",
        namespace: null,
      },
      right: {
        type: "class",
        name: "baz",
      },
    },
  });
});

test(".parse() parses a list of sibling selectors", (t) => {
  t.deepEqual(Selector.parse("div ~ .foo, span ~ .baz").get().toJSON(), {
    type: "list",
    left: {
      type: "complex",
      combinator: Selector.Combinator.Sibling,
      left: {
        type: "type",
        name: "div",
        namespace: null,
      },
      right: {
        type: "class",
        name: "foo",
      },
    },
    right: {
      type: "complex",
      combinator: Selector.Combinator.Sibling,
      left: {
        type: "type",
        name: "span",
        namespace: null,
      },
      right: {
        type: "class",
        name: "baz",
      },
    },
  });
});

test(".parse() parses a list of selectors with no whitespace", (t) => {
  t.deepEqual(Selector.parse(".foo,.bar").get().toJSON(), {
    type: "list",
    left: {
      type: "class",
      name: "foo",
    },
    right: {
      type: "class",
      name: "bar",
    },
  });
});

test(".parse() parses a compound selector relative to a class selector", (t) => {
  t.deepEqual(Selector.parse(".foo div.bar").get().toJSON(), {
    type: "complex",
    combinator: Selector.Combinator.Descendant,
    left: {
      type: "class",
      name: "foo",
    },
    right: {
      type: "compound",
      left: {
        type: "type",
        name: "div",
        namespace: null,
      },
      right: {
        type: "class",
        name: "bar",
      },
    },
  });
});

test(".parse() parses a compound selector relative to a compound selector", (t) => {
  t.deepEqual(Selector.parse("span.foo div.bar").get().toJSON(), {
    type: "complex",
    combinator: Selector.Combinator.Descendant,
    left: {
      type: "compound",
      left: {
        type: "type",
        name: "span",
        namespace: null,
      },
      right: {
        type: "class",
        name: "foo",
      },
    },
    right: {
      type: "compound",
      left: {
        type: "type",
        name: "div",
        namespace: null,
      },
      right: {
        type: "class",
        name: "bar",
      },
    },
  });
});

test(".parse() parses a descendant selector relative to a sibling selector", (t) => {
  t.deepEqual(Selector.parse("div ~ span .foo").get().toJSON(), {
    type: "complex",
    combinator: Selector.Combinator.Descendant,
    left: {
      type: "complex",
      combinator: Selector.Combinator.Sibling,
      left: {
        type: "type",
        name: "div",
        namespace: null,
      },
      right: {
        type: "type",
        name: "span",
        namespace: null,
      },
    },
    right: {
      type: "class",
      name: "foo",
    },
  });
});

test(".parse() parses an attribute selector without a value", (t) => {
  t.deepEqual(Selector.parse("[foo]").get().toJSON(), {
    type: "attribute",
    name: "foo",
    namespace: null,
    value: null,
    matcher: null,
    modifier: null,
  });
});

test(".parse() parses an attribute selector with an ident value", (t) => {
  t.deepEqual(Selector.parse("[foo=bar]").get().toJSON(), {
    type: "attribute",
    name: "foo",
    namespace: null,
    value: "bar",
    matcher: Selector.Attribute.Matcher.Equal,
    modifier: null,
  });
});

test(".parse() parses an attribute selector with a string value", (t) => {
  t.deepEqual(Selector.parse('[foo="bar"]').get().toJSON(), {
    type: "attribute",
    name: "foo",
    namespace: null,
    value: "bar",
    matcher: Selector.Attribute.Matcher.Equal,
    modifier: null,
  });
});

test(".parse() parses an attribute selector with a matcher", (t) => {
  t.deepEqual(Selector.parse("[foo*=bar]").get().toJSON(), {
    type: "attribute",
    name: "foo",
    namespace: null,
    value: "bar",
    matcher: Selector.Attribute.Matcher.Substring,
    modifier: null,
  });
});

test(".parse() parses an attribute selector with a casing modifier", (t) => {
  t.deepEqual(Selector.parse("[foo=bar i]").get().toJSON(), {
    type: "attribute",
    name: "foo",
    namespace: null,
    value: "bar",
    matcher: Selector.Attribute.Matcher.Equal,
    modifier: "i",
  });
});

test(".parse() parses an attribute selector with a namespace", (t) => {
  t.deepEqual(Selector.parse("[foo|bar]").get().toJSON(), {
    type: "attribute",
    name: "bar",
    namespace: "foo",
    value: null,
    matcher: null,
    modifier: null,
  });
});

test(".parse() parses an attribute selector with a namespace", (t) => {
  t.deepEqual(Selector.parse("[*|foo]").get().toJSON(), {
    type: "attribute",
    name: "foo",
    namespace: "*",
    value: null,
    matcher: null,
    modifier: null,
  });
});

test(".parse() parses an attribute selector with a namespace", (t) => {
  t.deepEqual(Selector.parse("[|foo]").get().toJSON(), {
    type: "attribute",
    name: "foo",
    namespace: "",
    value: null,
    matcher: null,
    modifier: null,
  });
});

test(".parse() parses an attribute selector with a namespace", (t) => {
  t.deepEqual(Selector.parse("[foo|bar=baz]").get().toJSON(), {
    type: "attribute",
    name: "bar",
    namespace: "foo",
    value: "baz",
    matcher: Selector.Attribute.Matcher.Equal,
    modifier: null,
  });
});

test(".parse() parses an attribute selector with a namespace", (t) => {
  t.deepEqual(Selector.parse("[foo|bar|=baz]").get().toJSON(), {
    type: "attribute",
    name: "bar",
    namespace: "foo",
    value: "baz",
    matcher: Selector.Attribute.Matcher.DashMatch,
    modifier: null,
  });
});

test(".parse() parses an attribute selector when part of a compound selector", (t) => {
  t.deepEqual(Selector.parse(".foo[foo]").get().toJSON(), {
    type: "compound",
    left: {
      type: "class",
      name: "foo",
    },
    right: {
      type: "attribute",
      name: "foo",
      namespace: null,
      value: null,
      matcher: null,
      modifier: null,
    },
  });
});

test(".parse() parses an attribute selector when part of a descendant selector", (t) => {
  t.deepEqual(Selector.parse("div [foo]").get().toJSON(), {
    type: "complex",
    combinator: Selector.Combinator.Descendant,
    left: {
      type: "type",
      name: "div",
      namespace: null,
    },
    right: {
      type: "attribute",
      name: "foo",
      namespace: null,
      value: null,
      matcher: null,
      modifier: null,
    },
  });
});

test(".parse() parses an attribute selector when part of a compound selector relative to a class selector", (t) => {
  t.deepEqual(Selector.parse(".foo div[foo]").get().toJSON(), {
    type: "complex",
    combinator: Selector.Combinator.Descendant,
    left: {
      type: "class",
      name: "foo",
    },
    right: {
      type: "compound",
      left: {
        type: "type",
        name: "div",
        namespace: null,
      },
      right: {
        type: "attribute",
        name: "foo",
        namespace: null,
        value: null,
        matcher: null,
        modifier: null,
      },
    },
  });
});

test(".parse() parses a pseudo-element selector", (t) => {
  t.deepEqual(Selector.parse("::before").get().toJSON(), {
    type: "pseudo-element",
    name: "before",
  });
});

test(".parse() parses a pseudo-element selector when part of a compound selector", (t) => {
  t.deepEqual(Selector.parse(".foo::before").get().toJSON(), {
    type: "compound",
    left: {
      type: "class",
      name: "foo",
    },
    right: {
      type: "pseudo-element",
      name: "before",
    },
  });
});

test(".parse() parses a pseudo-element selector when part of a descendant selector", (t) => {
  t.deepEqual(Selector.parse("div ::before").get().toJSON(), {
    type: "complex",
    combinator: Selector.Combinator.Descendant,
    left: {
      type: "type",
      name: "div",
      namespace: null,
    },
    right: {
      type: "pseudo-element",
      name: "before",
    },
  });
});

test(".parse() parses a pseudo-element selector when part of a compound selector relative to a class selector", (t) => {
  t.deepEqual(Selector.parse(".foo div::before").get().toJSON(), {
    type: "complex",
    combinator: Selector.Combinator.Descendant,
    left: {
      type: "class",
      name: "foo",
    },
    right: {
      type: "compound",
      left: {
        type: "type",
        name: "div",
        namespace: null,
      },
      right: {
        type: "pseudo-element",
        name: "before",
      },
    },
  });
});

test(".parse() only allows pseudo-element selectors as the last selector", (t) => {
  t.equal(Selector.parse("::foo.foo").isNone(), true);
  t.equal(Selector.parse("::foo+foo").isNone(), true);
});

test(".parse() parses a named pseudo-class selector", (t) => {
  t.deepEqual(Selector.parse(":hover").get().toJSON(), {
    type: "pseudo-class",
    name: "hover",
  });
});

test(".parse() parses a functional pseudo-class selector", (t) => {
  t.deepEqual(Selector.parse(":not(.foo)").get().toJSON(), {
    type: "pseudo-class",
    name: "not",
    selector: {
      type: "class",
      name: "foo",
    },
  });
});

test(".parse() parses a pseudo-class selector when part of a compound selector", (t) => {
  t.deepEqual(Selector.parse("div:hover").get().toJSON(), {
    type: "compound",
    left: {
      type: "type",
      name: "div",
      namespace: null,
    },
    right: {
      type: "pseudo-class",
      name: "hover",
    },
  });
});

test(".parse() parses a pseudo-class selector when part of a compound selector relative to a class selector", (t) => {
  t.deepEqual(Selector.parse(".foo div:hover").get().toJSON(), {
    type: "complex",
    combinator: Selector.Combinator.Descendant,
    left: {
      type: "class",
      name: "foo",
    },
    right: {
      type: "compound",
      left: {
        type: "type",
        name: "div",
        namespace: null,
      },
      right: {
        type: "pseudo-class",
        name: "hover",
      },
    },
  });
});

test(".parse() parses a compound type, class, and pseudo-class selector relative to a class selector", (t) => {
  t.deepEqual(Selector.parse(".foo div.bar:hover").get().toJSON(), {
    type: "complex",
    combinator: Selector.Combinator.Descendant,
    left: {
      type: "class",
      name: "foo",
    },
    right: {
      type: "compound",
      left: {
        type: "type",
        name: "div",
        namespace: null,
      },
      right: {
        type: "compound",
        left: {
          type: "class",
          name: "bar",
        },
        right: {
          type: "pseudo-class",
          name: "hover",
        },
      },
    },
  });
});

test(".parse() parses a simple selector relative to a compound selector", (t) => {
  t.deepEqual(Selector.parse(".foo > div.bar").get().toJSON(), {
    type: "complex",
    combinator: Selector.Combinator.DirectDescendant,
    left: {
      type: "class",
      name: "foo",
    },
    right: {
      type: "compound",
      left: {
        type: "type",
        name: "div",
        namespace: null,
      },
      right: {
        type: "class",
        name: "bar",
      },
    },
  });
});

test(".parse() parses a relative selector relative to a compound selector", (t) => {
  t.deepEqual(Selector.parse(".foo > .bar + div.baz").get().toJSON(), {
    type: "complex",
    combinator: Selector.Combinator.DirectSibling,
    left: {
      type: "complex",
      combinator: Selector.Combinator.DirectDescendant,
      left: {
        type: "class",
        name: "foo",
      },
      right: {
        type: "class",
        name: "bar",
      },
    },
    right: {
      type: "compound",
      left: {
        type: "type",
        name: "div",
        namespace: null,
      },
      right: {
        type: "class",
        name: "baz",
      },
    },
  });
});

test(".parse() parses an :nth-child selector", (t) => {
  t.deepEqual(Selector.parse(":nth-child(odd)").get().toJSON(), {
    type: "pseudo-class",
    name: "nth-child",
    index: {
      step: 2,
      offset: 1,
    },
  });
});

test("#matches() checks if an element matches an :nth-child selector", (t) => {
  const selector = Selector.parse(":nth-child(odd)").get();

  const a = <p />;
  const b = <p />;
  const c = <p />;
  const d = <p />;

  <div>
    {a}
    Hello
    {b}
    {c}
    {d}
  </div>;

  t.equal(selector.matches(a), true);
  t.equal(selector.matches(b), false);
  t.equal(selector.matches(c), true);
  t.equal(selector.matches(d), false);
});

test("#matches() checks if an element matches an :nth-last-child selector", (t) => {
  const selector = Selector.parse(":nth-last-child(odd)").get();

  const a = <p />;
  const b = <p />;
  const c = <p />;
  const d = <p />;

  <div>
    {a}
    Hello
    {b}
    {c}
    {d}
  </div>;

  t.equal(selector.matches(a), false);
  t.equal(selector.matches(b), true);
  t.equal(selector.matches(c), false);
  t.equal(selector.matches(d), true);
});

test("#matches() checks if an element matches a :first-child selector", (t) => {
  const selector = Selector.parse(":first-child").get();

  const a = <p />;
  const b = <p />;

  <div>
    Hello
    {a}
    {b}
  </div>;

  t.equal(selector.matches(a), true);
  t.equal(selector.matches(b), false);
});

test("#matches() checks if an element matches a :last-child selector", (t) => {
  const selector = Selector.parse(":last-child").get();

  const a = <p />;
  const b = <p />;

  <div>
    {a}
    {b}
    Hello
  </div>;

  t.equal(selector.matches(a), false);
  t.equal(selector.matches(b), true);
});

test("#matches() checks if an element matches an :only-child selector", (t) => {
  const selector = Selector.parse(":only-child").get();

  const a = <p />;
  const b = <p />;

  <div>
    {a}
    Hello
  </div>;

  <div>
    {b}
    <p />
    Hello
  </div>;

  t.equal(selector.matches(a), true);
  t.equal(selector.matches(b), false);
});

test("#matches() checks if an element matches an :nth-of-type selector", (t) => {
  const selector = Selector.parse(":nth-of-type(odd)").get();

  const a = <p />;
  const b = <p />;
  const c = <p />;
  const d = <p />;

  <div>
    <div />
    {a}
    Hello
    <span />
    {b}
    {c}
    {d}
  </div>;

  t.equal(selector.matches(a), true);
  t.equal(selector.matches(b), false);
  t.equal(selector.matches(c), true);
  t.equal(selector.matches(d), false);
});

test("#matches() checks if an element matches an :nth-last-of-type selector", (t) => {
  const selector = Selector.parse(":nth-last-of-type(odd)").get();

  const a = <p />;
  const b = <p />;
  const c = <p />;
  const d = <p />;

  <div>
    {a}
    {b}
    {c}
    <div />
    {d}
    Hello
    <span />
  </div>;

  t.equal(selector.matches(a), false);
  t.equal(selector.matches(b), true);
  t.equal(selector.matches(c), false);
  t.equal(selector.matches(d), true);
});

test("#matches() checks if an element matches a :first-of-type selector", (t) => {
  const selector = Selector.parse(":first-of-type").get();

  const a = <p />;
  const b = <p />;

  <div>
    <div />
    Hello
    {a}
    {b}
  </div>;

  t.equal(selector.matches(a), true);
  t.equal(selector.matches(b), false);
});

test("#matches() checks if an element matches a :last-of-type selector", (t) => {
  const selector = Selector.parse(":last-of-type").get();

  const a = <p />;
  const b = <p />;

  <div>
    {a}
    {b}
    Hello
    <div />
  </div>;

  t.equal(selector.matches(a), false);
  t.equal(selector.matches(b), true);
});

test("#matches() checks if an element matches a :only-of-type selector", (t) => {
  const selector = Selector.parse(":only-of-type").get();

  const a = <p />;
  const b = <p />;

  <div>
    {a}
    Hello
    <div />
  </div>;

  <div>
    {b}
    <p />
    Hello
    <div />
  </div>;

  t.equal(selector.matches(a), true);
  t.equal(selector.matches(b), false);
});
