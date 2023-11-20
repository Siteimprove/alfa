import { test } from "@siteimprove/alfa-test";

import { serialize } from "./parser";

test(".parse() parses a compound selector", (t) => {
  t.deepEqual(serialize("#foo.bar"), {
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

test(".parse() parses a compound selector with a type in prefix position", (t) => {
  t.deepEqual(serialize("div.foo"), {
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

test(".parse() parses an attribute selector when part of a compound selector", (t) => {
  t.deepEqual(serialize(".foo[foo]"), {
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

test(".parse() parses a pseudo-element selector when part of a compound selector", (t) => {
  t.deepEqual(serialize(".foo::before"), {
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

test(".parse() parses a pseudo-class selector when part of a compound selector", (t) => {
  t.deepEqual(serialize("div:hover"), {
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
