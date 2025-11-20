import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { Combinator } from "../dist/index.js";
import { parse, serialize } from "./parser.js";

test(".parse() parses a single descendant selector", (t) => {
  t.deepEqual(serialize("div .foo"), {
    type: "complex",
    combinator: Combinator.Descendant,
    left: {
      type: "type",
      name: "div",
      namespace: null,
      specificity: { a: 0, b: 0, c: 1 },
      key: "div",
    },
    right: {
      type: "class",
      name: "foo",
      specificity: { a: 0, b: 1, c: 0 },
      key: ".foo",
    },
    specificity: { a: 0, b: 1, c: 1 },
    key: ".foo",
  });
});

test(".parse() parses a single descendant selector with a right-hand type selector", (t) => {
  t.deepEqual(serialize("div span"), {
    type: "complex",
    combinator: Combinator.Descendant,
    left: {
      type: "type",
      name: "div",
      namespace: null,
      specificity: { a: 0, b: 0, c: 1 },
      key: "div",
    },
    right: {
      type: "type",
      name: "span",
      namespace: null,
      specificity: { a: 0, b: 0, c: 1 },
      key: "span",
    },
    specificity: { a: 0, b: 0, c: 2 },
    key: "span",
  });
});

test(".parse() parses a double descendant selector", (t) => {
  t.deepEqual(serialize("div .foo #bar"), {
    type: "complex",
    combinator: Combinator.Descendant,
    left: {
      type: "complex",
      combinator: Combinator.Descendant,
      left: {
        type: "type",
        name: "div",
        namespace: null,
        specificity: { a: 0, b: 0, c: 1 },
        key: "div",
      },
      right: {
        type: "class",
        name: "foo",
        specificity: { a: 0, b: 1, c: 0 },
        key: ".foo",
      },
      specificity: { a: 0, b: 1, c: 1 },
      key: ".foo",
    },
    right: {
      type: "id",
      name: "bar",
      specificity: { a: 1, b: 0, c: 0 },
      key: "#bar",
    },
    specificity: { a: 1, b: 1, c: 1 },
    key: "#bar",
  });
});

test(".parse() parses a direct descendant selector", (t) => {
  t.deepEqual(serialize("div > .foo"), {
    type: "complex",
    combinator: Combinator.DirectDescendant,
    left: {
      type: "type",
      name: "div",
      namespace: null,
      specificity: { a: 0, b: 0, c: 1 },
      key: "div",
    },
    right: {
      type: "class",
      name: "foo",
      specificity: { a: 0, b: 1, c: 0 },
      key: ".foo",
    },
    specificity: { a: 0, b: 1, c: 1 },
    key: ".foo",
  });
});

test(".parse() parses a sibling selector", (t) => {
  t.deepEqual(serialize("div ~ .foo"), {
    type: "complex",
    combinator: Combinator.Sibling,
    left: {
      type: "type",
      name: "div",
      namespace: null,
      specificity: { a: 0, b: 0, c: 1 },
      key: "div",
    },
    right: {
      type: "class",
      name: "foo",
      specificity: { a: 0, b: 1, c: 0 },
      key: ".foo",
    },
    specificity: { a: 0, b: 1, c: 1 },
    key: ".foo",
  });
});

test(".parse() parses a direct sibling selector", (t) => {
  t.deepEqual(serialize("div + .foo"), {
    type: "complex",
    combinator: Combinator.DirectSibling,
    left: {
      type: "type",
      name: "div",
      namespace: null,
      specificity: { a: 0, b: 0, c: 1 },
      key: "div",
    },
    right: {
      type: "class",
      name: "foo",
      specificity: { a: 0, b: 1, c: 0 },
      key: ".foo",
    },
    specificity: { a: 0, b: 1, c: 1 },
    key: ".foo",
  });
});

test(".parse() parses a compound selector relative to a class selector", (t) => {
  t.deepEqual(serialize(".foo div.bar"), {
    type: "complex",
    combinator: Combinator.Descendant,
    left: {
      type: "class",
      name: "foo",
      specificity: { a: 0, b: 1, c: 0 },
      key: ".foo",
    },
    right: {
      type: "compound",
      selectors: [
        {
          type: "type",
          name: "div",
          namespace: null,
          specificity: { a: 0, b: 0, c: 1 },
          key: "div",
        },
        {
          type: "class",
          name: "bar",
          specificity: { a: 0, b: 1, c: 0 },
          key: ".bar",
        },
      ],
      specificity: { a: 0, b: 1, c: 1 },
      key: ".bar",
    },
    specificity: { a: 0, b: 2, c: 1 },
    key: ".bar",
  });
});

test(".parse() parses a compound selector relative to a compound selector", (t) => {
  t.deepEqual(serialize("span.foo div.bar"), {
    type: "complex",
    combinator: Combinator.Descendant,
    left: {
      type: "compound",
      selectors: [
        {
          type: "type",
          name: "span",
          namespace: null,
          specificity: { a: 0, b: 0, c: 1 },
          key: "span",
        },
        {
          type: "class",
          name: "foo",
          specificity: { a: 0, b: 1, c: 0 },
          key: ".foo",
        },
      ],
      specificity: { a: 0, b: 1, c: 1 },
      key: ".foo",
    },
    right: {
      type: "compound",
      selectors: [
        {
          type: "type",
          name: "div",
          namespace: null,
          specificity: { a: 0, b: 0, c: 1 },
          key: "div",
        },
        {
          type: "class",
          name: "bar",
          specificity: { a: 0, b: 1, c: 0 },
          key: ".bar",
        },
      ],
      specificity: { a: 0, b: 1, c: 1 },
      key: ".bar",
    },
    specificity: { a: 0, b: 2, c: 2 },
    key: ".bar",
  });
});

test(".parse() parses a descendant selector relative to a sibling selector", (t) => {
  t.deepEqual(serialize("div ~ span .foo"), {
    type: "complex",
    combinator: Combinator.Descendant,
    left: {
      type: "complex",
      combinator: Combinator.Sibling,
      left: {
        type: "type",
        name: "div",
        namespace: null,
        specificity: { a: 0, b: 0, c: 1 },
        key: "div",
      },
      right: {
        type: "type",
        name: "span",
        namespace: null,
        specificity: { a: 0, b: 0, c: 1 },
        key: "span",
      },
      specificity: { a: 0, b: 0, c: 2 },
      key: "span",
    },
    right: {
      type: "class",
      name: "foo",
      specificity: { a: 0, b: 1, c: 0 },
      key: ".foo",
    },
    specificity: { a: 0, b: 1, c: 2 },
    key: ".foo",
  });
});

test(".parse() parses an attribute selector when part of a descendant selector", (t) => {
  t.deepEqual(serialize("div [foo]"), {
    type: "complex",
    combinator: Combinator.Descendant,
    left: {
      type: "type",
      name: "div",
      namespace: null,
      specificity: { a: 0, b: 0, c: 1 },
      key: "div",
    },
    right: {
      type: "attribute",
      name: "foo",
      namespace: null,
      value: null,
      matcher: null,
      modifier: null,
      specificity: { a: 0, b: 1, c: 0 },
    },
    specificity: { a: 0, b: 1, c: 1 },
  });
});

test(".parse() parses an attribute selector when part of a compound selector relative to a class selector", (t) => {
  t.deepEqual(serialize(".foo div[foo]"), {
    type: "complex",
    combinator: Combinator.Descendant,
    left: {
      type: "class",
      name: "foo",
      specificity: { a: 0, b: 1, c: 0 },
      key: ".foo",
    },
    right: {
      type: "compound",
      selectors: [
        {
          type: "type",
          name: "div",
          namespace: null,
          specificity: { a: 0, b: 0, c: 1 },
          key: "div",
        },
        {
          type: "attribute",
          name: "foo",
          namespace: null,
          value: null,
          matcher: null,
          modifier: null,
          specificity: { a: 0, b: 1, c: 0 },
        },
      ],
      specificity: { a: 0, b: 1, c: 1 },
      key: "div",
    },
    specificity: { a: 0, b: 2, c: 1 },
    key: "div",
  });
});

test(".parse() parses a pseudo-element selector when part of a descendant selector", (t) => {
  t.deepEqual(serialize("div ::before"), {
    type: "complex",
    combinator: Combinator.Descendant,
    left: {
      type: "type",
      name: "div",
      namespace: null,
      specificity: { a: 0, b: 0, c: 1 },
      key: "div",
    },
    right: {
      type: "pseudo-element",
      name: "before",
      specificity: { a: 0, b: 0, c: 1 },
    },
    specificity: { a: 0, b: 0, c: 2 },
  });
});

test(".parse() parses a pseudo-element selector when part of a compound selector relative to a class selector", (t) => {
  t.deepEqual(serialize(".foo div::before"), {
    type: "complex",
    combinator: Combinator.Descendant,
    left: {
      type: "class",
      name: "foo",
      specificity: { a: 0, b: 1, c: 0 },
      key: ".foo",
    },
    right: {
      type: "compound",
      selectors: [
        {
          type: "type",
          name: "div",
          namespace: null,
          specificity: { a: 0, b: 0, c: 1 },
          key: "div",
        },
        {
          type: "pseudo-element",
          name: "before",
          specificity: { a: 0, b: 0, c: 1 },
        },
      ],
      specificity: { a: 0, b: 0, c: 2 },
      key: "div",
    },
    specificity: { a: 0, b: 1, c: 2 },
    key: "div",
  });
});

test(".parse() parses a pseudo-class selector when part of a compound selector relative to a class selector", (t) => {
  t.deepEqual(serialize(".foo div:hover"), {
    type: "complex",
    combinator: Combinator.Descendant,
    left: {
      type: "class",
      name: "foo",
      specificity: { a: 0, b: 1, c: 0 },
      key: ".foo",
    },
    right: {
      type: "compound",
      selectors: [
        {
          type: "type",
          name: "div",
          namespace: null,
          specificity: { a: 0, b: 0, c: 1 },
          key: "div",
        },
        {
          type: "pseudo-class",
          name: "hover",
          specificity: { a: 0, b: 1, c: 0 },
        },
      ],
      specificity: { a: 0, b: 1, c: 1 },
      key: "div",
    },
    specificity: { a: 0, b: 2, c: 1 },
    key: "div",
  });
});

test(".parse() parses a compound type, class, and pseudo-class selector relative to a class selector", (t) => {
  t.deepEqual(serialize(".foo div.bar:hover"), {
    type: "complex",
    combinator: Combinator.Descendant,
    left: {
      type: "class",
      name: "foo",
      specificity: { a: 0, b: 1, c: 0 },
      key: ".foo",
    },
    right: {
      type: "compound",
      selectors: [
        {
          type: "type",
          name: "div",
          namespace: null,
          specificity: { a: 0, b: 0, c: 1 },
          key: "div",
        },
        {
          type: "class",
          name: "bar",
          specificity: { a: 0, b: 1, c: 0 },
          key: ".bar",
        },
        {
          type: "pseudo-class",
          name: "hover",
          specificity: { a: 0, b: 1, c: 0 },
        },
      ],
      specificity: { a: 0, b: 2, c: 1 },
      key: ".bar",
    },
    specificity: { a: 0, b: 3, c: 1 },
    key: ".bar",
  });
});

test(".parse() parses a simple selector relative to a compound selector", (t) => {
  t.deepEqual(serialize(".foo > div.bar"), {
    type: "complex",
    combinator: Combinator.DirectDescendant,
    left: {
      type: "class",
      name: "foo",
      specificity: { a: 0, b: 1, c: 0 },
      key: ".foo",
    },
    right: {
      type: "compound",
      selectors: [
        {
          type: "type",
          name: "div",
          namespace: null,
          specificity: { a: 0, b: 0, c: 1 },
          key: "div",
        },
        {
          type: "class",
          name: "bar",
          specificity: { a: 0, b: 1, c: 0 },
          key: ".bar",
        },
      ],
      specificity: { a: 0, b: 1, c: 1 },
      key: ".bar",
    },
    specificity: { a: 0, b: 2, c: 1 },
    key: ".bar",
  });
});

test(".parse() parses a relative selector relative to a compound selector", (t) => {
  t.deepEqual(serialize(".foo > .bar + div.baz"), {
    type: "complex",
    combinator: Combinator.DirectSibling,
    left: {
      type: "complex",
      combinator: Combinator.DirectDescendant,
      left: {
        type: "class",
        name: "foo",
        specificity: { a: 0, b: 1, c: 0 },
        key: ".foo",
      },
      right: {
        type: "class",
        name: "bar",
        specificity: { a: 0, b: 1, c: 0 },
        key: ".bar",
      },
      specificity: { a: 0, b: 2, c: 0 },
      key: ".bar",
    },
    right: {
      type: "compound",
      selectors: [
        {
          type: "type",
          name: "div",
          namespace: null,
          specificity: { a: 0, b: 0, c: 1 },
          key: "div",
        },
        {
          type: "class",
          name: "baz",
          specificity: { a: 0, b: 1, c: 0 },
          key: ".baz",
        },
      ],
      specificity: { a: 0, b: 1, c: 1 },
      key: ".baz",
    },
    specificity: { a: 0, b: 3, c: 1 },
    key: ".baz",
  });
});

test("match() matches descendant selector (hit)", (t) => {
  const selector = parse("main span");

  const target = <span></span>;
  h.document([
    <main>
      <div>
        <div>
          <div>{target}</div>
        </div>
      </div>
    </main>,
  ]);

  t.equal(selector.matches(target), true);
});

test("match() matches descendant selector (miss)", (t) => {
  const selector = parse("main b");

  const target = <span></span>;
  h.document([
    <main>
      <div>
        <div>
          <div>{target}</div>
        </div>
      </div>
    </main>,
  ]);

  t.equal(selector.matches(target), false);
});
