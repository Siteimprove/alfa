import { test } from "@siteimprove/alfa-test";

import { Lexer } from "@siteimprove/alfa-css";

import { Selector } from "../src/selector";
import { Context } from "../src/context";

function parse(input: string) {
  return Selector.parse(Lexer.lex(input)).map(([, selector]) => selector);
}

test(".parse() parses a type selector", (t) => {
  t.deepEqual(parse("div").getUnsafe().toJSON(), {
    type: "type",
    name: "div",
    namespace: null,
  });
});

test(".parse() parses an uppercase type selector", (t) => {
  t.deepEqual(parse("DIV").getUnsafe().toJSON(), {
    type: "type",
    name: "DIV",
    namespace: null,
  });
});

test(".parse() parses a type selector with a namespace", (t) => {
  t.deepEqual(parse("svg|a").getUnsafe().toJSON(), {
    type: "type",
    name: "a",
    namespace: "svg",
  });
});

test(".parse() parses a type selector with an empty namespace", (t) => {
  t.deepEqual(parse("|a").getUnsafe().toJSON(), {
    type: "type",
    name: "a",
    namespace: "",
  });
});

test(".parse() parses the universal selector with an empty namespace", (t) => {
  t.deepEqual(parse("|*").getUnsafe().toJSON(), {
    type: "universal",
    namespace: "",
  });
});

test(".parse() parses a type selector with the universal namespace", (t) => {
  t.deepEqual(parse("*|a").getUnsafe().toJSON(), {
    type: "type",
    name: "a",
    namespace: "*",
  });
});

test(".parse() parses the universal selector with the universal namespace", (t) => {
  t.deepEqual(parse("*|*").getUnsafe().toJSON(), {
    type: "universal",
    namespace: "*",
  });
});

test(".parse() parses a class selector", (t) => {
  t.deepEqual(parse(".foo").getUnsafe().toJSON(), {
    type: "class",
    name: "foo",
  });
});

test(".parse() parses an ID selector", (t) => {
  t.deepEqual(parse("#foo").getUnsafe().toJSON(), {
    type: "id",
    name: "foo",
  });
});

test(".parse() parses a compound selector", (t) => {
  t.deepEqual(parse("#foo.bar").getUnsafe().toJSON(), {
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
  t.deepEqual(parse("*").getUnsafe().toJSON(), {
    type: "universal",
    namespace: null,
  });
});

test(".parse() parses a compound selector with a type in prefix position", (t) => {
  t.deepEqual(parse("div.foo").getUnsafe().toJSON(), {
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
  t.deepEqual(parse("div .foo").getUnsafe().toJSON(), {
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
  t.deepEqual(parse("div span").getUnsafe().toJSON(), {
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
  t.deepEqual(parse("div .foo #bar").getUnsafe().toJSON(), {
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
  t.deepEqual(parse("div > .foo").getUnsafe().toJSON(), {
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
  t.deepEqual(parse("div ~ .foo").getUnsafe().toJSON(), {
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
  t.deepEqual(parse("div + .foo").getUnsafe().toJSON(), {
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
  t.deepEqual(parse(".foo, .bar, .baz").getUnsafe().toJSON(), {
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
  t.deepEqual(parse(".foo, #bar.baz").getUnsafe().toJSON(), {
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
  t.deepEqual(parse("div .foo, span .baz").getUnsafe().toJSON(), {
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
  t.deepEqual(parse("div ~ .foo, span ~ .baz").getUnsafe().toJSON(), {
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
  t.deepEqual(parse(".foo,.bar").getUnsafe().toJSON(), {
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
  t.deepEqual(parse(".foo div.bar").getUnsafe().toJSON(), {
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
  t.deepEqual(parse("span.foo div.bar").getUnsafe().toJSON(), {
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
  t.deepEqual(parse("div ~ span .foo").getUnsafe().toJSON(), {
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
  t.deepEqual(parse("[foo]").getUnsafe().toJSON(), {
    type: "attribute",
    name: "foo",
    namespace: null,
    value: null,
    matcher: null,
    modifier: null,
  });
});

test(".parse() parses an attribute selector with an ident value", (t) => {
  t.deepEqual(parse("[foo=bar]").getUnsafe().toJSON(), {
    type: "attribute",
    name: "foo",
    namespace: null,
    value: "bar",
    matcher: Selector.Attribute.Matcher.Equal,
    modifier: null,
  });
});

test(".parse() parses an attribute selector with a string value", (t) => {
  t.deepEqual(parse('[foo="bar"]').getUnsafe().toJSON(), {
    type: "attribute",
    name: "foo",
    namespace: null,
    value: "bar",
    matcher: Selector.Attribute.Matcher.Equal,
    modifier: null,
  });
});

test(".parse() parses an attribute selector with a matcher", (t) => {
  t.deepEqual(parse("[foo*=bar]").getUnsafe().toJSON(), {
    type: "attribute",
    name: "foo",
    namespace: null,
    value: "bar",
    matcher: Selector.Attribute.Matcher.Substring,
    modifier: null,
  });
});

test(".parse() parses an attribute selector with a casing modifier", (t) => {
  t.deepEqual(parse("[foo=bar i]").getUnsafe().toJSON(), {
    type: "attribute",
    name: "foo",
    namespace: null,
    value: "bar",
    matcher: Selector.Attribute.Matcher.Equal,
    modifier: "i",
  });
});

test(".parse() parses an attribute selector with a namespace", (t) => {
  t.deepEqual(parse("[foo|bar]").getUnsafe().toJSON(), {
    type: "attribute",
    name: "bar",
    namespace: "foo",
    value: null,
    matcher: null,
    modifier: null,
  });
});

test(".parse() parses an attribute selector with a namespace", (t) => {
  t.deepEqual(parse("[*|foo]").getUnsafe().toJSON(), {
    type: "attribute",
    name: "foo",
    namespace: "*",
    value: null,
    matcher: null,
    modifier: null,
  });
});

test(".parse() parses an attribute selector with a namespace", (t) => {
  t.deepEqual(parse("[|foo]").getUnsafe().toJSON(), {
    type: "attribute",
    name: "foo",
    namespace: "",
    value: null,
    matcher: null,
    modifier: null,
  });
});

test(".parse() parses an attribute selector with a namespace", (t) => {
  t.deepEqual(parse("[foo|bar=baz]").getUnsafe().toJSON(), {
    type: "attribute",
    name: "bar",
    namespace: "foo",
    value: "baz",
    matcher: Selector.Attribute.Matcher.Equal,
    modifier: null,
  });
});

test(".parse() parses an attribute selector with a namespace", (t) => {
  t.deepEqual(parse("[foo|bar|=baz]").getUnsafe().toJSON(), {
    type: "attribute",
    name: "bar",
    namespace: "foo",
    value: "baz",
    matcher: Selector.Attribute.Matcher.DashMatch,
    modifier: null,
  });
});

test(".parse() parses an attribute selector when part of a compound selector", (t) => {
  t.deepEqual(parse(".foo[foo]").getUnsafe().toJSON(), {
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
  t.deepEqual(parse("div [foo]").getUnsafe().toJSON(), {
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
  t.deepEqual(parse(".foo div[foo]").getUnsafe().toJSON(), {
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
  t.deepEqual(parse("::before").getUnsafe().toJSON(), {
    type: "pseudo-element",
    name: "before",
  });

  t.deepEqual(parse(":before").getUnsafe().toJSON(), {
    type: "pseudo-element",
    name: "before",
  });
});

test(`.parse() requires double colons on non-legacy pseudo-element selectors`, (t) => {
  t.deepEqual(parse(":backdrop").isErr(), true);
});

test(`.parse() parses ::cue both as functional and non-functional selector`, (t) => {
  t.deepEqual(parse("::cue(*)").getUnsafe().toJSON(), {
    type: "pseudo-element",
    name: "cue",
    selector: {
      type: "some",
      value: { type: "universal", namespace: null },
    },
  });

  t.deepEqual(parse("::cue").getUnsafe().toJSON(), {
    type: "pseudo-element",
    name: "cue",
    selector: {
      type: "none",
    },
  });
});

test(".parse() parses a pseudo-element selector when part of a compound selector", (t) => {
  t.deepEqual(parse(".foo::before").getUnsafe().toJSON(), {
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
  t.deepEqual(parse("div ::before").getUnsafe().toJSON(), {
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
  t.deepEqual(parse(".foo div::before").getUnsafe().toJSON(), {
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
  t.equal(parse("::foo.foo").isErr(), true);
  t.equal(parse("::foo+foo").isErr(), true);
});

test(".parse() parses a named pseudo-class selector", (t) => {
  t.deepEqual(parse(":hover").getUnsafe().toJSON(), {
    type: "pseudo-class",
    name: "hover",
  });
});

test(".parse() parses :host pseudo-class selector", (t) => {
  t.deepEqual(parse(":host").getUnsafe().toJSON(), {
    type: "pseudo-class",
    name: "host",
  });
});

test(".parse() parses a functional pseudo-class selector", (t) => {
  t.deepEqual(parse(":not(.foo)").getUnsafe().toJSON(), {
    type: "pseudo-class",
    name: "not",
    selector: {
      type: "class",
      name: "foo",
    },
  });
});

test(".parse() parses a pseudo-class selector when part of a compound selector", (t) => {
  t.deepEqual(parse("div:hover").getUnsafe().toJSON(), {
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
  t.deepEqual(parse(".foo div:hover").getUnsafe().toJSON(), {
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
  t.deepEqual(parse(".foo div.bar:hover").getUnsafe().toJSON(), {
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
  t.deepEqual(parse(".foo > div.bar").getUnsafe().toJSON(), {
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
  t.deepEqual(parse(".foo > .bar + div.baz").getUnsafe().toJSON(), {
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
  t.deepEqual(parse(":nth-child(odd)").getUnsafe().toJSON(), {
    type: "pseudo-class",
    name: "nth-child",
    index: {
      step: 2,
      offset: 1,
    },
  });
});

test("#matches() checks if an element matches an :nth-child selector", (t) => {
  const selector = parse(":nth-child(odd)").getUnsafe();

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
  const selector = parse(":nth-last-child(odd)").getUnsafe();

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
  const selector = parse(":first-child").getUnsafe();

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
  const selector = parse(":last-child").getUnsafe();

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
  const selector = parse(":only-child").getUnsafe();

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
  const selector = parse(":nth-of-type(odd)").getUnsafe();

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
  const selector = parse(":nth-last-of-type(odd)").getUnsafe();

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
  const selector = parse(":first-of-type").getUnsafe();

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
  const selector = parse(":last-of-type").getUnsafe();

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
  const selector = parse(":only-of-type").getUnsafe();

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

test("#matches() checks if an element matches a :hover selector", (t) => {
  const selector = parse(":hover").getUnsafe();

  const p = <p />;

  t.equal(selector.matches(p), false);
  t.equal(selector.matches(p, Context.hover(p)), true);
});

test("#matches() checks if an element matches a :hover selector when its descendant is hovered", (t) => {
  const selector = parse(":hover").getUnsafe();

  const target = <span> Hello </span>;
  const p = <div> {target} </div>;

  t.equal(selector.matches(p, Context.hover(target)), true);
});

test("#matches() checks if an element matches an :active selector", (t) => {
  const selector = parse(":active").getUnsafe();

  const p = <p />;

  t.equal(selector.matches(p), false);
  t.equal(selector.matches(p, Context.active(p)), true);
});

test("#matches() checks if an element matches a :focus selector", (t) => {
  const selector = parse(":focus").getUnsafe();

  const p = <p />;

  t.equal(selector.matches(p), false);
  t.equal(selector.matches(p, Context.focus(p)), true);
});

test("#matches() checks if an element matches a :focus-within selector", (t) => {
  const selector = parse(":focus-within").getUnsafe();

  const button = <button />;
  const p = <p>{button}</p>;

  t.equal(selector.matches(p), false);
  t.equal(selector.matches(p, Context.focus(p)), true);
  t.equal(selector.matches(p, Context.focus(button)), true);
});

test("#matches() checks if an element matches a :link selector", (t) => {
  const selector = parse(":link").getUnsafe();

  // These elements are links
  for (const element of [
    <a href="#" />,
    <area href="#" />,
    <link href="#" />,
  ]) {
    t.equal(selector.matches(element), true, element.toString());

    // Only non-visited links match :link
    t.equal(
      selector.matches(element, Context.visit(element)),
      false,
      element.toString(),
    );
  }

  // These elements aren't links
  for (const element of [<a />, <p />]) {
    t.equal(selector.matches(element), false, element.toString());
  }
});

test("#matches() checks if an element matches a :visited selector", (t) => {
  const selector = parse(":visited").getUnsafe();

  // These elements are links
  for (const element of [
    <a href="#" />,
    <area href="#" />,
    <link href="#" />,
  ]) {
    t.equal(
      selector.matches(element, Context.visit(element)),
      true,
      element.toString(),
    );

    // Only visited links match :link
    t.equal(selector.matches(element), false, element.toString());
  }

  // These elements aren't links
  for (const element of [<a />, <p />]) {
    t.equal(selector.matches(element), false, element.toString());
  }
});
