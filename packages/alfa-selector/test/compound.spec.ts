import { test } from "@siteimprove/alfa-test";

import { serialize } from "./parser";

test(".parse() parses a compound selector", (t) => {
  t.deepEqual(serialize("#foo.bar"), {
    type: "compound",
    selectors: [
      { type: "id", name: "foo" },
      { type: "class", name: "bar" },
    ],
  });
});

test(".parse() parses a compound selector with a type in prefix position", (t) => {
  t.deepEqual(serialize("div.foo"), {
    type: "compound",
    selectors: [
      { type: "type", name: "div", namespace: null },
      { type: "class", name: "foo" },
    ],
  });
});

test(".parse() parses an attribute selector when part of a compound selector", (t) => {
  t.deepEqual(serialize(".foo[foo]"), {
    type: "compound",
    selectors: [
      { type: "class", name: "foo" },
      {
        type: "attribute",
        name: "foo",
        namespace: null,
        value: null,
        matcher: null,
        modifier: null,
      },
    ],
  });
});

test(".parse() parses a pseudo-element selector when part of a compound selector", (t) => {
  t.deepEqual(serialize(".foo::before"), {
    type: "compound",
    selectors: [
      { type: "class", name: "foo" },
      { type: "pseudo-element", name: "before" },
    ],
  });
});

test(".parse() parses a pseudo-class selector when part of a compound selector", (t) => {
  t.deepEqual(serialize("div:hover"), {
    type: "compound",
    selectors: [
      { type: "type", name: "div", namespace: null },
      { type: "pseudo-class", name: "hover" },
    ],
  });
});
