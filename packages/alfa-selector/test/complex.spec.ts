import { test } from "@siteimprove/alfa-test";

import { Combinator } from "../src";
import { serialize } from "./parser";

test(".parse() parses a single descendant selector", (t) => {
  t.deepEqual(serialize("div .foo"), {
    type: "complex",
    combinator: Combinator.Descendant,
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
  t.deepEqual(serialize("div span"), {
    type: "complex",
    combinator: Combinator.Descendant,
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
  t.deepEqual(serialize("div > .foo"), {
    type: "complex",
    combinator: Combinator.DirectDescendant,
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
  t.deepEqual(serialize("div ~ .foo"), {
    type: "complex",
    combinator: Combinator.Sibling,
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
  t.deepEqual(serialize("div + .foo"), {
    type: "complex",
    combinator: Combinator.DirectSibling,
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

test(".parse() parses a compound selector relative to a class selector", (t) => {
  t.deepEqual(serialize(".foo div.bar"), {
    type: "complex",
    combinator: Combinator.Descendant,
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
  t.deepEqual(serialize("span.foo div.bar"), {
    type: "complex",
    combinator: Combinator.Descendant,
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

test(".parse() parses an attribute selector when part of a descendant selector", (t) => {
  t.deepEqual(serialize("div [foo]"), {
    type: "complex",
    combinator: Combinator.Descendant,
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
  t.deepEqual(serialize(".foo div[foo]"), {
    type: "complex",
    combinator: Combinator.Descendant,
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

test(".parse() parses a pseudo-element selector when part of a descendant selector", (t) => {
  t.deepEqual(serialize("div ::before"), {
    type: "complex",
    combinator: Combinator.Descendant,
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
  t.deepEqual(serialize(".foo div::before"), {
    type: "complex",
    combinator: Combinator.Descendant,
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

test(".parse() parses a pseudo-class selector when part of a compound selector relative to a class selector", (t) => {
  t.deepEqual(serialize(".foo div:hover"), {
    type: "complex",
    combinator: Combinator.Descendant,
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
  t.deepEqual(serialize(".foo div.bar:hover"), {
    type: "complex",
    combinator: Combinator.Descendant,
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
  t.deepEqual(serialize(".foo > div.bar"), {
    type: "complex",
    combinator: Combinator.DirectDescendant,
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
  t.deepEqual(serialize(".foo > .bar + div.baz"), {
    type: "complex",
    combinator: Combinator.DirectSibling,
    left: {
      type: "complex",
      combinator: Combinator.DirectDescendant,
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
